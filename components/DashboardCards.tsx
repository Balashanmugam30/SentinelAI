'use client';

import { motion } from 'framer-motion';

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: string;
  color: string;
}

interface DashboardCardsProps {
  cards: StatCard[];
}

export default function DashboardCards({ cards }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card-hover p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{card.icon}</span>
            {card.change && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                card.trend === 'up'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {card.trend === 'up' ? '↑' : '↓'} {card.change}
              </span>
            )}
          </div>
          <motion.p
            className="text-2xl font-bold text-white mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.3 }}
          >
            {card.value}
          </motion.p>
          <p className="text-xs text-white/40">{card.label}</p>
          <div className="mt-3 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: card.color }}
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ delay: i * 0.1 + 0.5, duration: 1 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
