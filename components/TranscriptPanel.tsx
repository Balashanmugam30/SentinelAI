'use client';

import { motion } from 'framer-motion';

interface TranscriptPanelProps {
  transcript: string;
  highlightKeywords?: string[];
}

const FRAUD_KEYWORDS = [
  'otp', 'urgent', 'immediately', 'blocked', 'suspend', 'share', 'password',
  'pin', 'transfer', 'payment', 'verify', 'account', 'bank', 'code',
  'expire', 'hurry', 'quickly', 'risk', 'compromised', 'security',
];

export default function TranscriptPanel({ transcript, highlightKeywords }: TranscriptPanelProps) {
  const keywords = highlightKeywords || FRAUD_KEYWORDS;

  const highlightText = (text: string) => {
    if (!text) return null;
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isKeyword) {
        return (
          <span key={i} className="relative inline-block">
            <span className="relative z-10 font-semibold text-red-400">{part}</span>
            <span className="absolute inset-0 rounded bg-red-500/20 -mx-0.5 -my-0.5 px-0.5 py-0.5" />
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
        <h3 className="text-sm font-semibold text-white/80">Live Transcript</h3>
      </div>
      <div className="rounded-xl bg-black/30 border border-white/[0.05] p-4 font-mono text-sm leading-relaxed text-white/70">
        {transcript ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {highlightText(transcript)}
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 text-white/30">
            <span className="inline-block h-4 w-1 bg-white/30 animate-pulse" />
            Waiting for speech input...
          </div>
        )}
      </div>
    </motion.div>
  );
}
