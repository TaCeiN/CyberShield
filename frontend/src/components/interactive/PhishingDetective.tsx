'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Email {
  id: number;
  from: string;
  fullFrom: string;
  realFrom: string;
  subject: string;
  preview: string;
  time: string;
  body: string;
  isPhish?: boolean;
}

const EMAILS: Email[] = [
  {
    id: 1, from: 'Ozon', fullFrom: 'Ozon <noreply@ozon.ru>', realFrom: 'noreply@ozon.ru',
    subject: 'Ваш заказ #88421 доставлен', preview: 'Ваш заказ успешно доставлен в пункт выдачи...', time: '10:32',
    body: 'Здравствуйте!\n\nВаш заказ #88421 успешно доставлен в пункт выдачи по адресу: ул. Ленина, 25.\n\nСрок хранения: 3 дня.\n\nС уважением, команда Ozon',
  },
  {
    id: 2, from: 'Энергосбыт', fullFrom: 'Энергосбыт <info@energosbyt-city.ru>', realFrom: 'info@energosbyt-city.ru',
    subject: 'Счёт за электроэнергию — ноябрь', preview: 'Ваш счёт на сумму 3 240\u20BD готов к оплате...', time: '09:15',
    body: 'Уважаемый абонент!\n\nВаш счёт за электроэнергию за ноябрь 2024:\n\nСумма: 3 240,50 \u20BD\n\nПоследний день оплаты: 25.12.2024',
  },
  {
    id: 3, from: 'Сбербанк Премия', fullFrom: 'Сбербанк Премия <premia@sberbank-prize.ru>', realFrom: 'support@sberbank-prize.ru',
    subject: 'Вам начислена премия 15 000\u20BD!', preview: 'Поздравляем! Вы получили бонус от программы...', time: '11:47', isPhish: true,
    body: 'Поздравляем!\n\nВы стали участником программы лояльности \u00ABСбербанк Премия\u00BB!\n\nНа ваш бонусный счёт зачислено 15 000\u20BD.\n\nДля активации бонуса необходимо подтвердить данные:\n\n[Забрать деньги \u2192 sberbank-prize.ru/activate]\n\nПредложение действует 24 часа.\n\nСлужба клиентских программ',
  },
  {
    id: 4, from: 'IT-отдел', fullFrom: 'IT-отдел <it-support@company.ru>', realFrom: 'it-support@company.ru',
    subject: 'Плановое обновление системы', preview: '20.12 состоится плановое обновление...', time: '08:00',
    body: 'Уважаемые сотрудники!\n\n20.12.2024 с 22:00 до 02:00 состоится плановое обновление системы безопасности.\n\nВ это время корпоративная почта будет недоступна.\n\nНикаких действий от вас не требуется.\n\nIT-отдел',
  },
  {
    id: 5, from: 'Анна Клиентова', fullFrom: 'Анна Клиентова <anna.k@partner-firm.ru>', realFrom: 'anna.k@partner-firm.ru',
    subject: 'Встреча по проекту \u00ABАльфа\u00BB', preview: 'Подтверждаю встречу на 18 декабря в 14:00...', time: '14:20',
    body: 'Добрый день!\n\nПодтверждаю встречу по проекту \u00ABАльфа\u00BB на 18 декабря в 14:00.\n\nМесто: переговорная №3, 5 этаж.\n\nПовестка: обсуждение сроков, бюджет, следующие шаги.\n\nДо встречи!\nАнна Клиентова',
  },
];

