'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import store from '@/lib/data-store';
import { useLanguage } from '@/lib/language-context';

const LEVEL_TITLES: Record<number, string> = {
  1: 'Rookie', 2: 'Defender', 3: 'Guardian', 4: 'Sentinel', 5: 'Protector',
  6: 'Cyber Knight', 7: 'Cyber Defender', 8: 'Security Expert', 9: 'Elite Analyst', 10: 'Cyber Legend',
};

export default function GamificationPage() {
  const { t, language, langInfo } = useLanguage();
  const [data, setData] = useState(store.getGamification());

  useEffect(() => {
    return store.subscribe(() => setData(store.getGamification()));
  }, []);

  const levelTitle = LEVEL_TITLES[data.level] || `Level ${data.level}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">{t.gamification}</h1>
          <p className="text-sm text-white/40 mt-1">
            {language !== 'en' && <span className="inline-flex items-center gap-1 mr-2 text-indigo-400 text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full">{langInfo.flag} {langInfo.nativeName}</span>}
            Track your cybersecurity progress
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t.safetyScore, value: `${data.safetyScore}%`, icon: '🛡️', sub: `Level ${data.level}` },
            { label: t.protectionStreak, value: `${data.protectionStreak} day${data.protectionStreak > 1 ? 's' : ''}`, icon: '🔥', sub: 'Consecutive' },
            { label: t.threatsBlocked, value: data.threatsBlocked.toString(), icon: '⚔️', sub: 'Blocked' },
            { label: t.reportsSubmitted, value: data.reportsSubmitted.toString(), icon: '📋', sub: 'Filed' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-6 text-center">
              <span className="text-3xl mb-3 block">{stat.icon}</span>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/40">{stat.label}</p>
              <p className="text-xs text-white/20 mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Level {data.level} — {levelTitle}</h3>
              <p className="text-xs text-white/40">{data.xp.toLocaleString()} / {data.xpToNext.toLocaleString()} XP</p>
            </div>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500" initial={{ width: 0 }} animate={{ width: `${(data.xp / data.xpToNext) * 100}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-sm font-semibold text-white/60 mb-4">{t.achievements}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.achievements.map((ach, i) => (
              <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }} whileHover={{ y: -2, scale: 1.02 }} className={`glass-card p-4 transition-all cursor-default ${ach.unlocked ? 'border-indigo-500/20' : 'opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{ach.icon}</span>
                  {ach.unlocked && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium">✓</span>}
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{ach.title}</h4>
                <p className="text-[11px] text-white/40 mb-3">{ach.description}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span className="text-white/30">Progress</span><span className="text-white/50">{ach.progress}/{ach.total}</span></div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div className={`h-full rounded-full ${ach.unlocked ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' : 'bg-white/20'}`} initial={{ width: 0 }} animate={{ width: `${(ach.progress / ach.total) * 100}%` }} transition={{ delay: 0.5 + i * 0.05, duration: 1 }} />
                  </div>
                </div>
                {ach.unlocked && ach.unlockedAt && <p className="text-[10px] text-white/20 mt-2">Unlocked {ach.unlockedAt}</p>}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/60 mb-3">{t.howToEarnXP}</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { action: 'AI Analysis', xp: '+2 XP', icon: '🧠', desc: 'Analyze a call or text' },
              { action: 'Threat Blocked', xp: '+10 XP', icon: '🛡️', desc: 'Block a detected threat' },
              { action: 'Report Submitted', xp: '+15 XP', icon: '📋', desc: 'Submit a cybercrime report' },
              { action: 'Achievement', xp: '+50 XP', icon: '🏆', desc: 'Unlock an achievement' },
              { action: 'Evidence Captured', xp: '+10 XP', icon: '📸', desc: 'Auto-capture evidence' },
              { action: 'Level Up', xp: 'Bonus', icon: '⭐', desc: 'Reach a new level' },
            ].map(item => (
              <div key={item.action} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.06] px-3 py-2.5">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1"><p className="text-xs font-medium text-white">{item.action}</p><p className="text-[10px] text-white/30">{item.desc}</p></div>
                <span className="text-xs font-semibold text-indigo-400">{item.xp}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/60 mb-3">{t.securityTips}</h3>
          <div className="space-y-2">
            {['Never share OTP, PIN, or passwords.', 'Verify caller identity via official channels.', 'Report suspicious numbers: 1930.', 'Enable 2FA on all accounts.'].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-white/[0.02] border border-white/[0.06] px-3 py-2.5">
                <span className="text-green-400 text-xs mt-0.5">✓</span>
                <p className="text-xs text-white/60">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
