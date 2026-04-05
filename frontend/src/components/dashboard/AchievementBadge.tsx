'use client';

import { motion } from 'framer-motion';
import { getRarityColor, getRarityLabel } from '@/lib/utils';
import type { AchievementNotification } from '@/types';

interface AchievementBadgeProps {
  achievement: AchievementNotification;
  showAnimation?: boolean;
}

/* SVG icon map keyed by achievement.icon string */
function AchievementIcon({ icon, color }: { icon: string; color: string }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (icon) {
    case 'start':
      return (
        <svg {...props}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case 'path':
      return (
        <svg {...props}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'half':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20" fill={`${color}30`} />
          <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...props}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      );
    case 'phishing':
      return (
        <svg {...props}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'card':
      return (
        <svg {...props}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'star':
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'stars':
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`${color}20`} />
        </svg>
      );
    case 'crown':
      return (
        <svg {...props}>
          <path d="M2 17l3-12 5 6 2-8 2 8 5-6 3 12z" fill={`${color}20`} />
          <rect x="2" y="17" width="20" height="4" rx="1" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={`${color}20`} />
        </svg>
      );
    case 'zap':
      return (
        <svg {...props}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'shield_check':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case 'award':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    case 'medal':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="6" fill={`${color}20`} />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}

export default function AchievementBadge({ achievement, showAnimation = false }: AchievementBadgeProps) {
  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <motion.div
      initial={showAnimation ? { scale: 0, rotate: -180 } : false}
      animate={showAnimation ? { scale: 1, rotate: 0 } : false}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="flex items-center gap-3 p-3 bg-page rounded-lg border border-border"
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${rarityColor}15`, border: `2px solid ${rarityColor}` }}
      >
        <AchievementIcon icon={achievement.icon} color={rarityColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{achievement.title}</p>
        <p className="text-xs text-text-secondary truncate">{achievement.description || ''}</p>
      </div>
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ backgroundColor: `${rarityColor}15`, color: rarityColor }}
      >
        {getRarityLabel(achievement.rarity)}
      </span>
    </motion.div>
  );
}
