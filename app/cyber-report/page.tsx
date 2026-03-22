'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import store from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';

interface ReportData {
  reportId: string;
  phoneNumber: string;
  description: string;
  translatedDescription: string;
  translatedTranscript: string;
  originalLanguage: string;
  callType: string;
  transcript: string;
  riskScore: number;
  riskLevel: string;
  scamType: string;
  context: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
  status: string;
}

export default function CyberReportPage() {
  const { t, language, langInfo } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [callType, setCallType] = useState('Unknown Scam');
  const [transcript, setTranscript] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPoliceReport, setShowPoliceReport] = useState(false);
  const [evidenceLogs, setEvidenceLogs] = useState(store.getEvidenceLogs());
  const [reportedNumbers, setReportedNumbers] = useState(store.getReportedNumbers());

  const LANG_NAMES: Record<string, string> = { ta: 'Tamil', te: 'Telugu', hi: 'Hindi', ml: 'Malayalam', kn: 'Kannada' };

  useEffect(() => {
    return store.subscribe(() => {
      setEvidenceLogs(store.getEvidenceLogs());
      setReportedNumbers(store.getReportedNumbers());
    });
  }, []);

  const handleSubmit = async () => {
    if (!phoneNumber || !description) return;
    setLoading(true);

    let analysisData: Record<string, unknown> = {};
    let translatedDesc = '';
    let translatedTranscript = '';

    // Send raw text directly — API handles detection + translation
    if (transcript || description) {
      try {
        const analysisTarget = transcript || description;
        const res = await fetch('/api/analyze-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: analysisTarget, phoneNumber, targetLanguage: language }),
        });
        const data = await res.json();
        if (data.success) {
          analysisData = data.data;
          translatedDesc = (data.data.translatedText as string) || '';
          translatedTranscript = (data.data.translatedText as string) || '';
        }
      } catch { /* Continue */ }
    }

    const reportData = {
      reportId: `SR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
      phoneNumber,
      description,
      translatedDescription: translatedDesc,
      translatedTranscript,
      originalLanguage: (analysisData.originalLanguage as string) || 'en',
      callType,
      transcript: transcript || 'Not available',
      riskScore: (analysisData.fraudScore as number) || 0,
      riskLevel: (analysisData.riskLevel as string) || 'low',
      scamType: (analysisData.scamType as string) || callType,
      context: (analysisData.context as string) || 'Report Submission',
      confidence: (analysisData.confidence as number) || 0,
      reasoning: (analysisData.reasoning as string) || description,
      timestamp: new Date().toISOString(),
      status: 'submitted',
    };

    setReport(reportData);
    store.submitReport(phoneNumber, reportData.scamType);

    if (transcript) {
      store.recordCall({
        timestamp: reportData.timestamp,
        transcript: translatedTranscript || transcript,
        phoneNumber,
        duration: '0:00',
        riskScore: reportData.riskScore,
        riskLevel: reportData.riskLevel,
        scamType: reportData.scamType,
        context: reportData.context,
        confidence: reportData.confidence,
        reasoning: reportData.reasoning,
        aiSource: (analysisData.aiSource as string) || 'local',
        status: 'blocked',
      });
    }

    if (reportData.riskScore >= 90) setShowPoliceReport(true);
    setLoading(false);
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('SentinelAI Cybercrime Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Report ID: ${report?.reportId}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text(`Phone Number: ${phoneNumber}`, 20, 55);
    doc.text(`Call Type: ${callType}`, 20, 62);
    doc.text(`Risk: ${report?.riskScore}% — ${report?.riskLevel}`, 20, 69);
    doc.text(`Scam Type: ${report?.scamType}`, 20, 76);
    const origLang = report?.originalLanguage;
    if (origLang && origLang !== 'en') {
      doc.text(`Original Language: ${LANG_NAMES[origLang] || origLang}`, 20, 83);
      doc.text('', 20, 90);
      doc.text(`Description (${LANG_NAMES[origLang]}): ${description.substring(0, 500)}`, 20, 97);
      const td = report?.translatedDescription;
      if (td) doc.text(`Description (English): ${td.substring(0, 500)}`, 20, 104);
    } else {
      doc.text('Description:', 20, 83);
      const lines = doc.splitTextToSize(description, 170);
      doc.text(lines, 20, 90);
    }
    doc.save(`SentinelAI_Report_${report?.reportId}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">{t.cyberReport}</h1>
          <p className="text-sm text-white/40 mt-1">
            {language !== 'en' && <span className="inline-flex items-center gap-1 mr-2 text-indigo-400 text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full">{langInfo.flag} {langInfo.nativeName}</span>}
            Report scam calls — supports all regional languages
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white/60">{t.reportScam}</h3>
            <div><label className="text-xs text-white/40 block mb-1.5">{t.phoneNumber}</label><input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="glass-input" placeholder="+91 XXXXX XXXXX" /></div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">{t.callType}</label>
              <select value={callType} onChange={e => setCallType(e.target.value)} className="glass-input appearance-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.8)' }}>
                {['Unknown Scam', 'Bank Scam', 'OTP Scam', 'UPI Fraud', 'Delivery Scam', 'Tech Support Scam', 'Loan Fraud', 'KYC Scam'].map(opt => (
                  <option key={opt} value={opt} style={{ backgroundColor: '#111118', color: '#e5e5e5' }}>{opt}</option>
                ))}
              </select>
            </div>
            <div><label className="text-xs text-white/40 block mb-1.5">{t.description}</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="glass-input min-h-[100px] resize-none" placeholder="Describe in any language..." /></div>
            <div><label className="text-xs text-white/40 block mb-1.5">{t.transcript}</label><textarea value={transcript} onChange={e => setTranscript(e.target.value)} className="glass-input min-h-[80px] resize-none font-mono text-xs" placeholder="Paste call transcript in any language..." /></div>
            <button onClick={handleSubmit} disabled={loading || !phoneNumber || !description} className="glass-button-primary w-full disabled:opacity-30">
              {loading ? `🔄 ${t.submitting}` : `📋 ${t.submitReport}`}
            </button>
          </motion.div>

          <div className="space-y-4">
            {/* Dual language display */}
            <AnimatePresence>
              {report && report.originalLanguage !== 'en' && report.translatedDescription && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
                  <p className="text-[10px] font-semibold text-indigo-400 mb-2">
                    🌐 {LANG_NAMES[report.originalLanguage] || 'Regional'} → English pipeline
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><p className="text-[10px] text-white/30 mb-1">{t.original}</p><p className="text-xs text-white/50">{description.substring(0, 200)}</p></div>
                    <div><p className="text-[10px] text-white/30 mb-1">{t.translated}</p><p className="text-xs text-white/50">{report.translatedDescription?.substring(0, 200)}</p></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {report && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/60">{t.generatedReport}</h3>
                    <span className="text-xs font-mono text-indigo-400">{report.reportId}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: t.phoneNumber, value: report.phoneNumber },
                      { label: t.callType, value: report.scamType },
                      { label: t.aiScore, value: `${report.riskScore}%` },
                      { label: t.context, value: report.context },
                      { label: t.confidence, value: `${report.confidence}%` },
                      { label: 'Risk', value: report.riskLevel?.toUpperCase() },
                    ].map(item => (
                      <div key={item.label} className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
                        <p className="text-[10px] text-white/30">{item.label}</p>
                        <p className="text-sm text-white/80 font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={exportPDF} className="glass-button flex-1">📄 {t.exportPDF}</button>
                    {showPoliceReport && <button onClick={exportPDF} className="flex-1 rounded-xl py-2.5 text-sm font-semibold bg-red-500/20 text-red-400 border border-red-500/30">🚔 Police Report</button>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white/60 mb-3">{t.evidenceLogs} ({evidenceLogs.length})</h3>
              {evidenceLogs.length === 0 ? (
                <p className="text-xs text-white/30 py-4 text-center">No evidence captured yet.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {evidenceLogs.slice(0, 10).map(ev => (
                    <div key={ev.evidenceId} className="rounded-xl bg-white/[0.02] border border-red-500/10 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-red-400">{ev.evidenceId}</span>
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">📸</span>
                      </div>
                      <p className="text-xs text-white/60">{ev.scamType} — {ev.context}</p>
                      <p className="text-[10px] text-white/30 line-clamp-2 mt-1">{ev.transcript.substring(0, 120)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white/60 mb-3">{t.communityReputation} ({reportedNumbers.length})</h3>
              {reportedNumbers.length === 0 ? (
                <p className="text-xs text-white/30 py-4 text-center">No numbers reported yet.</p>
              ) : (
                <div className="space-y-2">
                  {reportedNumbers.slice(0, 5).map(rep => (
                    <div key={rep.phoneNumber} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] px-4 py-3">
                      <div><span className="text-sm font-mono text-white/70">{rep.phoneNumber}</span><p className="text-[10px] text-white/30 mt-0.5">{rep.reportCount} reports</p></div>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${rep.riskLevel === 'critical' ? 'bg-red-500/10 text-red-400' : rep.riskLevel === 'high' ? 'bg-orange-500/10 text-orange-400' : rep.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>{rep.riskLevel}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
