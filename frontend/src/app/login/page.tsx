'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';
import { IconHedgehog } from '@/components/icons/Icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3"><IconHedgehog size={48} /></div>
            <h1 className="font-display text-2xl font-bold">Вход в CyberShield</h1>
            <p className="text-text-secondary text-sm mt-1">Продолжите обучение кибербезопасности</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            {error && (
              <p className="text-accent-error text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
