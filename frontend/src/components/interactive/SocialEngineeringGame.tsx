'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Choice {
  text: string;
  next: number;
}

interface Node {
  speaker: string;
  text: string;
  urgent: boolean;
  choices?: Choice[];
  next?: number;
}

const SE_NODES: Record<number, Node> = {
  0: {
    speaker: 'bank',
    text: 'Здравствуйте! Это служба безопасности вашего банка. Мы зафиксировали подозрительную операцию на 47 000\u20BD.',
    urgent: false,
    choices: [
      { text: '\u00ABКакие последние 4 цифры? Я ничего не давал\u00BB', next: 1 },
      { text: '\u00ABОй, а какая сумма списывается?\u00BB', next: 2 },
      { text: '\u00ABПодождите, я сейчас посмотрю карту...\u00BB', next: 3 },
    ],
  },
  1: {
    speaker: 'bank',
    text: 'Операция уже в обработке! У вас 30 секунд, иначе деньги будут списаны безвозвратно!',
    urgent: true,
    choices: [
      { text: '\u00ABЯ кладу трубку и перезвоню в банк по номеру с карты\u00BB', next: 5 },
      { text: '\u00ABЛадно, диктую...\u00BB', next: 6 },
    ],
  },
  2: {
    speaker: 'bank',
    text: 'Списание в интернет-магазине \u2014 47 000\u20BD! Если не подтвердите сейчас, деньги уйдут безвозвратно!',
    urgent: true,
    choices: [
      { text: '\u00ABЭто не я! Блокируйте карту!\u00BB', next: 1 },
      { text: '\u00ABА какой магазин?\u00BB', next: 4 },
    ],
  },
  3: {
    speaker: 'bank',
    text: 'Время истекает! Карта будет заблокирована только после подтверждения. Код уже отправлен!',
    urgent: true,
    choices: [
      { text: '\u00ABЯ не буду диктовать код. Перезвоню сам.\u00BB', next: 5 },
      { text: '\u00ABХорошо, код...\u00BB', next: 6 },
    ],
  },
  4: {
    speaker: 'bank',
    text: 'Это неважно! Главное \u2014 защитить ваши деньги. Код из СМС \u2014 единственное подтверждение. Называйте!',
    urgent: true,
    choices: [
      { text: '\u00ABНет. Я перезвоню сам.\u00BB', next: 5 },
      { text: '\u00ABНу ладно, код 4821\u00BB', next: 6 },
    ],
  },
  // --- endings ---
  5: {
    speaker: 'system',
    text: 'Звонок завершён. Вы положили трубку и перезвонили в банк по официальному номеру.',
    urgent: false,
    next: 7,
  },
  6: {
    speaker: 'system',
    text: 'Вы продиктовали код. Через 5 минут пришло СМС: \u00ABПеревод 47 000\u20BD выполнен успешно\u00BB.',
    urgent: false,
    next: 8,
  },
  7: {
    speaker: 'bank',
    text: '\u00ABСпасибо за обращение! Мы зафиксировали попытку мошенничества. Ваш номер в чёрном списке.\u00BB',
    urgent: false,
    next: -1, // WIN ending
  },
  8: {
    speaker: 'system',
    text: 'Счёт обнулён. Мошенники получили полный доступ к вашему счёту.',
    urgent: false,
    next: -1, // LOSE ending
  },
};

// Win is determined by reaching node 7 (→ node 5 → safe path)
// Lose is determined by reaching node 8 (→ node 6 → scam path)
const WIN_NODE = 7;
const LOSE_NODE = 8;

interface ChatMessage {
  type: 'incoming' | 'outgoing';
  text: string;
  urgent: boolean;
}

