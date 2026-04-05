'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useProgressStore } from '@/stores/progressStore';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { getLeagueInfo } from '@/lib/utils';
import { IconHedgehog, IconMedal, IconTrophy, IconShield } from '@/components/icons/Icons';

export default function LeaderboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { leaderboard, fetchLeaderboard, isLoading } = useProgressStore();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) fetchLeaderboard();
  }, [isAuthenticated, fetchLeaderboard]);

  if (authLoading) return null;

  const entries = leaderboard?.entries ?? [];
  const userPosition = leaderboard?.user_position ?? 1;

  // Podium: top 3
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <IconTrophy size={28} className="text-primary" />
            <h1 className="font-display text-2xl font-bold text-text-primary">Лидерборд</h1>
          </div>

          {/* User position banner */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center">
                <IconShield size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Ваша позиция в рейтинге</p>
                <p className="text-primary font-bold text-xl">#{userPosition}</p>
              </div>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm text-text-secondary">Ваш XP</p>
                <p className="font-bold text-text-primary">{user.total_xp ?? 0} XP</p>
              </div>
            )}
          </motion.div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-bounce flex justify-center"><IconHedgehog size={48} /></div>
              <p className="text-text-secondary mt-3 text-sm">Загрузка рейтинга...</p>
            </div>
          ) : entries.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-card p-12 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <IconTrophy size={40} className="text-primary" />
                </div>
              </div>
              <h2 className="font-display font-bold text-xl text-text-primary mb-2">
                Рейтинг пока пуст
              </h2>
              <p className="text-text-secondary max-w-md mx-auto mb-6">
                Пройдите хотя бы один обучающий модуль, чтобы попасть в таблицу лидеров.
                За каждый правильный ответ вы получаете XP и поднимаетесь в рейтинге!
              </p>
              <button
                onClick={() => router.push('/learning')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-colors text-sm"
              >
                Начать обучение
              </button>
            </motion.div>
          ) : (
            <>
              {/* Podium — top 3 */}
              {podium.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 0, 2].map((podIdx) => {
                    const entry = podium[podIdx];
                    if (!entry) return <div key={podIdx} />;
                    const isCurrentUser = entry.user_id === user?.id;
                    const leagueInfo = getLeagueInfo(entry.league);
                    const heights = ['h-32', 'h-24', 'h-20'];
                    const podiumColors = ['from-yellow-400 to-yellow-500', 'from-gray-300 to-gray-400', 'from-amber-500 to-amber-600'];
                    const medals = ['1', '2', '3'];

                    return (
                      <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: podIdx * 0.1 }}
                        className={`flex flex-col items-center ${podIdx === 1 ? '' : 'mt-4'}`}
                      >
                        <div className={`relative mb-2 ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 rounded-full' : ''}`}>
                          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-lg font-bold text-primary">
                            {entry.display_name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${podiumColors[podIdx]} text-white text-xs font-bold flex items-center justify-center shadow`}>
                            {medals[podIdx]}
                          </div>
                        </div>
                        <p className={`text-sm font-semibold truncate max-w-full ${isCurrentUser ? 'text-primary' : 'text-text-primary'}`}>
                          {entry.display_name}
                        </p>
                        <p className="text-xs text-text-secondary">{entry.total_xp} XP</p>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
                          style={{ backgroundColor: `${leagueInfo.color}20`, color: leagueInfo.color }}
                        >
                          {leagueInfo.title}
                        </span>
                        {/* Podium bar */}
                        <div className={`w-full ${heights[podIdx]} bg-gradient-to-t from-primary/20 to-primary/5 rounded-t-xl mt-2 flex items-end justify-center pb-2`}>
                          <span className="text-xs font-bold text-primary">{entry.accuracy_percent}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Table — remaining entries */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Игрок</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">XP</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Модулей</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Точность</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Лига</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Show top 3 in table too for completeness */}
                    {entries.map((entry, idx) => {
                      const isCurrentUser = entry.user_id === user?.id;
                      const leagueInfo = getLeagueInfo(entry.league);
                      const pos = idx + 1;

                      return (
                        <motion.tr
                          key={entry.user_id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`border-b border-gray-50 last:border-0 transition-colors ${
                            isCurrentUser ? 'bg-primary/5' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3">
                            {pos <= 3 ? (
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                pos === 1 ? 'bg-yellow-400' : pos === 2 ? 'bg-gray-400' : 'bg-amber-500'
                              }`}>
                                {pos}
                              </div>
                            ) : (
                              <span className="text-sm text-text-secondary font-medium pl-1.5">{pos}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCurrentUser ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                              }`}>
                                {entry.display_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className={`text-sm font-medium ${isCurrentUser ? 'text-primary' : 'text-text-primary'}`}>
                                  {entry.display_name}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[10px] text-primary ml-2 bg-primary/10 px-1.5 py-0.5 rounded-full">
                                    Вы
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-sm text-text-primary">{entry.total_xp}</span>
                            <span className="text-xs text-text-secondary ml-0.5">XP</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-text-secondary hidden md:table-cell">
                            {entry.missions_completed}/16
                          </td>
                          <td className="px-4 py-3 text-right text-sm hidden md:table-cell">
                            <span className={`font-medium ${
                              entry.accuracy_percent >= 80 ? 'text-green-600' :
                              entry.accuracy_percent >= 50 ? 'text-orange-500' : 'text-red-500'
                            }`}>
                              {entry.accuracy_percent}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: `${leagueInfo.color}15`, color: leagueInfo.color }}
                            >
                              {leagueInfo.title}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Leagues info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-2xl shadow-card p-5"
          >
            <h3 className="font-display font-bold text-sm text-text-primary mb-3 uppercase tracking-wider">Лиги</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { slug: 'newbie', title: 'Новичок', range: '0–30 XP', color: '#9ca3af' },
                { slug: 'defender', title: 'Защитник', range: '31–80 XP', color: '#2e7d32' },
                { slug: 'expert', title: 'Эксперт', range: '81–130 XP', color: '#1565c0' },
                { slug: 'master', title: 'Мастер', range: '131+ XP', color: '#f59e0b' },
              ].map((league) => {
                const isActive = user?.current_league === league.slug;
                return (
                  <div
                    key={league.slug}
                    className={`rounded-xl p-3 text-center border-2 transition-colors ${
                      isActive ? 'border-current shadow-sm' : 'border-transparent bg-gray-50'
                    }`}
                    style={isActive ? { borderColor: league.color, backgroundColor: `${league.color}10` } : {}}
                  >
                    <div className="text-sm font-bold" style={{ color: league.color }}>{league.title}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{league.range}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
