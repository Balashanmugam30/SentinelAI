'use client';

import { motion } from 'framer-motion';
import { getRiskColor } from '@/lib/fraud-engine';

interface FraudMeterProps {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  size?: number;
}

export default function FraudMeter({ score, riskLevel, size = 200 }: FraudMeterProps) {
  const color = getRiskColor(riskLevel);
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // semicircle
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* Background Arc */}
          <path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <motion.path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>

        {/* Center Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span
            className="text-4xl font-bold font-mono"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
            <span className="text-lg">%</span>
          </motion.span>
        </div>
      </div>

      {/* Risk Label */}
      <motion.div
        className="flex items-center gap-2 rounded-full border px-4 py-1.5"
        style={{
          borderColor: `${color}30`,
          backgroundColor: `${color}10`,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          {riskLevel} Risk
        </span>
      </motion.div>
    </div>
  );
}