export default function SocialEngineeringGame() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNode, setCurrentNode] = useState<number>(0);
  const [phase, setPhase] = useState<'ringing' | 'active' | 'done'>('ringing');
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track which terminal node we last visited to decide win/lose
  const lastNodeRef = useRef<number>(0);

  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const showNode = useCallback((nid: number) => {
    const node = SE_NODES[nid];
    if (!node) return;

    lastNodeRef.current = nid;

    setMessages((prev) => [
      ...prev,
      { type: 'incoming', text: node.text, urgent: node.urgent },
    ]);

    if (node.next === -1) {
      // Terminal node — decide win/lose by WHICH terminal we hit
      setTimeout(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setPhase('done');
        setResult(nid === WIN_NODE ? 'win' : 'lose');
      }, 1500);
    } else if (node.choices) {
      setTimeout(() => setShowChoices(true), 600);
    } else if (node.next !== undefined) {
      setTimeout(() => showNode(node.next!), 800);
    }
  }, []);

  const handleAccept = () => {
    setPhase('active');
    showNode(0);
  };

  const handleDecline = () => {
    setPhase('done');
    setResult('win');
  };

  const handleChoice = (choice: Choice) => {
    setShowChoices(false);
    setMessages((prev) => [
      ...prev,
      { type: 'outgoing', text: choice.text, urgent: false },
    ]);
    setCurrentNode(choice.next);
    setTimeout(() => showNode(choice.next), 800);
  };

  const restart = () => {
    setMessages([]);
    setCurrentNode(0);
    setPhase('ringing');
    setResult(null);
    setCallSeconds(0);
    setShowChoices(false);
    lastNodeRef.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const timerStr = `${String(Math.floor(callSeconds / 60)).padStart(2, '0')}:${String(callSeconds % 60).padStart(2, '0')}`;
  const node = SE_NODES[currentNode];

  const declinedDirectly = phase === 'done' && result === 'win' && messages.length === 0;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Modern phone frame — fixed size */}
      <div className="w-[375px] h-[700px] flex flex-col relative bg-black rounded-[44px] p-[3px] shadow-2xl">
        {/* Inner bezel */}
        <div className="flex-1 flex flex-col bg-white rounded-[42px] overflow-hidden relative">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-2">
            <div className="w-[120px] h-[28px] bg-black rounded-full" />
          </div>

          {/* Status bar */}
          <div className="relative z-10 flex justify-between items-center px-8 pt-3 pb-1 text-[11px] font-semibold">
            <span className="text-black">9:41</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M1 20h22M5 12a7 7 0 0 1 14 0M9 16a3 3 0 0 1 6 0" />
              </svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="1" y="6" width="4" height="14" rx="1" />
                <rect x="7" y="4" width="4" height="16" rx="1" />
                <rect x="13" y="2" width="4" height="18" rx="1" />
                <rect x="19" y="0" width="4" height="20" rx="1" />
              </svg>
              <div className="flex items-center">
                <div className="w-[22px] h-[10px] border border-current rounded-[3px] relative">
                  <div className="absolute inset-[1.5px] bg-current rounded-[1px]" style={{ width: '60%' }} />
                </div>
                <div className="w-[1.5px] h-[4px] bg-current rounded-r-full ml-[0.5px]" />
              </div>
            </div>
          </div>

          {/* Call header */}
          <div
            className={`text-white text-center py-6 px-4 transition-colors duration-300 ${
              declinedDirectly ? 'bg-green-600' : 'bg-gradient-to-b from-red-500 to-red-600'
            }`}
          >
            {/* Caller avatar */}
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-3 flex items-center justify-center">
              {declinedDirectly ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <div className="font-bold text-lg tracking-wide">
              {declinedDirectly ? 'Вызов отклонён' : 'Служба Безопасности'}
            </div>
            <div className="text-sm opacity-80 mt-0.5">
              {declinedDirectly ? 'Правильное решение!' : '+7 (800) ***-**-**'}
            </div>
            <div className="text-xs mt-1 font-mono opacity-70">
              {phase === 'ringing'
                ? 'Входящий звонок...'
                : phase === 'active'
                  ? timerStr
                  : 'Завершён'}
            </div>
          </div>

          {/* Chat area — fills remaining space */}
          <div
            ref={chatRef}
            className="flex-1 bg-[#f2f2f7] px-3 py-3 overflow-y-auto space-y-2"
          >
            {messages.length === 0 && phase === 'ringing' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400 text-sm">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center animate-pulse">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  Нажмите &laquo;Ответить&raquo; чтобы начать
                </div>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${msg.type === 'outgoing' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.type === 'outgoing'
                        ? 'bg-primary text-white rounded-[18px] rounded-br-[4px]'
                        : msg.urgent
                          ? 'bg-red-50 border border-red-200 text-red-800 font-medium rounded-[18px] rounded-bl-[4px]'
                          : 'bg-white text-gray-800 rounded-[18px] rounded-bl-[4px] shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Choices */}
          <AnimatePresence>
            {showChoices && node?.choices && phase === 'active' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="px-3 py-3 border-t border-gray-200 bg-white space-y-2"
              >
                {node.choices.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(ch)}
                    className="w-full text-left px-4 py-2.5 border-2 border-gray-100 rounded-2xl text-[13px] leading-snug hover:border-primary hover:bg-green-50 transition-all active:scale-[0.98]"
                  >
                    {ch.text}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone buttons — ringing state */}
          {phase === 'ringing' && (
            <div className="flex justify-center gap-12 py-5 bg-white border-t border-gray-100">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleDecline}
                  className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 21.46l-2.83-2.83M16.5 13.5C16.5 13.5 19 11 19 8.5a4.49 4.49 0 00-9 0c0 2.5 2.5 5 2.5 5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1 1l22 22" strokeLinecap="round" />
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="text-[11px] text-red-500 font-medium">Отклонить</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleAccept}
                  className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-200 animate-pulse"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="text-[11px] text-green-600 font-medium">Ответить</span>
              </div>
            </div>
          )}

          {/* Home indicator */}
          <div className="flex justify-center py-2 bg-white">
            <div className="w-[134px] h-[5px] bg-gray-900 rounded-full" />
          </div>
        </div>
      </div>

      {/* Result card — outside phone */}
      <AnimatePresence>
        {result && phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`w-full max-w-[375px] p-5 rounded-2xl text-center font-bold ${
              result === 'win'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            <div className="text-lg mb-1">
              {result === 'win' ? 'Вы распознали мошенника' : 'Счёт скомпрометирован'}
            </div>
            <div className="text-sm font-normal">
              {result === 'win'
                ? 'Попытка мошенничества зафиксирована. Ваш счёт в безопасности. Настоящий банк никогда не просит код из СМС по телефону.'
                : 'Мошенники получили доступ к вашему счёту. Запомните: никогда не сообщайте коды из СМС, даже если звонящий представляется сотрудником банка.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restart */}
      {phase === 'done' && (
        <button
          onClick={restart}
          className="px-6 py-2.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-hover transition-colors text-sm active:scale-95"
        >
          Начать заново
        </button>
      )}
    </div>
  );
}
