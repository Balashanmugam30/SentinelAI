'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import TranscriptPanel from '@/components/TranscriptPanel';
import FraudMeter from '@/components/FraudMeter';
import HardwarePanel from '@/components/HardwarePanel';
import { DEMO_TRANSCRIPT } from '@/lib/mock-data';
import store from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';
import { speakText as speakWithSystem, stopSpeech } from '@/lib/speech';

const SplineScene = dynamic(() => import('@/components/SplineScene'), { ssr: false });

interface AnalysisResult {
  fraudScore: number;
  riskLevel: string;
  scamType: string;
  confidence: number;
  context: string;
  reasoning: string;
  explanation: string;
  aiSource: string;
  originalLanguage: string;
  translatedText?: string;
  triggers: Array<{ category: string; keyword: string; points: number; description: string }>;
}

export default function VoiceAssistantPage() {
  const { t, language, langInfo } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evidenceCaptured, setEvidenceCaptured] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(false);

  const speakText = useCallback((text: string) => {
    setIsSpeaking(true);
    speakWithSystem(text, language);
    // Rough estimate for speaking duration to turn off animation
    setTimeout(() => setIsSpeaking(false), Math.max(text.length * 60, 2000));
  }, [language]);

  // Send raw text — API handles detection, translation, and analysis
  const analyzeTranscript = useCallback(async (text: string, phoneNumber?: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setEvidenceCaptured(false);

    try {
      const res = await fetch('/api/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, phoneNumber, targetLanguage: language }),
      });
      const data = await res.json();
      if (data.success) {
        const result: AnalysisResult = {
          fraudScore: data.data.fraudScore,
          riskLevel: data.data.riskLevel,
          scamType: data.data.scamType,
          confidence: data.data.confidence,
          context: data.data.context,
          reasoning: data.data.reasoning,
          explanation: data.data.explanation,
          aiSource: data.data.aiSource,
          originalLanguage: data.data.originalLanguage,
          translatedText: data.data.translatedText,
          triggers: data.data.triggers || [],
        };
        setAnalysis(result);

        store.recordCall({
          timestamp: new Date().toISOString(),
          transcript: data.data.translatedText || text,
          phoneNumber: phoneNumber || 'Unknown',
          duration: '0:00',
          riskScore: result.fraudScore,
          riskLevel: result.riskLevel,
          scamType: result.scamType,
          context: result.context,
          confidence: result.confidence,
          reasoning: result.reasoning,
          aiSource: result.aiSource,
          status: result.fraudScore >= 60 ? 'blocked' : result.fraudScore >= 35 ? 'analyzed' : 'safe',
        });

        if (result.fraudScore >= 70) setEvidenceCaptured(true);
        if (result.fraudScore > 80) {
          try {
            fetch(`http://10.96.255.184/risk?value=${result.fraudScore}`, {
              method: 'GET',
              mode: 'no-cors'
            }).catch(() => {});
          } catch (e) {
            console.warn("Hardware alert unavailable");
          }
          speakText("Warning. A potential scam has been detected. Do not share sensitive information.");
        } else {
          speakText(result.reasoning);
        }
      }
    } catch {
      setAnalysis({
        fraudScore: 0, riskLevel: 'low', scamType: 'Unknown', confidence: 50,
        context: 'Analysis Unavailable', reasoning: 'API unavailable.',
        explanation: '', aiSource: 'local', originalLanguage: 'en', triggers: [],
      });
    }
    setIsAnalyzing(false);
  }, [speakText, language]);

  const scheduleLiveAnalysis = useCallback((text: string) => {
    if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
    analysisTimeoutRef.current = setTimeout(() => {
      if (text.split(' ').length >= 5) analyzeTranscript(text);
    }, 2500);
  }, [analyzeTranscript]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition not supported. Try Chrome.'); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    const voiceMapping: Record<string, string> = {
      ta: 'ta-IN',
      te: 'te-IN',
      hi: 'hi-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
      en: 'en-IN',
    };
    recognition.lang = voiceMapping[language] || 'en-IN';
    
    // Voice interrupt: Stop audio if user speaks
    (recognition as any).onspeechstart = () => {
      stopSpeech();
      setIsSpeaking(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let ft = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        ft += event.results[i][0].transcript;
      }
      
      const lower = ft.toLowerCase();
      const wakeWordIndex = lower.indexOf('sentinel');
      
      if (wakeWordIndex !== -1) {
        // Extract command after wake word
        const commandText = ft.substring(wakeWordIndex + 8).trim();
        setTranscript(commandText);
        if (commandText.length > 2) analyzeTranscript(commandText);
      } else {
        setTranscript(prev => prev + ' ' + ft);
      }
    };
    
    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };
    
    recognition.onend = () => {
      // Continuous mode: Restart if manually not stopped
      if (isListeningRef.current) {
        try { recognition.start(); } catch (e) {}
      } else {
        setIsListening(false);
      }
    };
    
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    isListeningRef.current = true;
  }, [analyzeTranscript, language]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    if (transcript.trim()) analyzeTranscript(transcript);
  }, [transcript, analyzeTranscript]);

  const runSimulation = useCallback(() => {
    setTranscript('');
    setAnalysis(null);
    setEvidenceCaptured(false);
    window.speechSynthesis?.cancel();
    const words = DEMO_TRANSCRIPT.split(' ');
    let current = '';
    words.forEach((word, i) => {
      setTimeout(() => { current += (i > 0 ? ' ' : '') + word; setTranscript(current); }, i * 150);
    });
    setTimeout(() => analyzeTranscript(DEMO_TRANSCRIPT), words.length * 150 + 500);
  }, [analyzeTranscript]);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current); };
  }, []);

  const riskLevel = (analysis?.riskLevel || 'low') as 'low' | 'medium' | 'high' | 'critical';
  const LANG_NAMES: Record<string, string> = { ta: 'Tamil', te: 'Telugu', hi: 'Hindi', ml: 'Malayalam', kn: 'Kannada' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">{t.voiceAssistant}</h1>
          <p className="text-sm text-white/40 mt-1">
            {language !== 'en' && <span className="inline-flex items-center gap-1 mr-2 text-indigo-400 text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full">{langInfo.flag} {langInfo.nativeName}</span>}
            AI-powered real-time voice analysis
          </p>
        </motion.div>

        <AnimatePresence>
          {evidenceCaptured && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-3">
              <span className="text-lg">📸</span>
              <div><p className="text-sm font-semibold text-red-400">{t.evidenceCaptured}</p><p className="text-[11px] text-red-400/60">{t.evidenceStored}</p></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden relative h-[200px] sm:h-[250px] lg:h-[300px]">
              <SplineScene scene="https://prod.spline.design/3n8bMic3y4tRu6p3/scene.splinecode" className="w-full h-full" isSpeaking={isSpeaking} />
              {isListening && !isSpeaking && <motion.div className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl pointer-events-none" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />}
              {isSpeaking && (
                <motion.div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-4 py-1.5 backdrop-blur-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <motion.div className="flex gap-0.5" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    {[...Array(4)].map((_, i) => (<motion.div key={i} className="w-1 bg-indigo-400 rounded-full" animate={{ height: [4, 12 + Math.random() * 8, 4] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />))}
                  </motion.div>
                  <span className="text-[10px] font-medium text-indigo-300">Speaking...</span>
                </motion.div>
              )}
            </motion.div>

            <div className="flex flex-wrap gap-3">
              <button onClick={isListening ? stopListening : startListening} className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass-button-primary'}`}>
                {isListening ? `⏹ ${t.stopListening}` : `🎙️ ${t.startListening}`}
              </button>
              <button onClick={runSimulation} className="glass-button px-4">▶ {t.demo}</button>
              <button onClick={() => { if (transcript) analyzeTranscript(transcript); }} disabled={!transcript || isAnalyzing} className="glass-button px-4 disabled:opacity-30">🧠</button>
            </div>

            <TranscriptPanel transcript={transcript} />

            {/* Translation indicator — shown when API detected non-English */}
            {analysis?.translatedText && analysis.originalLanguage !== 'en' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                    {t.translatedFrom} {LANG_NAMES[analysis.originalLanguage] || analysis.originalLanguage}
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{analysis.translatedText}</p>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/60">{t.fraudRiskScore}</h3>
                {analysis && <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${analysis.aiSource === 'groq' ? 'bg-purple-500/10 text-purple-400' : analysis.aiSource === 'gemini' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/[0.05] text-white/40'}`}>{analysis.aiSource?.toUpperCase()}</span>}
              </div>
              <FraudMeter score={analysis?.fraudScore || 0} riskLevel={riskLevel} />
              {analysis && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center"><p className="text-[10px] text-white/30">{t.aiScore}</p><p className="text-lg font-bold text-white">{analysis.fraudScore}%</p></div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center"><p className="text-[10px] text-white/30">{t.confidence}</p><p className="text-lg font-bold text-indigo-400">{analysis.confidence}%</p></div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center"><p className="text-[10px] text-white/30">{t.context}</p><p className="text-xs font-medium text-white/70 mt-1">{analysis.context}</p></div>
                </div>
              )}
            </motion.div>

            <HardwarePanel riskLevel={riskLevel} riskScore={analysis?.fraudScore || 0} />

            {analysis && analysis.triggers.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white/60 mb-3">{t.triggers}</h3>
                <div className="space-y-2">
                  {analysis.triggers.map((tr, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                      <div><span className="text-xs font-medium text-red-400">{tr.category}</span><p className="text-[11px] text-white/40 mt-0.5">{tr.description}</p></div>
                      <span className="text-xs font-mono text-red-400/80">+{tr.points}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {(analysis?.reasoning || isAnalyzing) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🤖</span>
                    <h3 className="text-sm font-semibold text-white/60">{t.aiReasoning}</h3>
                    {isAnalyzing && <div className="h-3 w-3 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />}
                    {isSpeaking && <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full font-medium ml-auto">🔊</span>}
                  </div>
                  {isAnalyzing ? <p className="text-xs text-white/40 animate-pulse">{t.analyzing}</p> : <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{analysis?.reasoning}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
