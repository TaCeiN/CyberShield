'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import {
  IconShield,
  IconBook,
  IconAlertTriangle,
  IconTarget,
  IconCheckCircle,
  IconHedgehog,
} from '@/components/icons/Icons';

/* ─────────────── SVG icons for themes ─────────────── */

function IconPhishing({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconSkimming({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconPassword({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconSocialEng({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/* ─────────────── Data ─────────────── */

interface GuideTip {
  title: string;
  text: string;
}

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  title: string;
  subtitle: string;
  source: string;
  stats: { value: string; label: string }[];
  tips: GuideTip[];
  links: { label: string; url: string }[];
}

const guides: GuideSection[] = [
  {
    id: 'phishing',
    icon: <IconPhishing size={28} />,
    color: '#2e7d32',
    bgColor: '#e8f5e9',
    title: 'Защита от фишинга',
    subtitle: 'Рекомендации Минцифры РФ и Лаборатории Касперского',
    source: 'Минцифры России, Kaspersky Resource Center, НКЦКИ',
    stats: [
      { value: 'Топ-5', label: 'Россия в мировом рейтинге по числу фишинговых атак' },
      { value: '~50%', label: 'Кибератак на пользователей начинается с фишинга' },
      { value: '50-200 тыс.', label: 'Руб. средний ущерб от успешной атаки' },
    ],
    tips: [
      {
        title: 'Проверяйте адрес отправителя',
        text: 'Фишинговые письма часто приходят с адресов, имитирующих официальные (например, sberbank-security@mail.ru вместо @sberbank.ru). Обращайте внимание на домен после символа @.',
      },
      {
        title: 'Не переходите по ссылкам из писем и SMS',
        text: 'Наведите курсор на ссылку (не нажимая) -- браузер покажет реальный URL. Если домен отличается от официального сайта организации, это фишинг. Вводите адреса банков и Госуслуг вручную.',
      },
      {
        title: 'Проверяйте SSL-сертификат сайта',
        text: 'Убедитесь, что в адресной строке есть значок замка и адрес начинается с https://. Однако наличие замка само по себе не гарантия -- проверяйте и доменное имя.',
      },
      {
        title: 'Обращайте внимание на признаки срочности',
        text: '"Ваш аккаунт будет заблокирован через 24 часа", "Немедленно подтвердите данные" -- типичные маркеры фишинга. Настоящие организации не требуют срочных действий по email.',
      },
      {
        title: 'Не вводите данные карты на незнакомых сайтах',
        text: 'Минцифры рекомендует совершать покупки только на проверенных площадках. Проверяйте наличие сайта в реестре Роскомнадзора при сомнениях.',
      },
      {
        title: 'Используйте антифишинговые функции',
        text: 'Kaspersky Internet Security, встроенная защита Яндекс.Браузера и Google Chrome предупреждают о переходе на фишинговые сайты. Не игнорируйте предупреждения.',
      },
      {
        title: 'Сообщайте о фишинге',
        text: 'Пересылайте подозрительные письма в службу безопасности организации. Сообщить можно на safe-surf.ru (НКЦКИ) или через Госуслуги.',
      },
    ],
    links: [
      { label: 'Минцифры -- раздел Кибербезопасность', url: 'https://digital.gov.ru' },
      { label: 'Касперский -- Предотвращение фишинга', url: 'https://kaspersky.ru/resource-center/preemptive-safety/phishing-prevention' },
      { label: 'НКЦКИ (safe-surf.ru)', url: 'https://safe-surf.ru' },
    ],
  },
  {
    id: 'skimming',
    icon: <IconSkimming size={28} />,
    color: '#1565c0',
    bgColor: '#e3f2fd',
    title: 'Защита от скимминга',
    subtitle: 'По материалам ФинЦЕРТ Банка России и Касперского',
    source: 'ФинЦЕРТ Банка России, Kaspersky Resource Center',
    stats: [
      { value: 'Млрд руб.', label: 'Объём несанкционированных операций с картами ежегодно' },
      { value: '-60%', label: 'Снижение скимминга после перехода на чиповые карты' },
      { value: 'NFC', label: 'Бесконтактная оплата делает скимминг невозможным' },
    ],
    tips: [
      {
        title: 'Осматривайте банкомат перед использованием',
        text: 'Проверяйте картоприёмник -- он не должен шататься, выступать или отличаться по цвету/материалу. Накладки скиммера обычно крепятся поверх штатного разъёма.',
      },
      {
        title: 'Прикрывайте клавиатуру при вводе ПИН-кода',
        text: 'Мошенники устанавливают миниатюрные камеры или накладки на клавиатуру. Всегда закрывайте ладонью руку, вводящую ПИН.',
      },
      {
        title: 'Используйте банкоматы внутри отделений банков',
        text: 'Они находятся под видеонаблюдением и обслуживаются чаще. Уличные банкоматы и устройства в торговых центрах более уязвимы.',
      },
      {
        title: 'Подключите SMS/push-уведомления',
        text: 'Минцифры и Банк России рекомендуют мгновенные уведомления -- это позволяет обнаружить несанкционированную операцию в течение минут и заблокировать карту.',
      },
      {
        title: 'Используйте бесконтактную оплату (NFC)',
        text: 'Apple Pay, Google Pay, Mir Pay генерируют одноразовый токен для каждой транзакции. Карта физически не попадает в считыватель -- скимминг невозможен.',
      },
      {
        title: 'Установите лимиты на операции',
        text: 'В мобильном банке установите дневные лимиты на снятие наличных и переводы. Даже при компрометации карты ущерб будет ограничен.',
      },
      {
        title: 'Заведите отдельную карту для онлайн-покупок',
        text: 'Касперский рекомендует использовать виртуальную карту с минимальным балансом для интернет-платежей, а основные средства хранить на карте, не привязанной к онлайн-сервисам.',
      },
      {
        title: 'При подозрении -- немедленно блокируйте карту',
        text: 'Через мобильное приложение банка или по телефону горячей линии (номер на обратной стороне карты). По закону (ФЗ-161) банк обязан рассмотреть заявление о несанкционированной операции.',
      },
    ],
    links: [
      { label: 'Банк России -- ФинЦЕРТ', url: 'https://cbr.ru/fintech/' },
      { label: 'Касперский -- Безопасность банкоматов', url: 'https://kaspersky.ru/resource-center/preemptive-safety/atm-safety' },
    ],
  },
  {
    id: 'passwords',
    icon: <IconPassword size={28} />,
    color: '#7b1fa2',
    bgColor: '#f3e5f5',
    title: 'Безопасность паролей',
    subtitle: 'Рекомендации Минцифры, Госуслуг и Касперского',
    source: 'Минцифры России, Госуслуги, Kaspersky Resource Center',
    stats: [
      { value: '59%', label: 'Пользователей в РФ используют один пароль для нескольких сервисов' },
      { value: '< 1 сек', label: 'Время подбора 6-символьного пароля из букв' },
      { value: '100+ лет', label: 'Время подбора 12 символов со спецсимволами' },
    ],
    tips: [
      {
        title: 'Используйте длинные пароли (от 12 символов)',
        text: 'Минцифры рекомендует комбинировать заглавные и строчные буквы, цифры и специальные символы. Фразы-пароли ещё надёжнее: "КотСъел3Рыбы!НаБерегу".',
      },
      {
        title: 'Никогда не используйте один пароль для разных сервисов',
        text: 'Утечка базы данных одного сайта скомпрометирует все ваши аккаунты. Каждый сервис -- уникальный пароль.',
      },
      {
        title: 'Включите двухфакторную аутентификацию (2FA)',
        text: 'Приоритет: Госуслуги, электронная почта, банковские приложения, соцсети. Предпочтительно использовать приложения-аутентификаторы (Google Authenticator, Яндекс.Ключ) вместо SMS, так как SMS можно перехватить.',
      },
      {
        title: 'Используйте менеджер паролей',
        text: 'Kaspersky Password Manager, Bitwarden, 1Password -- хранят все пароли в зашифрованном виде. Вам нужно запомнить только один мастер-пароль.',
      },
      {
        title: 'Не сообщайте пароли никому',
        text: 'Ни служба поддержки, ни банк, ни "администратор" не имеют права запрашивать ваш пароль. Любой такой запрос -- мошенничество.',
      },
      {
        title: 'Меняйте пароли при подозрении на утечку',
        text: 'Проверяйте свои адреса на haveibeenpwned.com. Если сервис сообщает об утечке -- немедленно меняйте пароль.',
      },
      {
        title: 'Не сохраняйте пароли в браузере без мастер-пароля',
        text: 'Сохранённые в браузере пароли легко извлекаются вредоносным ПО. Если используете встроенное хранилище -- защитите профиль мастер-паролем.',
      },
    ],
    links: [
      { label: 'Минцифры -- безопасность аккаунтов', url: 'https://digital.gov.ru' },
      { label: 'Касперский -- Безопасность паролей', url: 'https://kaspersky.ru/resource-center/preemptive-safety/password-security' },
      { label: 'Госуслуги -- настройки безопасности', url: 'https://gosuslugi.ru' },
    ],
  },
  {
    id: 'social',
    icon: <IconSocialEng size={28} />,
    color: '#e65100',
    bgColor: '#fff3e0',
    title: 'Защита от социальной инженерии',
    subtitle: 'По материалам МВД, Банка России и Касперского',
    source: 'МВД России, Банк России, Kaspersky Resource Center',
    stats: [
      { value: '15+ млрд', label: 'Руб. ущерб от телефонного мошенничества в РФ за год' },
      { value: '80%', label: 'Успешных кибератак используют социальную инженерию' },
      { value: '#1', label: 'Сценарий -- звонок "из банка" о "безопасном счёте"' },
    ],
    tips: [
      {
        title: 'Банк никогда не просит перевести деньги на "безопасный счёт"',
        text: 'Такого понятия не существует. Любой подобный звонок -- мошенничество. Положите трубку и перезвоните в банк по номеру с официального сайта.',
      },
      {
        title: 'Не доверяйте номеру на экране телефона',
        text: 'Мошенники подменяют номер (caller ID spoofing) -- на экране может отображаться реальный номер банка или полиции. Минцифры рекомендует: всегда перезванивайте самостоятельно.',
      },
      {
        title: 'Никогда не сообщайте коды из SMS',
        text: 'Код подтверждения -- это ваша электронная подпись. Ни банк, ни Госуслуги, ни оператор связи не запрашивают коды по телефону.',
      },
      {
        title: 'Проверяйте информацию через официальные каналы',
        text: 'Если звонят "из полиции" по поводу уголовного дела -- обратитесь в отделение лично или по телефону 02 (102 с мобильного).',
      },
      {
        title: 'Будьте осторожны с незнакомцами в мессенджерах',
        text: 'Мошенники создают поддельные аккаунты руководителей, коллег, родственников. Если "начальник" просит срочно перевести деньги через Telegram -- перезвоните ему голосом.',
      },
      {
        title: 'Не поддавайтесь давлению и срочности',
        text: 'Ключевой приём соцслужбой инженерии -- создание паники: "Прямо сейчас с вашего счёта списывают деньги!" Настоящий банк даёт время разобраться. Мошенник торопит.',
      },
      {
        title: 'Установите определитель номера',
        text: 'Приложения типа Kaspersky Who Calls, Яндекс (определитель номера) предупреждают о звонках с номеров, на которые жаловались другие пользователи.',
      },
      {
        title: 'Расскажите об угрозах пожилым родственникам',
        text: 'Пенсионеры -- основная целевая группа. Объясните основные схемы и договоритесь о кодовом слове для семейных экстренных ситуаций.',
      },
    ],
    links: [
      { label: 'Минцифры -- противодействие мошенничеству', url: 'https://digital.gov.ru' },
      { label: 'Касперский -- Социальная инженерия', url: 'https://kaspersky.ru/resource-center/threats/social-engineering' },
      { label: 'Банк России -- информационная безопасность', url: 'https://cbr.ru/information_security/' },
    ],
  },
];

/* ─────────────── Component ─────────────── */

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function TheoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl font-bold text-text-primary flex items-center gap-3">
              <IconBook size={32} className="text-primary" />
              Гайды по защите
            </h1>
            <p className="text-text-secondary mt-2 text-lg">
              Рекомендации Минцифры РФ, Лаборатории Касперского и Банка России
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs bg-primary-bg text-primary px-3 py-1 rounded-full font-medium">Минцифры России</span>
              <span className="text-xs bg-primary-bg text-primary px-3 py-1 rounded-full font-medium">Kaspersky</span>
              <span className="text-xs bg-primary-bg text-primary px-3 py-1 rounded-full font-medium">Банк России</span>
              <span className="text-xs bg-primary-bg text-primary px-3 py-1 rounded-full font-medium">НКЦКИ</span>
              <span className="text-xs bg-primary-bg text-primary px-3 py-1 rounded-full font-medium">МВД России</span>
            </div>
          </motion.div>

          {/* Guide sections */}
          <div className="space-y-6">
            {guides.map((guide, idx) => {
              const isOpen = openSection === guide.id;

              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-card overflow-hidden"
                >
                  {/* Card header -- always visible */}
                  <button
                    onClick={() => setOpenSection(isOpen ? null : guide.id)}
                    className="w-full text-left p-6 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: guide.bgColor, color: guide.color }}
                    >
                      {guide.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display font-bold text-xl text-text-primary">
                        {guide.title}
                      </h2>
                      <p className="text-text-secondary text-sm mt-0.5">{guide.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full hidden sm:block">
                        {guide.tips.length} рекомендаций
                      </span>
                      <motion.svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-text-secondary flex-shrink-0"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </motion.svg>
                    </div>
                  </button>

                  {/* Expandable content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          {/* Divider */}
                          <div className="h-px bg-border mb-6" />

                          {/* Stats row */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                            {guide.stats.map((stat, si) => (
                              <motion.div
                                key={si}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: si * 0.08 }}
                                className="rounded-xl p-4 text-center"
                                style={{ backgroundColor: guide.bgColor }}
                              >
                                <div className="text-xl font-bold" style={{ color: guide.color }}>
                                  {stat.value}
                                </div>
                                <div className="text-xs text-text-secondary mt-1">{stat.label}</div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Source badge */}
                          <div className="flex items-center gap-2 mb-5">
                            <IconShield size={14} className="text-primary" />
                            <span className="text-xs text-text-secondary">
                              Источники: {guide.source}
                            </span>
                          </div>

                          {/* Tips */}
                          <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            className="space-y-4"
                          >
                            {guide.tips.map((tip, ti) => (
                              <motion.div
                                key={ti}
                                variants={fadeUp}
                                className="flex gap-4"
                              >
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                                  style={{ backgroundColor: guide.bgColor, color: guide.color }}
                                >
                                  {ti + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-text-primary text-sm mb-1">
                                    {tip.title}
                                  </h4>
                                  <p className="text-text-secondary text-sm leading-relaxed">
                                    {tip.text}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>

                          {/* Links */}
                          <div className="mt-6 pt-5 border-t border-border">
                            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                              Официальные источники
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {guide.links.map((link, li) => (
                                <a
                                  key={li}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom info block */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white rounded-2xl shadow-card p-6 border-l-4 border-primary"
          >
            <div className="flex items-start gap-3">
              <IconAlertTriangle size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-sm text-text-primary mb-1">
                  Общие ресурсы для проверки
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {[
                    { name: 'Госуслуги', url: 'gosuslugi.ru', desc: 'Настройки безопасности, 2FA' },
                    { name: 'НКЦКИ', url: 'safe-surf.ru', desc: 'Сообщения о киберинцидентах' },
                    { name: 'Минцифры', url: 'digital.gov.ru', desc: 'Официальные рекомендации' },
                    { name: 'Касперский', url: 'kaspersky.ru/resource-center', desc: 'Обучающие материалы' },
                    { name: 'Банк России', url: 'cbr.ru', desc: 'Финансовая безопасность' },
                    { name: 'МВД России', url: 'мвд.рф', desc: 'Предупреждения о мошенничестве' },
                  ].map((res, ri) => (
                    <div key={ri} className="bg-page rounded-lg p-3">
                      <p className="font-semibold text-sm text-text-primary">{res.name}</p>
                      <p className="text-xs text-primary">{res.url}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{res.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
