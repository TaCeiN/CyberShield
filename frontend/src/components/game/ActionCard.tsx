'use client';

import { motion } from 'framer-motion';
import type { StepChoice } from '@/types';

interface ActionCardProps {
  choices: StepChoice[];
  onSelect: (choiceId: string) => void;
  disabled: boolean;
}

export default function ActionCard({ choices, onSelect, disabled }: ActionCardProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-display font-bold text-lg">Что вы будете делать?</h3>
      {choices.map((choice, idx) => (
        <motion.button
          key={choice.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => onSelect(choice.id)}
          disabled={disabled}
          className="w-full text-left p-4 bg-white rounded-xl border-2 border-border hover:border-primary hover:bg-primary-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
        >
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 bg-primary-bg text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <p className="text-sm font-medium">{choice.choice_text}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
