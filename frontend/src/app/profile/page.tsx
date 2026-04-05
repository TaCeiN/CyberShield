'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useProgressStore } from '@/stores/progressStore';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import AchievementBadge from '@/components/dashboard/AchievementBadge';
import { getLeagueInfo } from '@/lib/utils';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, fetchMe } = useAuthStore();
  const { achievements, fetchAchievements } = useProgressStore();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || user.username);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) fetchAchievements();
  }, [isAuthenticated, fetchAchievements]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await api.put('/api/auth/me', { display_name: displayName });
      await fetchMe();
      setMessage('Профиль обновлён');
    } catch {
      setMessage('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !user) return null;

  const leagueInfo = getLeagueInfo(user.current_league);

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="font-display text-2xl font-bold mb-6">Настройки</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-card p-6"
            >
              <h2 className="font-display font-bold text-lg mb-4">Профиль</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-bg rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                  {(user.display_name || user.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user.display_name || user.username}</p>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: `${leagueInfo.color}20`, color: leagueInfo.color }}>
                    {leagueInfo.title} · {user.total_xp} XP
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Отображаемое имя</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                {message && (
                  <p className={`text-sm ${message.includes('Ошибка') ? 'text-accent-error' : 'text-accent-success'}`}>
                    {message}
                  </p>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-card p-6"
            >
              <h2 className="font-display font-bold text-lg mb-4">Статистика</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-page rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{user.total_xp}</p>
                  <p className="text-xs text-text-secondary">Общий XP</p>
                </div>
                <div className="bg-page rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{user.security_level}</p>
                  <p className="text-xs text-text-secondary">Уровень безопасности</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-card p-6 mt-6"
          >
            <h2 className="font-display font-bold text-lg mb-4">
              Достижения ({achievements.filter(a => a.earned).length}/{achievements.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div key={ach.id} className={!ach.earned ? 'opacity-40' : ''}>
                  <AchievementBadge
                    achievement={{
                      slug: ach.slug,
                      title: ach.title,
                      description: ach.description,
                      icon: ach.icon,
                      rarity: ach.rarity,
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
