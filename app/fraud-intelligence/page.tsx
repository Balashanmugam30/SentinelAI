'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { analyzeFraud } from '@/lib/fraud-engine';
import { findSimilarScams, getAllScamPatterns } from '@/lib/rag-system';
import { DEMO_TRANSCRIPT } from '@/lib/mock-data';
import { useLanguage } from '@/lib/language-context';
import { speakText } from '@/lib/speech';

interface ChatMessage { role: 'user' | 'ai'; content: string; }

interface AnalysisData {
  fraudScore: number; riskLevel: string; scamType: string; explanation: string;
  aiRiskScore: number; ruleEngineScore: number; confidence: number; context: string;
  reasoning: string; aiSource: string; originalLanguage: string; translatedText?: string;
  triggers: Array<{ category: string; keyword: string; points: number; description: string }>;
}

export default function FraudIntelligencePage() {
  const { t, language, langInfo, translateFromEnglish } = useLanguage();
  const [analysisText, setAnalysisText] = useState(DEMO_TRANSCRIPT);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [similarPatterns, setSimilarPatterns] = useState<ReturnType<typeof findSimilarScams>>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);

  const LANG_NAMES: Record<string, string> = { ta: 'Tamil', te: 'Telugu', hi: 'Hindi', ml: 'Malayalam', kn: 'Kannada' };

  const riskColor = (level: string) => {
    switch (level) {
      case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      case 'high': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' };
      case 'medium': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' };
      default: return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
    }
  };

  // Send raw text — API handles language detection, translation, and analysis
  const handleAnalyze = async () => {
    if (!analysisText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: analysisText, targetLanguage: language }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisData(data.data);
        // Use translated English text for RAG matching
        setSimilarPatterns(findSimilarScams(data.data.translatedText || analysisText));
        // Record in data store
        const { default: dataStore } = await import('@/lib/data-store');
        dataStore.recordCall({
          timestamp: new Date().toISOString(),
          transcript: data.data.translatedText || analysisText,
          phoneNumber: 'Text Analysis',
          duration: '0:00',
          riskScore: data.data.fraudScore,
          riskLevel: data.data.riskLevel,
          scamType: data.data.scamType,
          context: data.data.context,
          confidence: data.data.confidence,
          reasoning: data.data.reasoning,
          aiSource: data.data.aiSource,
          status: data.data.fraudScore >= 60 ? 'blocked' : data.data.fraudScore >= 35 ? 'analyzed' : 'safe',
        });

        if (data.data.fraudScore > 80) {
          try {
            fetch(`http://10.96.255.184/risk?value=${data.data.fraudScore}`, {
              method: 'GET',
              mode: 'no-cors'
            }).catch(() => {});
          } catch (e) {
            console.warn("Hardware alert unavailable");
          }
          speakText("Warning. A potential scam has been detected. Do not share sensitive information.", language);
        } else {
          speakText(data.data.reasoning, language);
        }
      }
    } catch {
      const result = analyzeFraud(analysisText);
      setAnalysisData({
        fraudScore: result.score, riskLevel: result.riskLevel, scamType: result.scamType,
        explanation: result.triggers.map(tr => tr.description).join('. '),
        aiRiskScore: result.score, ruleEngineScore: result.score, confidence: 65,
        context: result.score > 50 ? 'Suspicious' : 'Low Risk',
        reasoning: result.triggers.length > 0 ? `Detected ${result.triggers.length} fraud indicators.` : 'No indicators.',
        aiSource: 'local', originalLanguage: 'en', triggers: result.triggers,
      });

      if (result.score > 80) {
        try {
          fetch(`http://10.96.255.184/risk?value=${result.score}`, {
            method: 'GET',
            mode: 'no-cors'
          }).catch(() => {});
        } catch (e) {
          console.warn("Hardware alert unavailable");
        }
        speakText("Warning. A potential scam has been detected. Do not share sensitive information.", language);
      } else {
        const fallbackReasoning = result.triggers.length > 0 ? `Detected ${result.triggers.length} fraud indicators.` : 'No indicators.';
        speakText(fallbackReasoning, language);
      }
    }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');

    // Translate user message to English via API, then respond
    let englishInput = userMsg;
    try {
      const detectRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMsg, action: 'detect' }),
      });
      const detectData = await detectRes.json();
      const detectedLang = detectData.detectedLanguage || 'en';

      if (detectedLang !== 'en') {
        const transRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: userMsg, from: detectedLang, to: 'en' }),
        });
        const transData = await transRes.json();
        englishInput = transData.translated || userMsg;
      }
    } catch { /* use original */ }

    const lower = englishInput.toLowerCase();
    let aiResponse = '';

    if (lower.includes('otp')) {
      aiResponse = 'Sharing OTP is extremely dangerous. Banks NEVER ask for OTP over phone calls. However, OTPs for delivery verification or login auth you initiated are legitimate — SentinelAI distinguishes these contexts.';
    } else if (lower.includes('safe') || lower.includes('secure')) {
      aiResponse = 'To stay safe: Never share OTP/PINs. Hang up on urgency callers. Verify via official channels. Report to 1930.';
    } else if (lower.includes('upi') || lower.includes('payment')) {
      aiResponse = 'UPI safety: You never enter PIN to receive money. Beware unknown collect requests.';
    } else if (lower.includes('report')) {
      aiResponse = 'Report scams: 1) Call 1930. 2) cybercrime.gov.in. 3) SentinelAI Cybercrime Report page.';
    } else if (lower.includes('scam') || lower.includes('fraud')) {
      aiResponse = 'Common scams: Bank OTP, UPI fraud, KYC scams, tech support, loan fraud, phishing. SentinelAI uses contextual AI across 6 languages.';
    } else {
      const patterns = getAllScamPatterns();
      const tips = patterns.flatMap(p => p.preventionTips).slice(0, 3);
      aiResponse = `Security tips:\n${tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\nAsk about OTP, reporting, or scam types!`;
    }

    // Translate response to user's language
    const localizedResponse = await translateFromEnglish(aiResponse);
    speakText(localizedResponse, language);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', content: localizedResponse }]);
    }, 500);
  };

  const colors = analysisData ? riskColor(analysisData.riskLevel) : riskColor('low');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">{t.fraudIntelligence}</h1>
          <p className="text-sm text-white/40 mt-1">
            {language !== 'en' && <span className="inline-flex items-center gap-1 mr-2 text-indigo-400 text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full">{langInfo.flag} {langInfo.nativeName}</span>}
            AI-powered contextual scam analysis — supports Tamil, Telugu, Hindi, Malayalam, Kannada
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white/60 mb-3">{t.analyzeText}</h3>
              <textarea value={analysisText} onChange={e => setAnalysisText(e.target.value)} className="glass-input min-h-[120px] resize-none font-mono text-xs" placeholder="Paste a call transcript in any language (Tamil, Telugu, Hindi, Malayalam, Kannada, English)..." />
              <button onClick={handleAnalyze} disabled={loading} className="glass-button-primary w-full mt-3">
                {loading ? `🔄 ${t.analyzing}` : `🧠 ${t.analyzeWithAI}`}
              </button>
            </motion.div>

            {/* Translation pipeline indicator */}
            {analysisData?.translatedText && analysisData.originalLanguage !== 'en' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    🌐 {LANG_NAMES[analysisData.originalLanguage] || analysisData.originalLanguage} → English → AI Analysis
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><p className="text-[10px] text-white/30 mb-1">{t.original} ({LANG_NAMES[analysisData.originalLanguage]})</p><p className="text-xs text-white/50">{analysisText.substring(0, 200)}</p></div>
                  <div><p className="text-[10px] text-white/30 mb-1">{t.translated} (English)</p><p className="text-xs text-white/50">{analysisData.translatedText.substring(0, 200)}</p></div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {analysisData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/60">{t.analysisResults}</h3>
                    <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>{analysisData.riskLevel} — {analysisData.fraudScore}%</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className={`rounded-xl border ${colors.border} bg-white/[0.02] p-3 text-center`}><p className="text-[10px] text-white/30 mb-1">{t.aiScore}</p><p className={`text-xl font-bold ${colors.text}`}>{analysisData.aiRiskScore}%</p></div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"><p className="text-[10px] text-white/30 mb-1">{t.ruleEngine}</p><p className="text-xl font-bold text-white/60">{analysisData.ruleEngineScore}%</p></div>
                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-center"><p className="text-[10px] text-white/30 mb-1">{t.confidence}</p><p className="text-xl font-bold text-indigo-400">{analysisData.confidence}%</p></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3"><p className="text-[10px] text-white/30 mb-1">{t.context}</p><p className="text-sm font-semibold text-white">{analysisData.context}</p></div>
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3"><p className="text-[10px] text-white/30 mb-1">{t.classification}</p><p className="text-sm font-semibold text-white">{analysisData.scamType}</p></div>
                  </div>

                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span>🤖</span><p className="text-xs text-white/40">{t.aiReasoning}</p>
                      <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${analysisData.aiSource === 'groq' ? 'bg-purple-500/10 text-purple-400' : analysisData.aiSource === 'gemini' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/[0.05] text-white/40'}`}>{analysisData.aiSource.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{analysisData.reasoning}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-white/30">Score Composition</p>
                    <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-white/[0.04]">
                      <motion.div className="bg-indigo-500 rounded-l-full" initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ duration: 0.8 }} style={{ opacity: 0.8 }} />
                      <motion.div className="bg-cyan-500 rounded-r-full" initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ duration: 0.8, delay: 0.2 }} style={{ opacity: 0.6 }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30"><span className="text-indigo-400">AI Analysis (70%)</span><span className="text-cyan-400">Rule Engine (30%)</span></div>
                  </div>

                  {analysisData.triggers.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">{t.triggers}</p>
                      <div className="space-y-1.5">
                        {analysisData.triggers.map((tr, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                            <span className="text-xs text-red-400">{tr.category}: <span className="text-white/50">&ldquo;{tr.keyword}&rdquo;</span></span>
                            <span className="text-xs font-mono text-red-400/60">+{tr.points}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {similarPatterns.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white/60 mb-3">{t.similarPatterns}</h3>
                  <div className="space-y-3">
                    {similarPatterns.map(p => (
                      <div key={p.id} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${p.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>{p.severity}</span>
                        </div>
                        <p className="text-xs text-white/50 mb-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1.5">{p.preventionTips.map((tip, i) => (<span key={i} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full">{tip}</span>))}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat — Multilingual */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 flex flex-col h-fit lg:sticky lg:top-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10"><span className="text-lg">🤖</span></div>
              <div><h3 className="text-sm font-semibold text-white">{t.chatAssistant}</h3>
                <p className="text-[10px] text-white/40">{t.askScamSafety} {language !== 'en' ? `(${langInfo.nativeName})` : ''}</p>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] sm:min-h-[400px] max-h-[500px] overflow-y-auto space-y-3 mb-4 pr-1">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-2xl mb-2">🛡️</p><p className="text-sm text-white/30">{t.askScamSafety}</p>
                  <div className="mt-4 space-y-2">
                    {['Is sharing OTP safe?', 'How to report a scam?', 'What are common scam types?'].map(q => (
                      <button key={q} onClick={() => setChatInput(q)} className="block w-full text-left text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 rounded-lg px-3 py-2">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-100 rounded-br-md' : 'bg-white/[0.05] text-white/70 rounded-bl-md'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} className="glass-input flex-1 py-2.5 text-sm" placeholder={`${t.askScamSafety}...`} />
              <button onClick={handleChat} className="glass-button-primary px-4 py-2.5">{t.send}</button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
