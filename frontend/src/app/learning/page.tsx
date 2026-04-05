'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useLearningStore } from '@/stores/learningStore';
import { useAuthStore } from '@/stores/authStore';
import { IconHedgehog, IconGraduate } from '@/components/icons/Icons';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LearningThemesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { themes, isLoading, fetchThemes } = useLearningStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchThemes();
    }
  }, [isAuthenticated, fetchThemes]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-bounce"><IconHedgehog size={48} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold text-text-primary flex items-center gap-3">
              <IconGraduate size={32} className="text-primary" />
              Обучающие модули
            </h1>
            <p className="text-text-secondary mt-2 text-lg">
              Пройди теорию и интерактивные сценарии по кибербезопасности
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {themes.map((theme) => (
              <motion.div
                key={theme.id}
                variants={item}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/learning/${theme.id}`)}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border-2 border-transparent hover:border-primary transition-all cursor-pointer p-6 flex flex-col"
              >
                <div className="text-5xl mb-4">{theme.icon}</div>
                <h3 className="font-display font-bold text-lg text-text-primary mb-2">
                  {theme.name}
                </h3>
                <p className="text-text-secondary text-sm flex-1 leading-relaxed">
                  {theme.description}
                </p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-secondary">
                    {theme.scenarios_count}{' '}
                    {theme.scenarios_count === 1
                      ? 'сценарий'
                      : theme.scenarios_count < 5
                      ? 'сценария'
                      : 'сценариев'}
                  </span>
                  <span className="text-primary text-sm font-semibold">
                    Открыть →
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
