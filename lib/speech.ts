// Declare global to allow other modules to access it natively per instructions
declare global {
  interface Window { currentAudio: HTMLAudioElement | null; }
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.currentAudio) {
    window.currentAudio.pause();
    window.currentAudio.currentTime = 0;
    window.currentAudio = null;
  }
}

export async function speakText(text: string, languageCode: string) {
  if (typeof window === 'undefined') return;

  stopSpeech();

  // 1. Language mappings (for fallback browser TTS)
  const voiceMapping: Record<string, string> = {
    ta: 'ta-IN',
    te: 'te-IN',
    hi: 'hi-IN',
    ml: 'ml-IN',
    kn: 'kn-IN',
    en: 'en-IN',
  };

  const targetLang = voiceMapping[languageCode] || 'en-IN';

  // Fallback Playback logic
  const speakFallback = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.lang.startsWith(targetLang));
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = targetLang;
    window.speechSynthesis.speak(utterance);
  };

  try {
    const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) throw new Error("Missing ElevenLabs API Key");

    const VOICE_ID = "pNInz6obpgDQGcFmaJcg"; // Adam (Jarvis-like voice)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        // The model automatically generates correct pronunciation. Do NOT translate before sending.
      }),
    });

    if (!response.ok) {
      console.warn("ElevenLabs TTS failed, running fallback.");
      speakFallback();
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.currentAudio = new Audio(url);
    
    window.currentAudio.onended = () => {
      URL.revokeObjectURL(url);
    };

    await window.currentAudio.play();
  } catch (error) {
    console.warn("Error playing ElevenLabs TTS, running fallback.", error);
    speakFallback();
  }
}

