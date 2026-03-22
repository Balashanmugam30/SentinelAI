'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCards from '@/components/DashboardCards';
import FraudMeter from '@/components/FraudMeter';
import AlertBanner from '@/components/AlertBanner';
import HardwarePanel from '@/components/HardwarePanel';
import ThreatTimeline from '@/components/ThreatTimeline';
import store from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';
import {
  mockThreatAlerts,
  mockThreatChartData,
  mockScamCategoryData,
  mockDashboardStats,
  mockTimelineEvents,
} from '@/lib/mock-data';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { t, language, langInfo } = useLanguage();
  const [storeStats, setStoreStats] = useState(store.getDashboardStats());
  const [recordedCalls, setRecordedCalls] = useState(store.getRecordedCalls());
  const [timelineEvents, setTimelineEvents] = useState(store.getTimelineEvents());
  const [gamification, setGamification] = useState(store.getGamification());

  useEffect(() => {
    return store.subscribe(() => {
      setStoreStats(store.getDashboardStats());
      setRecordedCalls(store.getRecordedCalls());
      setTimelineEvents(store.getTimelineEvents());
      setGamification(store.getGamification());
    });
  }, []);

  const totalCalls = mockDashboardStats.callsAnalyzed + storeStats.callsAnalyzed;
  const totalBlocked = mockDashboardStats.threatsBlocked + storeStats.threatsBlocked;
  const protectionScore = storeStats.callsAnalyzed > 0 ? storeStats.protectionScore : mockDashboardStats.protectionScore;
  const activeThreats = mockDashboardStats.activeThreats + storeStats.activeThreats;

  const statCards = [
    { label: t.totalCalls, value: totalCalls.toLocaleString(), change: '12%', trend: 'up' as const, icon: '📞', color: '#6366f1' },
    { label: t.threatsBlocked, value: totalBlocked.toString(), change: '8%', trend: 'up' as const, icon: '🛡️', color: '#ef4444' },
    { label: t.protectionScore, value: `${protectionScore}%`, change: '2%', trend: 'up' as const, icon: '✅', color: '#10b981' },
    { label: t.activeThreats, value: activeThreats.toString(), change: '5%', trend: 'down' as const, icon: '⚠️', color: '#f59e0b' },
  ];

  const mergedTimeline = timelineEvents.length > 0
    ? timelineEvents.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        eventType: (e.type === 'threat' ? 'alert_triggered' : e.type === 'evidence' ? 'report_generated' : e.type === 'report' ? 'report_generated' : e.type === 'achievement' ? 'ai_analysis' : 'call_detected') as 'call_detected' | 'score_increased' | 'alert_triggered' | 'report_generated' | 'ai_analysis' | 'system_reset',
        riskLevel: e.severity as 'low' | 'medium' | 'high' | 'critical' | 'info',
        description: e.title,
        details: e.description,
      }))
    : mockTimelineEvents;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-white">{t.securityCenter}</h1>
              <p className="text-sm text-white/40 mt-1">
                {language !== 'en' && <span className="inline-flex items-center gap-1 mr-2 text-indigo-400 text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full">{langInfo.flag} {langInfo.nativeName}</span>}
                {t.realtimeMonitoring}
              </p>
            </div>
            {gamification.level > 1 && (
              <div className="flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-medium text-indigo-300">Level {gamification.level} — {gamification.xp} XP</span>
              </div>
            )}
          </div>
        </motion.div>

        <AlertBanner alerts={mockThreatAlerts} />
        <DashboardCards cards={statCards} />

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-white/60 mb-4 self-start">{t.fraudRiskScore}</h2>
            <FraudMeter score={protectionScore > 50 ? 100 - protectionScore : 35} riskLevel="medium" />
          </motion.div>
          <HardwarePanel riskLevel="medium" riskScore={35} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-4">{t.threatDetection}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockThreatChartData}>
                  <defs>
                    <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                    <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="url(#threatGrad)" strokeWidth={2} name="Threats" />
                  <Area type="monotone" dataKey="blocked" stroke="#10b981" fill="url(#blockedGrad)" strokeWidth={2} name="Blocked" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white/60 mb-4">{t.scamBreakdown}</h3>
            <div className="h-64 flex flex-col sm:flex-row items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={mockScamCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                    {mockScamCategoryData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {mockScamCategoryData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs text-white/50 flex-1">{item.name}</span>
                    <span className="text-xs text-white/70 font-mono">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <ThreatTimeline events={mergedTimeline} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/60">{t.recentCalls}</h3>
            {recordedCalls.length > 0 && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">{recordedCalls.length} live</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-3 text-xs text-white/30 font-medium">{t.phoneNumber}</th>
                  <th className="text-left py-3 px-3 text-xs text-white/30 font-medium">Time</th>
                  <th className="text-left py-3 px-3 text-xs text-white/30 font-medium">{t.context}</th>
                  <th className="text-left py-3 px-3 text-xs text-white/30 font-medium">{t.aiScore}</th>
                  <th className="text-left py-3 px-3 text-xs text-white/30 font-medium">Type</th>
                  <th className="text-left py-3 px-3 text-xs text-white/30 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recordedCalls.slice(0, 6).map(call => (
                  <tr key={call.callId} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-white/70">{call.phoneNumber}</td>
                    <td className="py-3 px-3 text-xs text-white/50">{new Date(call.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-3 text-xs text-white/50">{call.context}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={`h-full rounded-full ${call.riskScore >= 80 ? 'bg-red-500' : call.riskScore >= 60 ? 'bg-orange-500' : call.riskScore >= 30 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${call.riskScore}%` }} />
                        </div>
                        <span className="text-xs font-mono text-white/60">{call.riskScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-white/50">{call.scamType}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${call.status === 'blocked' ? 'bg-red-500/10 text-red-400' : call.status === 'analyzed' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>{call.status}</span>
                    </td>
                  </tr>
                ))}
                {recordedCalls.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-xs text-white/30">No calls analyzed yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
