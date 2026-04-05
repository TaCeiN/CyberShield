'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

import { getLeagueInfo } from '@/lib/utils';
import api from '@/lib/api';
import {
  IconShield,
  IconChart,
  IconMedal,
  IconClipboard,
  IconCheckCircle,
  IconXCircle,
  IconHedgehog,
  IconTrophy,
  IconGraduate,
} from '@/components/icons/Icons';

interface ThemeProgress {
  id: string;
  name: string;
  icon: string;
  total: number;
  completed: number;
  correct: number;
}

interface LearningDashboard {
  user_stats: {
    total_modules: number;
    completed_modules: number;
    correct_answers: number;
    wrong_answers: number;
    accuracy_percent: number;
    security_level: number;
    total_xp: number;
    current_league: string;
  };
  theme_progress: ThemeProgress[];
  recent_history: {
    scenario_id: number;
    title: string;
    theme: string;
    is_correct: boolean;
    completed_at: string | null;
  }[];
}

const THEME_COLORS: Record<string, string> = {
  phishing: '#2e7d32',
  skimming: '#43a047',
  password: '#66bb6a',
  social: '#81c784',
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<LearningDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get<LearningDashboard>('/api/learning/dashboard')
        .then((r) => setDashboard(r.data))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center animate-bounce">
            <IconHedgehog size={48} />
          </div>
          <p className="text-text-secondary">Загрузка...</p>
        </div>
      </div>
    );
  }

  const stats = dashboard?.user_stats;
  const leagueInfo = getLeagueInfo(user.current_league);
  const securityLevel = stats?.security_level ?? user.security_level ?? 100;
  const completedModules = stats?.completed_modules ?? 0;
  const totalModules = stats?.total_modules ?? 16;
  const accuracy = stats?.accuracy_percent ?? 0;
  const wrongAnswers = stats?.wrong_answers ?? 0;
  const correctAnswers = stats?.correct_answers ?? 0;

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary-bg rounded-full flex items-center justify-center text-2xl font-bold text-primary">
              {(user.display_name || user.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                {user.display_name || user.username}
              </h1>
              <p className="text-text-secondary">
                Репутация:{' '}
                <span className="font-semibold" style={{ color: leagueInfo.color }}>
                  {stats?.total_xp ?? user.total_xp} XP
                </span>
                {' · '}
                <span style={{ color: leagueInfo.color }}>{leagueInfo.title}</span>
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center animate-bounce">
                <IconHedgehog size={48} />
              </div>
              <p className="text-text-secondary">Загрузка данных...</p>
            </div>
          ) : (
            <>
              {/* Security level */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-card p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <IconShield size={20} className="text-primary" />
                    Уровень безопасности
                  </h3>
                  <span
                    className={`text-2xl font-bold ${
                      securityLevel >= 80
                        ? 'text-primary'
                        : securityLevel >= 50
                        ? 'text-amber-500'
                        : 'text-accent-error'
                    }`}
                  >
                    {securityLevel}%
                  </span>
                </div>
                <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      securityLevel >= 80
                        ? 'bg-primary'
                        : securityLevel >= 50
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${securityLevel}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  {securityLevel >= 80
                    ? 'Отличный уровень! Вы отлично разбираетесь в кибербезопасности.'
                    : securityLevel >= 50
                    ? 'Хороший прогресс. Пройдите ещё сценарии, чтобы улучшить знания.'
                    : 'Уровень снижен из-за ошибок. Повторите обучение, чтобы восстановить!'}
                </p>
              </motion.div>

              {/* Metrics cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-card p-5"
                >
                  <p className="text-text-secondary text-sm mb-1">Пройдено модулей</p>
                  <p className="text-3xl font-bold text-primary">
                    {completedModules}
                    <span className="text-lg text-text-secondary font-normal">
                      /{totalModules}
                    </span>
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-xl shadow-card p-5"
                >
                  <p className="text-text-secondary text-sm mb-1">Правильных ответов</p>
                  <p className="text-3xl font-bold text-accent-success">{correctAnswers}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-card p-5"
                >
                  <p className="text-text-secondary text-sm mb-1">Точность ответов</p>
                  <p className="text-3xl font-bold text-accent-success">{accuracy}%</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white rounded-xl shadow-card p-5"
                >
                  <p className="text-text-secondary text-sm mb-1">Допущено ошибок</p>
                  <p className="text-3xl font-bold text-accent-error">{wrongAnswers}</p>
                </motion.div>
              </div>

              {/* Theme progress + Certificate */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Theme progress */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-card p-6"
                >
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <IconChart size={20} className="text-primary" />
                    Прогресс по темам
                  </h3>
                  <div className="space-y-4">
                    {(dashboard?.theme_progress ?? []).map((tp) => {
                      const pct =
                        tp.total > 0
                          ? Math.round((tp.completed / tp.total) * 100)
                          : 0;
                      return (
                        <div key={tp.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-text-primary">
                              {tp.name}
                            </span>
                            <span className="text-sm text-text-secondary">
                              {tp.completed}/{tp.total}{' '}
                              <span className="text-xs">
                                ({tp.correct} верно)
                              </span>
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                backgroundColor:
                                  THEME_COLORS[tp.id] || '#2e7d32',
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {dashboard?.theme_progress.length === 0 && (
                    <div className="text-center py-8 text-text-secondary text-sm">
                      <div className="flex justify-center mb-2">
                        <IconGraduate size={32} className="text-text-secondary opacity-40" />
                      </div>
                      Начните обучение, чтобы видеть прогресс
                    </div>
                  )}
                </motion.div>

                {/* Certificate */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-xl shadow-card p-6"
                >
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <IconMedal size={20} className="text-primary" />
                    Мой сертификат
                  </h3>
                  {completedModules >= totalModules ? (
                    <div className="border-2 border-primary rounded-lg p-6 text-center bg-primary-bg">
                      <div className="flex justify-center mb-3">
                        <IconTrophy size={48} className="text-primary" />
                      </div>
                      <p className="font-display font-bold text-lg text-primary">
                        Сертификат CyberShield
                      </p>
                      <p className="text-text-secondary text-sm mt-2">
                        Выдан: {user.display_name || user.username}
                      </p>
                      <p className="text-text-secondary text-sm">
                        Все {totalModules} модулей успешно пройдены!
                      </p>
                      <p className="text-primary font-semibold mt-2">
                        Точность: {accuracy}% | {stats?.total_xp} XP
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <div className="flex justify-center mb-3 opacity-30">
                        <IconTrophy size={48} className="text-text-secondary" />
                      </div>
                      <p className="text-text-secondary text-sm">
                        Пройдите все модули обучения, чтобы получить сертификат
                      </p>
                      <p className="text-text-secondary text-sm mt-2 font-medium">
                        Прогресс: {completedModules}/{totalModules}
                      </p>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.round((completedModules / totalModules) * 100)}%`,
                          }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Recent history */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-card p-6"
              >
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <IconClipboard size={20} className="text-primary" />
                  Последние результаты
                </h3>
                {dashboard?.recent_history && dashboard.recent_history.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.recent_history.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          item.is_correct
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <span>
                          {item.is_correct ? (
                            <IconCheckCircle size={24} className="text-accent-success" />
                          ) : (
                            <IconXCircle size={24} className="text-accent-error" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-text-secondary">{item.theme}</p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                            item.is_correct
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.is_correct ? (
                            <>
                              <IconShield size={12} />
                              +5 | +10 XP
                            </>
                          ) : (
                            <>
                              <IconShield size={12} />
                              -10
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-3">
                      <IconHedgehog size={48} />
                    </div>
                    <p className="text-text-secondary text-sm">
                      Пока нет результатов. Пройдите первый модуль обучения!
                    </p>
                    <button
                      onClick={() => router.push('/learning')}
                      className="mt-3 bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
                    >
                      Начать обучение
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
