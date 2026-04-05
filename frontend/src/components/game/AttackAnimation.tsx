'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AttackAnimationProps {
  attackType: string;
  show: boolean;
  consequence: string | null;
  onClose: () => void;
}

export default function AttackAnimation({ attackType, show, consequence, onClose }: AttackAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full"
          >
            {attackType === 'phishing' && <PhishingAnimation consequence={consequence} />}
            {attackType === 'social_engineering' && <SocialEngineeringAnimation consequence={consequence} />}
            {attackType === 'mitm' && <MitmAnimation consequence={consequence} />}
            {attackType === 'password_brute' && <BruteForceAnimation consequence={consequence} />}
            {attackType === 'skimming' && <SkimmingAnimation consequence={consequence} />}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={onClose}
              className="w-full mt-4 bg-white text-text-primary py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Продолжить
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PhishingAnimation({ consequence }: { consequence: string | null }) {
  const [lines, setLines] = useState<string[]>([]);
  const terminalLines = [
    '> Подключение к серверу...',
    '> Получен доступ к аккаунту...',
    '> Скачивание контактов...',
    '> Отправка спама от вашего имени...',
    '> Готово.',
  ];

  useEffect(() => {
    terminalLines.forEach((line, idx) => {
      setTimeout(() => setLines((prev) => [...prev, line]), (idx + 1) * 500);
    });
  }, []);

  return (
    <div className="rounded-xl overflow-hidden">
      <motion.div
        animate={{ backgroundColor: ['#1a1a2e', '#3b0000', '#1a1a2e'] }}
        transition={{ duration: 1, repeat: 3 }}
        className="p-6"
      >
        <div className="font-mono text-sm space-y-2">
          {lines.map((line, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-green-400"
            >
              {line}
            </motion.p>
          ))}
        </div>
        {consequence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="mt-4 p-4 bg-red-900/50 rounded-lg border border-red-500"
          >
            <p className="text-red-300 text-sm">{consequence}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function SocialEngineeringAnimation({ consequence }: { consequence: string | null }) {
  const fakeData = [
    { label: 'ФИО', value: 'Иванов Пётр Сергеевич' },
    { label: 'Телефон', value: '+7 (999) 123-45-67' },
    { label: 'Email', value: 'ivanov@example.com' },
    { label: 'Адрес', value: 'г. Ростов-на-Дону' },
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-400 font-bold text-center mb-4"
      >
        \! Злоумышленник получил ваши данные
      </motion.p>
      <div className="space-y-3">
        {fakeData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: Math.random() > 0.5 ? 100 : -100, rotate: Math.random() * 20 - 10 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.5 + idx * 0.3, type: 'spring' }}
            className="bg-gray-800 rounded-lg p-3 border border-red-500/30"
          >
            <p className="text-gray-400 text-xs">{item.label}</p>
            <p className="text-white text-sm font-mono">{item.value}</p>
          </motion.div>
        ))}
      </div>
      {consequence && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="text-red-300 text-sm mt-4 text-center"
        >
          {consequence}
        </motion.p>
      )}
    </div>
  );
}

function MitmAnimation({ consequence }: { consequence: string | null }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center justify-center gap-4 mb-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-3xl border-2 border-blue-500">
            👤
          </div>
          <p className="text-blue-400 text-xs mt-2">Вы</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-3xl border-2 border-red-500">
            🕵️
          </div>
          <p className="text-red-400 text-xs mt-2">Хакер</p>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-3xl border-2 border-green-500">
            🖥️
          </div>
          <p className="text-green-400 text-xs mt-2">Сервер</p>
        </motion.div>
      </div>

      {/* Data flow */}
      <div className="space-y-2">
        {['Логин: user@mail.ru', 'Пароль: ********', 'Cookie: session_id=abc123'].map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 + idx * 0.5 }}
            className="bg-red-900/30 rounded px-3 py-1 text-red-300 text-xs font-mono text-center border border-red-500/20"
          >
            🔓 {line}
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="text-red-400 font-bold text-center mt-4"
      >
        Ваш трафик перехвачен
      </motion.p>
      {consequence && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
          className="text-red-300 text-sm mt-2 text-center"
        >
          {consequence}
        </motion.p>
      )}
    </div>
  );
}

function BruteForceAnimation({ consequence }: { consequence: string | null }) {
  const [passwords, setPasswords] = useState<string[]>([]);
  const [cracked, setCracked] = useState(false);

  useEffect(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const interval = setInterval(() => {
      const pw = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      setPasswords((prev) => [...prev.slice(-8), pw]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setCracked(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <p className="text-gray-400 text-sm text-center mb-4">Подбор пароля...</p>

      <div className="font-mono text-xs space-y-0.5 mb-4 max-h-40 overflow-hidden">
        {passwords.map((pw, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-yellow-400"
          >
            Попытка: {pw}
          </motion.p>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-red-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3 }}
        />
      </div>

      {cracked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <p className="text-green-400 font-bold text-2xl mb-2">PASSWORD CRACKED</p>
          <p className="text-gray-400 text-sm">Время взлома: 0.3 секунды</p>
          {consequence && (
            <p className="text-red-300 text-sm mt-3">{consequence}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function SkimmingAnimation({ consequence }: { consequence: string | null }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="text-center mb-6">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: 3, duration: 1 }}
          className="text-6xl"
        >
          💳
        </motion.div>
      </div>

      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-gray-800 rounded-lg p-3 border border-red-500/30"
        >
          <p className="text-gray-400 text-xs">Номер карты</p>
          <p className="text-white font-mono">4276 **** **** 1234</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="bg-gray-800 rounded-lg p-3 border border-red-500/30"
        >
          <p className="text-gray-400 text-xs">PIN-код (с камеры)</p>
          <p className="text-white font-mono">****</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="bg-red-900/50 rounded-lg p-3 border border-red-500"
        >
          <p className="text-red-300 text-sm text-center font-bold">
            Данные вашей карты скопированы
          </p>
        </motion.div>
      </div>

      {consequence && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="text-red-300 text-sm mt-4 text-center"
        >
          {consequence}
        </motion.p>
      )}
    </div>
  );
}
