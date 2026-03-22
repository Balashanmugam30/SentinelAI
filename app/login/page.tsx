'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { LANGUAGES } from '@/lib/translations';

export default function LoginPage() {
  const router = useRouter();
  const { t, setLanguage, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLangModal, setShowLangModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { auth, googleProvider } = await import('@/lib/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
      setShowLangModal(true);
      setPendingRedirect(true);
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      setError('Firebase not configured — entering demo mode...');
      setTimeout(() => setShowLangModal(true), 500);
      setPendingRedirect(true);
    }
    setLoading(false);
  };

  const handleLangContinue = () => {
    setShowLangModal(false);
    if (pendingRedirect) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-sentinel-bg relative overflow-hidden">
      <div className="ambient-glow" />
      <div className="dot-pattern fixed inset-0 pointer-events-none opacity-30" />

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/30 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Welcome to <span className="text-indigo-400">SentinelAI</span></h1>
          <p className="text-sm text-white/40 mt-2">Sign in to access your security dashboard</p>
        </div>

        {/* Login Card */}
        <div className="glass-card glow-border p-8">
          <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.05] px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.1] hover:border-white/[0.2] hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-xs text-yellow-400/80">{error}</motion.p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Secure Auth</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <p className="mt-4 text-center text-[11px] text-white/30">Protected by Firebase Authentication. Your data is encrypted and secure.</p>
        </div>

        {/* Demo Link */}
        <p className="mt-6 text-center text-xs text-white/30">
          No account? <button onClick={() => setShowLangModal(true)} className="text-indigo-400 hover:text-indigo-300 transition-colors">Try the demo →</button>
        </p>
      </motion.div>

      {/* Language Selection Modal */}
      {showLangModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card glow-border p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-white text-center mb-1">{t.selectLanguage}</h2>
            <p className="text-xs text-white/40 text-center mb-5">Choose your preferred language for the platform</p>

            <div className="space-y-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                    language === lang.code
                      ? 'bg-indigo-500/15 border border-indigo-500/30 text-white'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/60 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.nativeName}</span>
                  <span className="text-xs text-white/30">{lang.name}</span>
                  {language === lang.code && <span className="text-indigo-400 ml-1">✓</span>}
                </button>
              ))}
            </div>

            <button onClick={handleLangContinue} className="glass-button-primary w-full mt-5">{t.continue} →</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
