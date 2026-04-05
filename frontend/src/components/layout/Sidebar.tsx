'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { IconChart, IconGraduate, IconTrendUp, IconTrophy, IconSettings, IconBook } from '@/components/icons/Icons';
import { ReactNode } from 'react';

const menuItems: { icon: ReactNode; label: string; route: string }[] = [
  { icon: <IconChart size={18} />, label: 'Статистика', route: '/dashboard' },
  { icon: <IconGraduate size={18} />, label: 'Обучение', route: '/learning' },
  { icon: <IconBook size={18} />, label: 'Теория', route: '/theory' },
  { icon: <IconTrendUp size={18} />, label: 'Прогресс', route: '/dashboard/progress' },
  { icon: <IconTrophy size={18} />, label: 'Лидерборд', route: '/leaderboard' },
  { icon: <IconSettings size={18} />, label: 'Настройки', route: '/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-border min-h-[calc(100vh-57px)] py-4">
      <nav className="space-y-1 px-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <Link
              key={item.route}
              href={item.route}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-bg border-l-[3px] border-primary text-primary'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              )}
            >
              <span className={isActive ? 'text-primary' : 'text-text-secondary'}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
