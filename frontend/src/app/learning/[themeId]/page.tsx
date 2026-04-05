'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useLearningStore } from '@/stores/learningStore';
import { useAuthStore } from '@/stores/authStore';
import { IconHedgehog, IconBook, IconSearch, IconTarget } from '@/components/icons/Icons';

const PasswordCalculator = dynamic(() => import('@/components/interactive/PasswordCalculator'), { ssr: false });
const SocialEngineeringGame = dynamic(() => import('@/components/interactive/SocialEngineeringGame'), { ssr: false });
const PhishingDetective = dynamic(() => import('@/components/interactive/PhishingDetective'), { ssr: false });
const SkimmingCalculator = dynamic(() => import('@/components/interactive/SkimmingCalculator'), { ssr: false });

const INTERACTIVE_MAP: Record<string, { title: string; subtitle: string; Component: React.ComponentType }> = {
  password: { title: 'Калькулятор взлома', subtitle: 'Придумай пароль, который хакеры не смогут подобрать', Component: PasswordCalculator },
  social: { title: 'Звонок из ниоткуда', subtitle: 'Ведите диалог с мошенником — не попадитесь на уловки', Component: SocialEngineeringGame },
  phishing: { title: 'Почтовый Детектив', subtitle: 'Найди фишинговое письмо среди входящих и обезвредь угрозу', Component: PhishingDetective },
  skimming: { title: 'Калькулятор рисков оплаты', subtitle: 'Собери сценарий оплаты и узнай уровень уязвимости', Component: SkimmingCalculator },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ThemeModulesPage() {
  const params = useParams();
  const router = useRouter();
  const themeId = params.themeId as string;

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { themes, modules, isLoading, fetchThemes, fetchThemeModules, clearModules } =
    useLearningStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && themeId) {
      clearModules();
      if (themes.length === 0) fetchThemes();
      fetchThemeModules(themeId);
    }
  }, [isAuthenticated, themeId]);

  const currentTheme = themes.find((t) => t.id === themeId);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-bounce"><IconHedgehog size={48} /></div>
      </div>
    );
  }

  const theoryModule = modules.length > 0 ? modules[0] : null;
  const theory = theoryModule?.stage1_theory;

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-4xl">
          <button
            onClick={() => router.push('/learning')}
            className="text-sm text-text-secondary hover:text-primary mb-4 flex items-center gap-1"
          >
            &larr; К темам
          </button>

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{currentTheme?.icon || ''}</span>
              <div>
                <h1 className="font-display text-2xl font-bold text-text-primary">
                  {currentTheme?.name || 'Тема'}
                </h1>
                <p className="text-text-secondary">{currentTheme?.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Theory summary */}
          {theory && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-card p-6 mb-6 border-l-4 border-primary"
            >
              <h2 className="font-display font-bold text-lg text-primary mb-3 flex items-center gap-2">
                <IconBook size={20} className="text-primary" />
                Краткая теория
              </h2>
              <p className="text-text-primary leading-relaxed text-sm mb-4">
                {theory.definition}
              </p>

              {theory.stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {theory.stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-primary-bg rounded-xl p-3 text-center"
                    >
                      <div className="text-xl font-bold text-primary">{stat.value}</div>
                      <div className="text-xs text-text-secondary mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Red flags preview */}
              {theory.red_flags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-sm text-text-primary mb-2 flex items-center gap-1.5">
                    <IconSearch size={14} className="text-primary" />
                    Красные флаги
                  </h3>
                  <ul className="space-y-1">
                    {theory.red_flags.slice(0, 5).map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-bold mt-0.5">✓</span>
                        <span className="text-text-secondary">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Scenario cards */}
          <h2 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            <IconTarget size={20} className="text-primary" />
            Сценарии ({modules.length})
          </h2>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {modules.map((mod, idx) => (
              <motion.div
                key={mod.scenario_id}
                variants={item}
                whileHover={{ x: 4 }}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border-2 border-transparent hover:border-primary transition-all p-5 flex items-center justify-between cursor-pointer"
                onClick={() => router.push(`/learning/${themeId}/${mod.scenario_id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{mod.title}</h3>
                    <p className="text-text-secondary text-sm mt-0.5">
                      3 этапа: теория → сценарий → разбор
                    </p>
                  </div>
                </div>
                <button className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
                  Начать
                </button>
              </motion.div>
            ))}

            {modules.length === 0 && !isLoading && (
              <div className="text-center py-12 text-text-secondary">
                Модули для этой темы пока не добавлены
              </div>
            )}
          </motion.div>

          {/* Interactive section */}
          {INTERACTIVE_MAP[themeId] && (
            <InteractiveSection themeId={themeId} />
          )}
        </main>
      </div>
    </div>
  );
}

function InteractiveSection({ themeId }: { themeId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const interactive = INTERACTIVE_MAP[themeId];
  if (!interactive) return null;

  const { title, subtitle, Component } = interactive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border-2 border-primary/20 hover:border-primary transition-all p-5 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-primary">Попробовать интерактив</h3>
              <p className="text-text-secondary text-sm">{title} — {subtitle}</p>
            </div>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 mt-3">
              <Component />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
