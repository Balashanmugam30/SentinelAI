// SentinelAI AI Analysis Module v2
// Architecture: Groq AI → Gemini AI → Rule Engine Fallback
// AI performs primary semantic analysis; rule engine provides secondary signals
// Final score = (AI × 0.7) + (Rule × 0.3), adjusted by RAG similarity

import { analyzeFraud, type FraudResult } from './fraud-engine';
import { findSimilarScams, computeRAGSimilarity, type ScamPattern } from './rag-system';

export interface AIStructuredResult {
  riskScore: number;
  scamType: string;
  reasoning: string;
  confidence: number;
  context: string;
}

export interface AIAnalysisResult {
  fraudResult: FraudResult;
  aiResult: AIStructuredResult;
  blendedScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  scamType: string;
  similarPatterns: ScamPattern[];
  source: 'groq' | 'gemini' | 'local';
  confidence: number;
}

const AI_SYSTEM_PROMPT = `You are a cybersecurity fraud detection AI. Analyze the following message and determine whether it is a scam attempt or a legitimate communication.

CRITICAL INSTRUCTIONS:
- Consider the FULL CONTEXT of the message, not just individual keywords.
- Legitimate scenarios include: delivery OTP verification, password resets the user initiated, customer service callbacks, login authentication, and two-factor verification.
- A message mentioning "OTP" is NOT automatically a scam. Evaluate WHETHER the context is suspicious.
- Scam indicators include: unsolicited contact, urgency/threats, requests for money transfer, impersonation of authority, social engineering tactics, and requests to install remote access software.

Return ONLY a valid JSON object (no markdown, no code fences) with these fields:
{
  "riskScore": <number 0-100>,
  "scamType": "<one of: Bank OTP Scam, UPI Payment Scam, Delivery Scam, Credit Card Scam, Tech Support Scam, Lottery Scam, Identity Theft, Legitimate Communication, Unknown>",
  "reasoning": "<2-3 sentence explanation of your analysis>",
  "confidence": <number 0-100>,
  "context": "<brief label: e.g. Delivery Verification, Bank Impersonation, Login Authentication, Unsolicited Offer, etc.>"
}`;

function buildPrompt(transcript: string): string {
  return `${AI_SYSTEM_PROMPT}

Message to analyze:
"${transcript}"`;
}

function parseAIResponse(text: string): AIStructuredResult | null {
  try {
    // Try to extract JSON from the response
    let jsonStr = text.trim();

    // Remove markdown code fences if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Try to find JSON object in the text
    const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      jsonStr = braceMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    return {
      riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 0)),
      scamType: String(parsed.scamType || 'Unknown'),
      reasoning: String(parsed.reasoning || 'No reasoning provided'),
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 50)),
      context: String(parsed.context || 'Unknown Context'),
    };
  } catch {
    return null;
  }
}

function computeRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

function blendScores(aiScore: number, ruleScore: number, ragSimilarity: number): number {
  // AI dominates (70%), rule engine supports (30%)
  let blended = (aiScore * 0.7) + (ruleScore * 0.3);

  // RAG boost: if high similarity to known scam patterns, nudge score up (max +8)
  if (ragSimilarity > 0.5) {
    blended += ragSimilarity * 8;
  }

  return Math.max(0, Math.min(100, Math.round(blended)));
}

function generateLocalAnalysis(transcript: string, fraudResult: FraudResult, ragSimilarity: number): AIStructuredResult {
  const text = transcript.toLowerCase();

  // Simple contextual checks to reduce false positives
  const deliveryKeywords = ['delivery', 'order', 'package', 'amazon', 'flipkart', 'courier', 'shipping', 'tracking'];
  const loginKeywords = ['login', 'sign in', 'authentication', 'verify your identity', 'two-factor', '2fa'];
  const scamPressure = ['urgent', 'immediately', 'blocked', 'suspended', 'arrested', 'legal action', 'police', 'fine'];

  const hasDeliveryContext = deliveryKeywords.some(k => text.includes(k));
  const hasLoginContext = loginKeywords.some(k => text.includes(k));
  const hasPressure = scamPressure.some(k => text.includes(k));

  // If the rule engine fires but context is benign, reduce score
  if (hasDeliveryContext && !hasPressure && fraudResult.score > 30) {
    return {
      riskScore: Math.min(fraudResult.score * 0.35, 25),
      scamType: 'Delivery Verification',
      reasoning: `The message references OTP or verification in the context of a delivery or order. This is a common legitimate scenario. No urgency tactics or social engineering patterns detected.`,
      confidence: 78,
      context: 'Delivery Verification',
    };
  }

  if (hasLoginContext && !hasPressure && fraudResult.score > 20) {
    return {
      riskScore: Math.min(fraudResult.score * 0.4, 30),
      scamType: 'Legitimate Communication',
      reasoning: `The message appears to be related to login authentication or account verification initiated by the user. No suspicious pressure tactics detected.`,
      confidence: 72,
      context: 'Login Authentication',
    };
  }

  // Otherwise trust the rule engine but frame it properly
  return {
    riskScore: fraudResult.score,
    scamType: fraudResult.scamType,
    reasoning: fraudResult.triggers.length > 0
      ? `Detected ${fraudResult.triggers.length} fraud indicators: ${fraudResult.triggers.map(t => t.description).join('. ')}. ${ragSimilarity > 0.3 ? 'Pattern matches known scam scripts in the database.' : ''}`
      : 'No significant fraud indicators detected. The message appears safe.',
    confidence: 65,
    context: fraudResult.score > 50 ? 'Suspicious Communication' : 'Low Risk Communication',
  };
}

export async function analyzeWithAI(transcript: string): Promise<AIAnalysisResult> {
  const fraudResult = analyzeFraud(transcript);
  const similarPatterns = findSimilarScams(transcript);
  const ragSimilarity = computeRAGSimilarity(transcript);

  let aiResult: AIStructuredResult | null = null;
  let source: 'groq' | 'gemini' | 'local' = 'local';

  // 1. Try Groq API (primary)
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'user', content: buildPrompt(transcript) },
          ],
          max_tokens: 400,
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          aiResult = parseAIResponse(text);
          if (aiResult) source = 'groq';
        }
      }
    }
  } catch {
    console.log('Groq API unavailable, trying Gemini...');
  }

  // 2. Try Gemini API (fallback)
  if (!aiResult) {
    try {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: buildPrompt(transcript) }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            aiResult = parseAIResponse(text);
            if (aiResult) source = 'gemini';
          }
        }
      }
    } catch {
      console.log('Gemini API unavailable, using local analysis...');
    }
  }

  // 3. Local fallback with contextual analysis
  if (!aiResult) {
    aiResult = generateLocalAnalysis(transcript, fraudResult, ragSimilarity);
    source = 'local';
  }

  // Blend AI score with rule engine score
  const blendedScore = blendScores(aiResult.riskScore, fraudResult.score, ragSimilarity);
  const riskLevel = computeRiskLevel(blendedScore);

  // Build explanation
  const explanation = `${aiResult.reasoning}\n\nContext: ${aiResult.context}\nAI Risk Score: ${aiResult.riskScore}% | Rule Engine Score: ${fraudResult.score}% | Blended: ${blendedScore}%\nConfidence: ${aiResult.confidence}% | Source: ${source.toUpperCase()}`;

  return {
    fraudResult,
    aiResult,
    blendedScore,
    riskLevel,
    explanation,
    scamType: aiResult.scamType,
    similarPatterns,
    source,
    confidence: aiResult.confidence,
  };
}
