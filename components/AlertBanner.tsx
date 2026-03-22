'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ThreatAlert } from '@/lib/mock-data';

interface AlertBannerProps {
  alerts: ThreatAlert[];
}

const severityConfig = {
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
};

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <AnimatePresence>
      {unresolvedAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          {unresolvedAlerts.slice(0, 3).map((alert, i) => {
            const cfg = severityConfig[alert.severity];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-3`}
              >
                <div className={`h-2 w-2 rounded-full ${cfg.dot} animate-pulse`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold uppercase ${cfg.text}`}>{alert.severity}</span>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-white/50">{alert.type}</span>
                  </div>
                  <p className="text-sm text-white/70 truncate mt-0.5">{alert.message}</p>
                </div>
                <span className="text-[10px] text-white/30 whitespace-nowrap">{alert.timestamp}</span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
