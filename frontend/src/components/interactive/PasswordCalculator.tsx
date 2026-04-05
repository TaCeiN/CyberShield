'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON = ['password','123456','12345678','qwerty','abc123','monkey','master','dragon','111111','baseball','iloveyou','trustno1','sunshine','princess','welcome','shadow','superman','michael','password1','123123','letmein','admin','login','starwars','hello','charlie','donald','football','passw0rd','qwe123','123qwe','qwerty123','password123','1234567890','1234567','12345','password2','1q2w3e4r','asdfgh','zxcvbn','qwerty1','000000','11111111','1qaz2wsx','123456789','1234','p@ssword','p@ssw0rd','Pa$$w0rd','qwertyuiop','asdf1234','zaq12wsx','test','guest','admin123','root','pass','abcd','test123','654321','121212'];

interface CriteriaState {
  len: boolean;
  up: boolean;
  lo: boolean;
  dig: boolean;
  spc: boolean;
  com: boolean;
}

export default function PasswordCalculator() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const calcResult = useCallback((pwd: string) => {
    const criteria: CriteriaState = {
      len: pwd.length >= 8,
      up: /[A-Z]/.test(pwd),
      lo: /[a-z]/.test(pwd),
      dig: /[0-9]/.test(pwd),
      spc: /[^a-zA-Z0-9]/.test(pwd),
      com: !COMMON.includes(pwd.toLowerCase()),
    };

    let score = 0;
    if (criteria.len) score += 15;
    if (criteria.up) score += 15;
    if (criteria.lo) score += 15;
    if (criteria.dig) score += 15;
    if (criteria.spc) score += 15;
    if (criteria.com) score += 15;
    if (pwd.length >= 12) score += 5;
    if (pwd.length >= 16) score += 5;

    let charset = 0;
    if (/[a-z]/.test(pwd)) charset += 26;
    if (/[A-Z]/.test(pwd)) charset += 26;
    if (/[0-9]/.test(pwd)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) charset += 32;

    let combinations: number;
    if (COMMON.includes(pwd.toLowerCase())) combinations = COMMON.indexOf(pwd.toLowerCase()) + 1;
    else if (charset > 0 && pwd.length > 0) combinations = Math.pow(charset, pwd.length);
    else combinations = 0;

    const gps = 1e10;
    const seconds = combinations / gps;

    let timeStr: string, method: string, status: string, statusColor: string;
    if (!pwd) {
      timeStr = '\u2014'; method = '\u2014'; status = '\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u0432\u0432\u043E\u0434\u0430...'; statusColor = '#888';
    } else if (COMMON.includes(pwd.toLowerCase())) {
      timeStr = 'Мгновенно'; method = 'Словарь популярных паролей'; status = 'Взломан'; statusColor = '#ef5350';
    } else if (seconds < 1) {
      timeStr = 'Мгновенно'; method = 'Полный перебор'; status = 'Взломан'; statusColor = '#ef5350';
    } else if (seconds < 60) {
      timeStr = Math.round(seconds) + ' сек'; method = 'Полный перебор'; status = 'Слабый'; statusColor = '#ef5350';
    } else if (seconds < 3600) {
      timeStr = Math.round(seconds / 60) + ' мин'; method = 'Полный перебор'; status = 'Средний'; statusColor = '#ffa726';
    } else if (seconds < 86400) {
      timeStr = Math.round(seconds / 3600) + ' ч'; method = 'Гибридная атака'; status = 'Приемлемый'; statusColor = '#ffa726';
    } else if (seconds < 86400 * 365) {
      timeStr = Math.round(seconds / 86400) + ' дн'; method = 'Гибридная атака'; status = 'Хороший'; statusColor = '#4caf50';
    } else if (seconds < 86400 * 365 * 1000) {
      timeStr = Math.round(seconds / (86400 * 365)) + ' лет'; method = 'Перебор'; status = 'Сильный'; statusColor = '#4caf50';
    } else {
      timeStr = (seconds / (86400 * 365 * 1e6)).toFixed(0) + ' млн лет'; method = 'Невозможен'; status = 'Непробиваемый'; statusColor = '#2e7d32';
    }

    const strengthLabel = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Сильный', 'Непробиваемый'][Math.min(5, Math.floor(score / 20))];
    const barColor = score < 30 ? '#ef5350' : score < 60 ? '#ffa726' : '#4caf50';

    let resultType: 'hacked' | 'safe' | null = null;
    let resultText = '';
    if (pwd.length > 0) {
      if (score < 40) {
        resultType = 'hacked';
        resultText = 'Злоумышленник получает доступ к почте, фотографиям, переписке и банковским данным';
      } else if (score >= 80) {
        resultType = 'safe';
        resultText = 'Этот пароль устойчив к подбору — на взлом уйдут годы';
      }
    }

    return {
      criteria, score, timeStr, method, status, statusColor,
      strengthLabel, barColor, combinations, resultType, resultText,
    };
  }, []);

  const r = calcResult(password);

  const criteriaLabels: Record<keyof CriteriaState, string> = {
    len: 'Минимум 8 символов',
    up: 'Заглавная буква',
    lo: 'Строчная буква',
    dig: 'Цифра',
    spc: 'Спецсимвол (!@#$...)',
    com: 'Не из популярных паролей',
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: input */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Введи пароль для проверки</h3>
          <div className="relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль..."
              className={`w-full px-4 py-3 pr-12 border-2 rounded-xl font-mono text-base transition-colors focus:outline-none ${
                !password ? 'border-gray-200 focus:border-primary' :
                r.score < 30 ? 'border-red-400' :
                r.score < 60 ? 'border-orange-400' : 'border-green-500'
              }`}
              autoComplete="off"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              {showPassword ? 'Скрыть' : 'Показать'}
            </button>
          </div>

          {/* Strength bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-1">
            <motion.div
              className="h-full rounded-full"
              style={{ background: r.barColor }}
              animate={{ width: `${Math.min(100, r.score)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm font-semibold mb-4" style={{ color: r.barColor }}>
            {password ? r.strengthLabel : 'Введите пароль'}
          </p>

          {/* Criteria */}
          <ul className="space-y-1.5">
            {(Object.keys(criteriaLabels) as Array<keyof CriteriaState>).map((key) => (
              <li key={key} className={`flex items-center gap-2 text-sm ${r.criteria[key] ? 'text-green-700' : 'text-red-500'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {r.criteria[key] ? (
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                {criteriaLabels[key]}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: hacker panel */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Оценка хакера</h3>
          <div className="bg-[#1a1a2e] text-green-400 rounded-2xl p-5 font-mono text-sm space-y-2 min-h-[200px]">
            <div className="text-center text-4xl mb-3">
              <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
              </svg>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Время подбора:</span>
              <span className="font-bold" style={{ color: r.statusColor }}>{r.timeStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Комбинаций:</span>
              <span className="font-bold">
                {password ? (r.combinations > 999999999999 ? '\u221E' : r.combinations.toLocaleString('ru-RU')) : '\u2014'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Метод:</span>
              <span className="font-bold">{r.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Статус:</span>
              <span className="font-bold" style={{ color: r.statusColor }}>{r.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {r.resultType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 p-4 rounded-xl text-center font-bold ${
              r.resultType === 'hacked'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            <div className="text-lg mb-1">
              {r.resultType === 'hacked' ? 'Пароль скомпрометирован' : 'Доступ защищён'}
            </div>
            <div className="text-sm font-normal">{r.resultText}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
