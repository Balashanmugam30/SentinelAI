'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const SplineScene = dynamic(() => import('@/components/SplineScene'), { ssr: false });

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const features = [
  { icon: '🎙️', title: 'AI Voice Analysis', desc: 'Real-time voice pattern recognition detects scam indicators during live calls' },
  { icon: '🧠', title: 'Fraud Detection Engine', desc: 'Rule-based scoring with 17+ fraud indicators for instant threat assessment' },
  { icon: '🤖', title: 'AI Intelligence', desc: 'Hybrid Groq + Gemini AI with local fallback for comprehensive scam analysis' },
  { icon: '🗺️', title: 'Threat Map', desc: 'Geographic visualization of scam hotspots and active threat clusters' },
  { icon: '📋', title: 'Cybercrime Reports', desc: 'Auto-generated police reports with evidence logs for law enforcement' },
  { icon: '🏆', title: 'Gamification', desc: 'Safety scores, achievements, and streaks to encourage cyber-safe behavior' },
  { icon: '🔌', title: 'Hardware Alerts', desc: 'ESP32 integration with buzzer, LED, and emergency stop simulation' },
  { icon: '🛡️', title: 'Scam Database', desc: 'Community-driven reputation system with crowd-sourced scam number reports' },
];

const stats = [
  { value: '2.8M+', label: 'Scam Calls Blocked' },
  { value: '₹450Cr', label: 'Fraud Prevented' },
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '< 0.3s', label: 'Response Time' },
];

const howItWorks = [
  { step: '01', title: 'Listen', desc: 'Voice AI monitors incoming calls in real-time using speech recognition' },
  { step: '02', title: 'Analyze', desc: 'Fraud engine scores risk using 17+ pattern rules and AI reasoning' },
  { step: '03', title: 'Alert', desc: 'Instant alerts with hardware triggers and detailed threat intelligence' },
  { step: '04', title: 'Report', desc: 'Auto-generate cybercrime reports with evidence for authorities' },
];

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="relative min-h-screen bg-sentinel-bg">
      {/* Ambient */}
      <div className="ambient-glow" />
      <div className="dot-pattern fixed inset-0 pointer-events-none opacity-40" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-black/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-lg font-bold"><span className="text-white">Sentinel</span><span className="text-indigo-400">AI</span></span>
          </div>
          <Link href="/login" className="glass-button-primary text-sm px-5 py-2">
            Start Protection →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center justify-between">
          <motion.div {...fadeUp} className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 mb-6">
              <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-medium text-indigo-300">AI-Powered Protection Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-4 sm:mb-6">
              <span className="gradient-text">AI-Powered</span>
              <br />
              <span className="text-white">Scam Call</span>
              <br />
              <span className="text-white/80">Defense</span>
            </h1>
            <p className="text-base sm:text-lg text-white/50 max-w-lg mb-6 sm:mb-8 leading-relaxed">
              India loses ₹1.2 lakh crore annually to phone scams. SentinelAI uses advanced voice analysis, 
              fraud detection algorithms, and threat intelligence to stop scam calls before they cause harm.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login" className="glass-button-primary px-8 py-3.5 text-base">
                Start Protection
              </Link>
              <Link href="/dashboard" className="glass-button px-8 py-3.5 text-base">
                View Demo
              </Link>
            </div>
          </motion.div>

          {/* Spline Robot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative z-10 w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 rounded-3xl" />
              <SplineScene
                scene="https://prod.spline.design/g0aSDIC0DFbTMe7A/scene.splinecode"
                className="w-full h-full"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Scam Call Crisis</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto mb-12">
              Every 3 seconds, someone in India receives a scam call. The financial and emotional 
              damage is devastating. Traditional call blockers are no longer enough.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { stat: '47%', desc: 'of people have received scam calls in the past year' },
              { stat: '₹1.2L Cr', desc: 'lost annually to phone-based fraud in India' },
              { stat: '82%', desc: 'of scam calls use urgency tactics to pressure victims' },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.15 }} className="glass-card p-6">
                <p className="text-4xl font-bold text-red-400 mb-2">{item.stat}</p>
                <p className="text-sm text-white/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How SentinelAI Works</h2>
            <p className="text-lg text-white/40">Four steps to complete scam call protection</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {howItWorks.map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="glass-card-hover p-6 text-center">
                <div className="text-3xl font-bold text-indigo-500/30 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/40">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Platform Features</h2>
            <p className="text-lg text-white/40">Enterprise-grade cybersecurity tools</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card-hover p-5 cursor-default"
              >
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Protection */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Hardware Integration</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto mb-12">
              SentinelAI connects to ESP32 hardware for physical alert systems — buzzers, LED indicators, 
              and emergency stop buttons provide instant, tangible warnings when scams are detected.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🔔', name: 'Buzzer Alert', desc: 'Audible alarm when critical scam detected' },
              { icon: '💡', name: 'LED Warning', desc: 'Color-coded visual indicators for threat level' },
              { icon: '🛑', name: 'Emergency Stop', desc: 'Physical button to instantly halt all alerts' },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/[0.06] pb-20">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-sm font-bold"><span className="text-white">Sentinel</span><span className="text-indigo-400">AI</span></span>
          </div>
          <p className="text-sm text-white/50">Balashanmugam S</p>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/in/balashanmugams/" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">LinkedIn</a>
            <span className="text-white/20">•</span>
            <a href="https://github.com/Balashanmugam30" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">GitHub</a>
          </div>
          <p className="text-xs text-white/20 mt-2">© 2024 SentinelAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
