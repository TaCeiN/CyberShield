import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLeagueInfo(league: string) {
  const leagues: Record<string, { title: string; color: string }> = {
    newbie: { title: 'Новичок', color: '#9ca3af' },
    defender: { title: 'Защитник', color: '#2e7d32' },
    expert: { title: 'Эксперт', color: '#1565c0' },
    master: { title: 'Мастер', color: '#f59e0b' },
  };
  return leagues[league] || leagues.newbie;
}

export function getAttackTypeLabel(type: string) {
  const labels: Record<string, string> = {
    phishing: 'Фишинг',
    social_engineering: 'Социальная инженерия',
    password_brute: 'Подбор пароля',
    mitm: 'Перехват трафика',
    skimming: 'Скимминг',
    deepfake: 'Дипфейк',
  };
  return labels[type] || type;
}

export function getEnvironmentLabel(env: string) {
  const labels: Record<string, string> = {
    email: 'Электронная почта',
    messenger: 'Мессенджер',
    phone_settings: 'Телефон',
    browser: 'Браузер',
    wifi: 'Wi-Fi',
  };
  return labels[env] || env;
}

export function getDifficultyLabel(difficulty: number) {
  if (difficulty <= 1) return 'Лёгкий';
  if (difficulty <= 2) return 'Средний';
  return 'Сложный';
}

export function getRarityColor(rarity: string) {
  const colors: Record<string, string> = {
    common: '#6b7280',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#eab308',
  };
  return colors[rarity] || colors.common;
}

export function getRarityLabel(rarity: string) {
  const labels: Record<string, string> = {
    common: 'Обычное',
    rare: 'Редкое',
    epic: 'Эпическое',
    legendary: 'Легендарное',
  };
  return labels[rarity] || rarity;
}
