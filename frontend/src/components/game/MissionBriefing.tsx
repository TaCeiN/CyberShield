'use client';

import { motion } from 'framer-motion';
import { getAttackTypeLabel, getEnvironmentLabel } from '@/lib/utils';
import { IconHedgehog } from '@/components/icons/Icons';

interface MissionBriefingProps {
  title: string;
  storyText: string | null;
  attackType: string;
  environment: string;
  xpReward: number;
  onStart: () => void;
}

export default function MissionBriefing({
  title,
  storyText,
  attackType,
  environment,
  xpReward,
  onStart,
}: MissionBriefingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-card p-8 max-w-2xl mx-auto"
    >
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4"><IconHedgehog size={48} /></div>
        <h1 className="font-display text-2xl font-bold mb-2">{title}</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
          <span className="bg-primary-bg text-primary px-3 py-1 rounded-full font-medium">
            {getAttackTypeLabel(attackType)}
          </span>
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            {getEnvironmentLabel(environment)}
          </span>
          <span className="text-accent-success font-medium">+{xpReward} XP</span>
        </div>
      </div>

      {storyText && (
        <div className="bg-page rounded-xl p-6 mb-6">
          <p className="text-text-primary leading-relaxed">{storyText}</p>
        </div>
      )}

      <button
        onClick={onStart}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-lg hover:bg-primary-hover transition-colors"
      >
        Начать миссию
      </button>
    </motion.div>
  );
}
