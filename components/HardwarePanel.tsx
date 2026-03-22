'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HardwarePanelProps {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
}

export default function HardwarePanel({ riskLevel, riskScore }: HardwarePanelProps) {
  const [isResetActive, setIsResetActive] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');

  const buzzerActive = riskLevel === 'critical';
  const ledWarning = riskLevel === 'medium' || riskLevel === 'high' || riskLevel === 'critical';
  const ledFlashing = riskLevel === 'high' || riskLevel === 'critical';

  const handleEmergencyStop = () => {
    setIsResetActive(true);
    setSystemMessage('⚡ Emergency Stop Activated — System Reset in Progress...');
    setTimeout(() => {
      setSystemMessage('✅ System Reset Complete — All alerts cleared, returning to normal state.');
      setTimeout(() => {
        setIsResetActive(false);
        setSystemMessage('');
      }, 3000);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
            <span className="text-lg">🔌</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Hardware Security Panel</h3>
            <p className="text-[10px] text-white/40">ESP32 Alert System Simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">Connected</span>
        </div>
      </div>

      {/* Hardware Indicators */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Buzzer */}
        <div className={`rounded-xl border p-3 text-center transition-all ${
          buzzerActive && !isResetActive
            ? 'border-red-500/40 bg-red-500/10'
            : 'border-white/[0.08] bg-white/[0.02]'
        }`}>
          <motion.div
            animate={buzzerActive && !isResetActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-2xl mb-1"
          >
            {buzzerActive && !isResetActive ? '🔔' : '🔕'}
          </motion.div>
          <p className="text-[10px] text-white/50 font-medium">Buzzer</p>
          <motion.div
            className={`mt-1.5 mx-auto h-1.5 w-1.5 rounded-full ${
              buzzerActive && !isResetActive ? 'bg-red-400' : 'bg-white/20'
            }`}
            animate={buzzerActive && !isResetActive ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        </div>

        {/* LED Warning */}
        <div className={`rounded-xl border p-3 text-center transition-all ${
          ledWarning && !isResetActive
            ? ledFlashing
              ? 'border-orange-500/40 bg-orange-500/10'
              : 'border-yellow-500/40 bg-yellow-500/10'
            : 'border-white/[0.08] bg-white/[0.02]'
        }`}>
          <motion.div
            className="text-2xl mb-1"
            animate={ledFlashing && !isResetActive ? { opacity: [1, 0.2, 1] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            {ledWarning && !isResetActive ? '💡' : '⚫'}
          </motion.div>
          <p className="text-[10px] text-white/50 font-medium">LED Warning</p>
          <div className="flex justify-center gap-1 mt-1.5">
            <motion.div
              className={`h-1.5 w-1.5 rounded-full ${
                ledWarning && !isResetActive
                  ? ledFlashing ? 'bg-orange-400' : 'bg-yellow-400'
                  : 'bg-white/20'
              }`}
              animate={ledFlashing && !isResetActive ? { opacity: [1, 0, 1] } : {}}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
            <motion.div
              className={`h-1.5 w-1.5 rounded-full ${
                ledFlashing && !isResetActive ? 'bg-red-400' : 'bg-white/20'
              }`}
              animate={ledFlashing && !isResetActive ? { opacity: [0, 1, 0] } : {}}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Emergency Stop */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-center">
          <div className="text-2xl mb-1">🛑</div>
          <p className="text-[10px] text-white/50 font-medium">E-Stop</p>
          <div className={`mt-1.5 mx-auto h-1.5 w-1.5 rounded-full ${
            isResetActive ? 'bg-green-400 animate-pulse' : 'bg-white/20'
          }`} />
        </div>
      </div>

      {/* Risk Level Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
          <span>Risk Level</span>
          <span className={`font-semibold uppercase ${
            riskLevel === 'critical' ? 'text-red-400' :
            riskLevel === 'high' ? 'text-orange-400' :
            riskLevel === 'medium' ? 'text-yellow-400' :
            'text-green-400'
          }`}>{riskLevel}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              riskLevel === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-400' :
              riskLevel === 'high' ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
              riskLevel === 'medium' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
              'bg-gradient-to-r from-green-600 to-green-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${isResetActive ? 0 : riskScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Emergency Stop Button */}
      <button
        onClick={handleEmergencyStop}
        disabled={isResetActive}
        className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
          isResetActive
            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:shadow-glow-red active:scale-[0.98]'
        }`}
      >
        {isResetActive ? '🔄 Resetting...' : '🛑 Emergency Stop'}
      </button>

      {/* System Message */}
      <AnimatePresence>
        {systemMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3"
          >
            <p className="text-xs text-white/60">{systemMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
