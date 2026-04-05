'use client';

import { motion } from 'framer-motion';

interface SecurityBarProps {
  hp: number;
  maxHp?: number;
}

export default function SecurityBar({ hp, maxHp = 100 }: SecurityBarProps) {
  const percentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const color = percentage > 60 ? '#22c55e' : percentage > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white rounded-xl shadow-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-secondary">Уровень безопасности</span>
        <span className="text-sm font-bold" style={{ color }}>
          {hp}/{maxHp} HP
        </span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
