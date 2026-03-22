import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithAI } from '@/lib/ai-analysis';

// Internal translation helper — calls our own /api/translate
async function translateText(text: string, from: string, to: string, baseUrl: string): Promise<string> {
  if (from === to) return text;
  try {
    const res = await fetch(`${baseUrl}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to }),
    });
    const data = await res.json();
    return data.translated || text;
  } catch {
    return text;
  }
}

async function detectLanguage(text: string, baseUrl: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, action: 'detect' }),
    });
    const data = await res.json();
    return data.detectedLanguage || 'en';
  } catch {
    return 'en';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, phoneNumber, targetLanguage } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Determine base URL for internal API calls
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${proto}://${host}`;

    // ===== STEP 1: Detect language =====
    const detectedLanguage = await detectLanguage(transcript, baseUrl);

    // ===== STEP 2: Translate to English if needed =====
    let englishTranscript = transcript;
    if (detectedLanguage !== 'en') {
      englishTranscript = await translateText(transcript, detectedLanguage, 'en', baseUrl);
    }

    // ===== STEP 3 & 4: Run AI analysis on ENGLISH text =====
    const result = await analyzeWithAI(englishTranscript);

    // ===== STEP 5: Translate results back if needed =====
    const responseLanguage = targetLanguage || detectedLanguage;
    let translatedReasoning = result.aiResult.reasoning;
    let translatedExplanation = result.explanation;

    if (responseLanguage !== 'en') {
      translatedReasoning = await translateText(result.aiResult.reasoning, 'en', responseLanguage, baseUrl);
      translatedExplanation = await translateText(result.explanation, 'en', responseLanguage, baseUrl);
    }

    return NextResponse.json({
      success: true,
      data: {
        phoneNumber: phoneNumber || 'Unknown',
        // Blended score from AI + rule engine on English text
        fraudScore: result.blendedScore,
        riskLevel: result.riskLevel,
        scamType: result.scamType,
        explanation: translatedExplanation,
        // AI-specific structured fields
        aiRiskScore: result.aiResult.riskScore,
        ruleEngineScore: result.fraudResult.score,
        confidence: result.confidence,
        context: result.aiResult.context,
        reasoning: translatedReasoning,
        // Multilingual pipeline info
        originalLanguage: detectedLanguage,
        translatedText: detectedLanguage !== 'en' ? englishTranscript : undefined,
        responseLanguage,
        // Supporting data
        triggers: result.fraudResult.triggers,
        similarPatterns: result.similarPatterns.map(p => ({
          type: p.type, title: p.title, description: p.description, severity: p.severity,
        })),
        aiSource: result.source,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Analyze call error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
