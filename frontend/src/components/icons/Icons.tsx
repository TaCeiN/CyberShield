import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaultProps = (size = 20): IconProps => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function IconShield({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function IconChart({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function IconGraduate({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M22 10l-10-5L2 10l10 5 10-5z" />
      <path d="M6 12v5c0 0 3 3 6 3s6-3 6-3v-5" />
      <line x1="22" y1="10" x2="22" y2="16" />
    </svg>
  );
}

export function IconTrophy({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export function IconTrendUp({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function IconSettings({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconMedal({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

export function IconClipboard({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

export function IconCheckCircle({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function IconXCircle({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function IconBook({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function IconTarget({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconSearch({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconLightbulb({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

export function IconAlertTriangle({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconCalendar({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconActivity({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function IconHedgehog({ size = 32, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <circle cx="16" cy="16" r="14" fill="#e8f5e9" />
      <path d="M8 12c1-4 4-6 8-6s7 2 8 6" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 10l-2-3M14 8l-1-4M18 8l1-4M22 10l2-3" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.5" fill="#1a1a2e" />
      <circle cx="20" cy="15" r="1.5" fill="#1a1a2e" />
      <ellipse cx="16" cy="18" rx="2" ry="1.5" fill="#2e7d32" />
      <path d="M11 21c2 2 8 2 10 0" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconGrid({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function IconParty({ size = 20, className, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} className={className} {...props}>
      <path d="M5.8 11.3 2 22l10.7-3.79" />
      <path d="M4 3h.01" />
      <path d="M22 8h.01" />
      <path d="M15 2h.01" />
      <path d="M22 20h.01" />
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
      <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" />
      <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" />
      <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
    </svg>
  );
}
