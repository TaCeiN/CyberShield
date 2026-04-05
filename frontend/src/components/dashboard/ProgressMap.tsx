'use client';

import { motion } from 'framer-motion';

interface ProgressMapProps {
  securityLevel: number;
}

export default function ProgressMap({ securityLevel }: ProgressMapProps) {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-lg">Уровень безопасности</h3>
        <span className="text-2xl font-bold text-primary">{securityLevel} ед.</span>
      </div>
      <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full gradient-progress"
          initial={{ width: 0 }}
          animate={{ width: `${securityLevel}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-text-secondary text-sm mt-2">
        {securityLevel >= 80
          ? 'Отличный уровень! Продолжайте в том же духе.'
          : securityLevel >= 50
          ? 'Хороший прогресс. Пройдите ещё несколько миссий.'
          : 'Начните проходить миссии, чтобы повысить уровень безопасности.'}
      </p>
    </div>
  );
}
