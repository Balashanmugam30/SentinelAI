'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from 'firebase/auth';
import { useLanguage } from '@/lib/language-context';
import { LANGUAGES } from '@/lib/translations';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage, langInfo } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const sidebarItems = [
    { href: '/dashboard', label: t.dashboard, icon: '📊' },
    { href: '/voice-assistant', label: t.voiceAssistant, icon: '🎙️' },
    { href: '/fraud-intelligence', label: t.fraudIntelligence, icon: '🧠' },
    { href: '/threat-map', label: t.threatMap, icon: '🗺️' },
    { href: '/cyber-report', label: t.cyberReport, icon: '📋' },
    { href: '/gamification', label: t.gamification, icon: '🏆' },
  ];

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
      } catch { /* Firebase not configured */ }
    })();
    return () => unsubscribe?.();
  }, []);

  const handleLogout = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch { /* Firebase not configured */ }
    router.push('/login');
  };

  return (
    <aside className="glass-sidebar hidden lg:flex lg:flex-col">
      <div className="flex-1 flex flex-col gap-1 p-4 pt-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          {t.navigation}
        </p>
        {sidebarItems.map(({ href, label, icon }, i) => {
          const isActive = pathname === href;
          return (
            <motion.div key={href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-lg shadow-indigo-500/5'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
                {isActive && (
                  <motion.div layoutId="sidebar-indicator" className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* Protection Status */}
        <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">{t.protectionActive}</span>
          </div>
          <p className="text-[11px] text-white/40">{t.allSystemsOp}</p>
        </div>

        {/* Language Selector */}
        <div className="mt-4 relative">
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 text-sm text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            <span className="text-base">{langInfo.flag}</span>
            <span className="flex-1 text-left text-xs">{langInfo.nativeName}</span>
            <svg className={`w-3 h-3 text-white/30 transition-transform ${showLangPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 9l-7 7-7-7" /></svg>
          </button>
          <AnimatePresence>
            {showLangPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border border-white/[0.08] bg-[#111118] p-1 shadow-lg z-50"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setShowLangPicker(false); }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                      language === lang.code ? 'bg-indigo-500/10 text-indigo-300' : 'text-white/60 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    {language === lang.code && <span className="ml-auto text-indigo-400">✓</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Profile Footer */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="h-9 w-9 rounded-full ring-2 ring-white/[0.1] flex-shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white flex-shrink-0 ring-2 ring-white/[0.1]">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
              <p className="text-[10px] text-white/30 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/40 transition-colors hover:text-red-400 hover:bg-red-500/5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            {t.logOut}
          </button>
        </motion.div>
      )}
    </aside>
  );
}
