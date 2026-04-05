'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { getLeagueInfo } from '@/lib/utils';
import { IconChart, IconGraduate, IconTrophy, IconHedgehog } from '@/components/icons/Icons';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-border shadow-card px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3">
        <IconHedgehog size={32} />
        <span className="font-display font-bold text-xl text-primary">CyberShield</span>
      </Link>

      {isAuthenticated && user ? (
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
          >
            <IconChart size={16} className="text-primary" />
            Статистика
          </Link>
          <Link
            href="/learning"
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
          >
            <IconGraduate size={16} className="text-primary" />
            Обучение
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
          >
            <IconTrophy size={16} className="text-primary" />
            Лидерборд
          </Link>
          <div className="text-sm text-text-secondary">
            Репутация:{' '}
            <span className="font-semibold" style={{ color: getLeagueInfo(user.current_league).color }}>
              {user.total_xp} очков
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-bg rounded-full flex items-center justify-center text-sm font-bold text-primary">
              {(user.display_name || user.username).charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{user.display_name || user.username}</span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-text-secondary hover:text-accent-error transition-colors"
          >
            Выйти
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Регистрация
          </Link>
        </div>
      )}
    </nav>
  );
}