export default function PhishingDetective() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showHeaders, setShowHeaders] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [resultType, setResultType] = useState<'correct' | 'wrong_safe' | 'clicked' | null>(null);
  const [resultText, setResultText] = useState('');

  const selectedEmail = EMAILS.find((e) => e.id === selectedId);

  const handleReport = (id: number) => {
    if (gameOver) return;
    setGameOver(true);
    const email = EMAILS.find((e) => e.id === id)!;
    if (email.isPhish) {
      setResultType('correct');
      setResultText('Домен sberbank-prize.ru — поддельный. Настоящий домен Сбербанка — sberbank.ru. Вы не перешли по ссылке и сообщили о подозрительном письме.');
    } else {
      setResultType('wrong_safe');
      setResultText('Это письмо от настоящего отправителя — домен совпадает с официальным. Не стоит отправлять легитимные письма в спам: так вы можете пропустить важные уведомления в будущем.');
    }
  };

  const handleLinkClick = () => {
    if (gameOver) return;
    setGameOver(true);
    setResultType('clicked');
    setResultText('Вы перешли по поддельной ссылке. Логин и пароль были перехвачены мошенниками. Всегда проверяйте адрес в строке браузера перед вводом данных.');
  };

  const restart = () => {
    setSelectedId(null);
    setShowHeaders(null);
    setGameOver(false);
    setResultType(null);
    setResultText('');
  };

  const getHeadersContent = (email: Email) => {
    const isPhish = email.isPhish;
    return {
      domain: isPhish ? 'sberbank-prize.ru' : email.realFrom.split('@')[1],
      spf: isPhish ? 'FAIL' : 'PASS',
      dkim: isPhish ? 'FAIL' : 'PASS',
      warning: isPhish
        ? 'Домен отправителя НЕ совпадает с официальным доменом Сбербанка (sberbank.ru)'
        : 'Домен отправителя совпадает с официальным',
    };
  };

  return (
    <div>
      {/* Mail client */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 px-3 py-1 border border-gray-200 rounded-lg bg-white text-xs text-gray-400 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Поиск...
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[400px]">
          {/* Email list */}
          <div className="border-r border-gray-200 overflow-y-auto max-h-[440px]">
            {EMAILS.map((email) => (
              <div
                key={email.id}
                onClick={() => { if (!gameOver) { setSelectedId(email.id); setShowHeaders(null); } }}
                className={`px-3 py-2.5 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedId === email.id ? 'bg-green-50 border-l-[3px] border-l-primary' :
                  gameOver && email.isPhish && (resultType === 'correct' || resultType === 'clicked') ? 'bg-orange-50 border-l-[3px] border-l-orange-400' :
                  'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm">{email.from}</span>
                  <span className="text-xs text-gray-400">{email.time}</span>
                </div>
                <div className="text-sm text-text-primary truncate">{email.subject}</div>
                <div className="text-xs text-gray-400 truncate">{email.preview}</div>
              </div>
            ))}
          </div>

          {/* Email detail */}
          <div className="p-5 overflow-y-auto max-h-[440px]">
            {!selectedEmail ? (
              <div className="text-center text-gray-400 py-12 text-sm">
                Выберите письмо из списка
              </div>
            ) : (
              <div>
                <div className="mb-4 pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-base mb-1">{selectedEmail.subject}</h3>
                  <div className="text-sm text-gray-500">
                    От: <span className="text-text-primary font-medium">{selectedEmail.fullFrom}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Кому: <span className="text-text-primary font-medium">you@company.ru</span>
                  </div>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-line text-text-primary">
                  {selectedEmail.body.split('\n').map((line, i) => {
                    if (line.includes('[Забрать деньги')) {
                      return (
                        <span key={i}>
                          <button
                            onClick={handleLinkClick}
                            className="text-blue-600 underline hover:text-red-500 cursor-pointer"
                            title="sberbank-prize.ru/activate"
                          >
                            Забрать деньги
                          </button>
                          {' '}
                          <span className="text-xs text-gray-400">(наведите для URL)</span>
                          {'\n'}
                        </span>
                      );
                    }
                    return <span key={i}>{line}{'\n'}</span>;
                  })}
                </div>

                {/* Actions */}
                {!gameOver && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setShowHeaders(showHeaders === selectedEmail.id ? null : selectedEmail.id)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:border-primary hover:bg-green-50 transition-all"
                    >
                      Показать заголовки
                    </button>
                    <button
                      onClick={() => handleReport(selectedEmail.id)}
                      className="px-3 py-1.5 border border-red-300 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-all"
                    >
                      Это фишинг
                    </button>
                  </div>
                )}

                {/* Headers */}
                <AnimatePresence>
                  {showHeaders === selectedEmail.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-gray-50 rounded-lg font-mono text-xs leading-relaxed overflow-hidden"
                    >
                      {(() => {
                        const h = getHeadersContent(selectedEmail);
                        return (
                          <>
                            <p className="font-bold mb-2">Заголовки письма:</p>
                            <p>Return-Path: &lt;{selectedEmail.realFrom}&gt;</p>
                            <p>From: {selectedEmail.fullFrom}</p>
                            <p className={selectedEmail.isPhish ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
                              {selectedEmail.isPhish ? '\u26A0 ' : '\u2713 '}{h.warning}
                            </p>
                            <p>Received: from mail.{h.domain}</p>
                            <p>SPF: <span className={h.spf === 'PASS' ? 'text-green-600' : 'text-red-500'}>{h.spf}</span></p>
                            <p>DKIM: <span className={h.dkim === 'PASS' ? 'text-green-600' : 'text-red-500'}>{h.dkim}</span></p>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {resultType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl text-center font-bold ${
              resultType === 'clicked'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : resultType === 'correct'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
            }`}
          >
            <div className="text-lg mb-1">
              {resultType === 'clicked' ? 'Данные перехвачены' :
               resultType === 'correct' ? 'Верно — это фишинговое письмо' :
               'Это письмо безопасное'}
            </div>
            <div className="text-sm font-normal">{resultText}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {gameOver && (
        <div className="text-center mt-3">
          <button onClick={restart} className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors text-sm">
            Начать заново
          </button>
        </div>
      )}
    </div>
  );
}
