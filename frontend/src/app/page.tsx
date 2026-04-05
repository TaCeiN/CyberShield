'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { IconShield, IconTrophy, IconChart, IconHedgehog } from '@/components/icons/Icons';
import { ReactNode } from 'react';

const features: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: <IconShield size={32} className="text-primary" />,
    title: 'Интерактивные сценарии',
    description: 'Проходите реалистичные симуляции кибератак в безопасной среде',
  },
  {
    icon: <IconTrophy size={32} className="text-primary" />,
    title: 'Игровая механика',
    description: 'Зарабатывайте XP, открывайте достижения и поднимайтесь в лигах',
  },
  {
    icon: <IconChart size={32} className="text-primary" />,
    title: 'Отслеживание прогресса',
    description: 'Подробная статистика и визуализация вашего обучения',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <IconHedgehog size={96} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4"
            >
              CyberShield
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto"
            >
              Научись защищать свои данные в интерактивных симуляциях кибератак.
              Тренажёр кибербезопасности от банка Центр-Инвест.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center"
            >
              <Link
                href="/register"
                className="bg-primary text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-primary-hover transition-colors shadow-card"
              >
                Начать обучение
              </Link>
              <Link
                href="/login"
                className="border-2 border-primary text-primary px-8 py-3 rounded-xl text-lg font-semibold hover:bg-primary-bg transition-colors"
              >
                Войти
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Как это работает
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.15 }}
                  className="bg-page rounded-xl p-6 text-center shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
