'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useLearningStore } from '@/stores/learningStore';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { IconHedgehog, IconTarget } from '@/components/icons/Icons';

const THEME_ICONS: Record<string, React.ReactNode> = {
  phishing: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.5">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  skimming: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.5">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
    </svg>
  ),
  password: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="#2e7d32" />
    </svg>
  ),
  social: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

export default function ScenariosPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { themes, fetchThemes, isLoading } = useLearningStore();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && themes.length === 0) fetchThemes();
  }, [isAuthenticated, themes.length, fetchThemes]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <IconTarget size={28} className="text-primary" />
            <h1 className="font-display text-2xl font-bold text-text-primary">Обучающие модули</h1>
          </div>
          <p className="text-text-secondary mb-6">
            16 модулей по 4 темам — от фишинговых писем до защиты паролей
          </p>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4 animate-bounce"><IconHedgehog size={48} /></div>
              <p className="text-text-secondary">Загрузка модулей...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {themes.map((theme, idx) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => router.push(`/learning/${theme.id}`)}
                  className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-all border-2 border-transparent hover:border-primary cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                      {THEME_ICONS[theme.id] || (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                        {theme.name}
                      </h2>
                      <p className="text-text-secondary text-sm mt-1">{theme.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          {theme.scenarios_count} модулей
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-gray-300 group-hover:text-primary transition-colors mt-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
