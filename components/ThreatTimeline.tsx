'use client';

import { motion } from 'framer-motion';
import type { TimelineEvent } from '@/lib/mock-data';

interface ThreatTimelineProps {
  events: TimelineEvent[];
}

const eventTypeConfig: Record<string, { icon: string; color: string }> = {
  call_detected: { icon: '📞', color: '#f59e0b' },
  score_increased: { icon: '📈', color: '#ef4444' },
  alert_triggered: { icon: '🚨', color: '#ef4444' },
  report_generated: { icon: '📋', color: '#6366f1' },
  ai_analysis: { icon: '🤖', color: '#a855f7' },
  system_reset: { icon: '🔄', color: '#22d3ee' },
};

const riskLevelColor: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
  info: '#6366f1',
};

export default function ThreatTimeline({ events }: ThreatTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
          <span className="text-lg">⏱️</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Threat Timeline</h3>
          <p className="text-[10px] text-white/40">Real-time security events</p>
        </div>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

        <div className="space-y-4">
          {events.map((event, i) => {
            const config = eventTypeConfig[event.eventType] || { icon: '•', color: '#64748b' };
            const isHighRisk = event.riskLevel === 'high' || event.riskLevel === 'critical';

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative flex gap-4 pl-1"
              >
                {/* Node */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    className="flex h-9 w-9 items-center justify-center rounded-full border text-sm"
                    style={{
                      borderColor: `${config.color}40`,
                      backgroundColor: `${config.color}10`,
                      boxShadow: isHighRisk ? `0 0 12px ${config.color}30` : 'none',
                    }}
                    animate={isHighRisk ? { boxShadow: [`0 0 4px ${config.color}20`, `0 0 16px ${config.color}40`, `0 0 4px ${config.color}20`] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {config.icon}
                  </motion.div>
                </div>

                {/* Content */}
                <div className={`flex-1 rounded-xl border p-3 ${
                  isHighRisk ? 'border-white/[0.1] bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-white/30">{event.timestamp}</span>
                    <span
                      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        color: riskLevelColor[event.riskLevel],
                        backgroundColor: `${riskLevelColor[event.riskLevel]}15`,
                      }}
                    >
                      {event.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">{event.description}</p>
                  {event.details && (
                    <p className="text-[11px] text-white/40 mt-1">{event.details}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
