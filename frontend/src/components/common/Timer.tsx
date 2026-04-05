'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  seconds: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export default function Timer({ seconds, onTimeUp, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const percentage = (timeLeft / seconds) * 100;
  const isLow = timeLeft < 30;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isLow ? 'bg-accent-error' : 'gradient-progress'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className={`text-sm font-mono font-bold min-w-[60px] text-right ${isLow ? 'text-accent-error' : 'text-text-secondary'}`}>
        {minutes}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
