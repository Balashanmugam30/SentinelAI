import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', ta: 'Tamil', te: 'Telugu', hi: 'Hindi', ml: 'Malayalam', kn: 'Kannada',
};

// Shared AI call helper used by both translate and detect
async function callAI(prompt: string): Promise<string | null> {
  // Try Groq
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.1,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
      }
    }
  } catch { /* fallthrough */ }

  // Try Gemini
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
      }
    }
  } catch { /* fallthrough */ }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, from, to, action } = body;

    // --- Language detection mode ---
    if (action === 'detect') {
      if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

      const detectedLang = detectLanguageLocal(text);
      if (detectedLang !== 'en') {
        return NextResponse.json({ detectedLanguage: detectedLang, source: 'local' });
      }

      // If local detection says English, double-check with AI for mixed scripts
      const aiResult = await callAI(
        `Detect the language of the following text. Return ONLY the ISO 639-1 two-letter language code (en, ta, te, hi, ml, kn). If it's a mix, return the dominant non-English language code. Return ONLY the code, nothing else.\n\nText: "${text}"`
      );
      if (aiResult) {
        const code = aiResult.trim().toLowerCase().replace(/[^a-z]/g, '').substring(0, 2);
        if (['en', 'ta', 'te', 'hi', 'ml', 'kn'].includes(code)) {
          return NextResponse.json({ detectedLanguage: code, source: 'ai' });
        }
      }

      return NextResponse.json({ detectedLanguage: 'en', source: 'local' });
    }

    // --- Translation mode ---
    if (!text || !from || !to) {
      return NextResponse.json({ error: 'text, from, to required' }, { status: 400 });
    }
    if (from === to) return NextResponse.json({ translated: text, source: 'passthrough' });

    const fromName = LANGUAGE_NAMES[from] || from;
    const toName = LANGUAGE_NAMES[to] || to;
    const prompt = `You are a translation engine specialized in Indian languages (Tamil, Telugu, Hindi, Malayalam, Kannada, English). Translate the following text from ${fromName} to ${toName}. Preserve the exact meaning including any technical terms like OTP, KYC, UPI, PIN. Return ONLY the translated text, nothing else.\n\nText: "${text}"`;

    const translated = await callAI(prompt);
    if (translated) {
      // Strip quotes if the AI wrapped the translation in them
      const clean = translated.replace(/^["']|["']$/g, '').trim();
      return NextResponse.json({ translated: clean, source: 'ai' });
    }

    return NextResponse.json({ translated: text, source: 'passthrough', note: 'No AI API available' });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

// Fast local language detection using Unicode ranges
function detectLanguageLocal(text: string): string {
  const counts: Record<string, number> = { ta: 0, te: 0, hi: 0, ml: 0, kn: 0 };

  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code >= 0x0B80 && code <= 0x0BFF) counts.ta++;
    else if (code >= 0x0C00 && code <= 0x0C7F) counts.te++;
    else if (code >= 0x0900 && code <= 0x097F) counts.hi++;
    else if (code >= 0x0D00 && code <= 0x0D7F) counts.ml++;
    else if (code >= 0x0C80 && code <= 0x0CFF) counts.kn++;
  }

  const maxLang = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return maxLang[1] > 2 ? maxLang[0] : 'en';
}
