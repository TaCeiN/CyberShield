'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SW = {
  loc: { bank: 0, mall: 4, street: 8, cafe: 5 } as Record<string, number>,
  meth: { nfc: 0, chip: 1, mag: 8 } as Record<string, number>,
  env: { cam: 0, staff: 1, low: 4, none: 7 } as Record<string, number>,
  act: { cover: -2, inspect: -3, open: 5, ignore: 6 } as Record<string, number>,
  set: { full: -3, sms: 2, none: 8 } as Record<string, number>,
};

const LOC_OPTIONS = [
  { value: 'bank', label: 'Отделение банка' },
  { value: 'mall', label: 'ТЦ / Аэропорт' },
  { value: 'street', label: 'Улица / АЗС' },
  { value: 'cafe', label: 'Кафе / Магазин (терминал)' },
];

const METH_OPTIONS = [
  { value: 'nfc', label: 'Бесконтактная NFC / Apple Pay' },
  { value: 'chip', label: 'Чип + ПИН' },
  { value: 'mag', label: 'Магнитная полоса' },
];

const ENV_OPTIONS = [
  { value: 'cam', label: 'Под камерами банка' },
  { value: 'staff', label: 'Персонал рядом' },
  { value: 'low', label: 'Малолюдно' },
  { value: 'none', label: 'Нет наблюдения' },
];

const ACT_OPTIONS = [
  { value: 'cover', label: 'Прикрываю ПИН рукой' },
  { value: 'inspect', label: 'Осматриваю слот' },
  { value: 'open', label: 'Ввожу ПИН открыто' },
  { value: 'ignore', label: 'Игнорирую осмотр' },
];

const SET_OPTIONS = [
  { value: 'full', label: 'Лимиты + СМС + Гео-блок' },
  { value: 'sms', label: 'Только СМС' },
  { value: 'none', label: 'Ничего не настроено' },
];

export default function SkimmingCalculator() {
  const [loc, setLoc] = useState('bank');
  const [meth, setMeth] = useState('nfc');
  const [env, setEnv] = useState('cam');
  const [act, setAct] = useState('cover');
  const [set_, setSet] = useState('full');
  const [showTimeline, setShowTimeline] = useState(false);

  const risk = useMemo(() => {
    let total = SW.loc[loc] + SW.meth[meth] + SW.env[env] + SW.act[act] + SW.set[set_];
    total = Math.max(0, Math.min(100, total * 2));

    let color: string, time: string, damage: string, method: string, rec: string, recClass: string;
    if (total < 25) {
      color = '#4caf50'; time = 'Не требуется'; damage = '0 \u20BD'; method = 'Нет угрозы';
      rec = 'Оптимальная защита. Бесконтактная оплата через NFC использует одноразовый шифрованный токен — скопировать данные карты невозможно.'; recClass = 'safe';
    } else if (total < 50) {
      color = '#ffa726'; time = '3\u20137 дней'; damage = 'до 50 000 \u20BD'; method = 'Низкий риск';
      rec = 'Средний уровень риска. Рекомендуется включить гео-блокировку и установить лимиты на операции. Прикрывайте ПИН-код рукой при вводе.'; recClass = 'medium';
    } else if (total < 80) {
      color = '#ef5350'; time = '1\u20133 дня'; damage = 'до 150 000 \u20BD'; method = 'Скиммер + камера';
      rec = 'Высокий уровень риска. Магнитная полоса легко считывается скиммером. Перейдите на бесконтактную оплату. Осматривайте слот банкомата перед использованием.'; recClass = 'danger';
    } else {
      color = '#b71c1c'; time = '< 24 часов'; damage = 'Полное опустошение'; method = 'Скиммер + кейлоггер + камера';
      rec = 'Критический уровень уязвимости. Скиммер считывает данные за 2 секунды, камера записывает ПИН-код. В таких условиях деньги могут быть списаны в течение 48 часов.'; recClass = 'critical';
    }

    const weaknesses: string[] = [];
    if (meth === 'mag') weaknesses.push('магнитная полоса');
    if (act === 'open') weaknesses.push('ввод ПИН без прикрытия');
    if (act === 'ignore') weaknesses.push('игнорирование осмотра');
    if (env === 'none') weaknesses.push('нет наблюдения');
    if (set_ === 'none') weaknesses.push('нет настроек безопасности');

    let timeline: string[];
    if (total >= 60) {
      timeline = [
        'День 1: Вставили карту. Скиммер сохранил данные полосы. Камера записала ПИН.',
        'День 2: Мошенники создали дубликат карты.',
        `День 3: Списание ${Math.floor(Math.random() * 50 + 30)} 000\u20BD в другой стране.`,
        'День 4-7: Банк вернул средства только после заявления в полицию.',
      ];
    } else if (total >= 25) {
      timeline = [
        'День 1: Оплата прошла. Уязвимости есть, но не критичные.',
        'День 2-3: Подозрительная активность зафиксирована банком.',
        'День 3-5: Получили СМС и заблокировали карту. Средства сохранены.',
      ];
    } else {
      timeline = [
        'День 1: Оплата через NFC. Данные зашифрованы.',
        'День 2-30: Все операции штатно. Угроз нет.',
        'Результат: Деньги в безопасности.',
      ];
    }

    return { total, color, time, damage, method, rec, recClass, weaknesses, timeline };
  }, [loc, meth, env, act, set_]);

  const selectClass = "w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-white cursor-pointer focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: params */}
      <div className="space-y-4">
        <h3 className="font-semibold text-text-primary">Параметры оплаты</h3>

        <div>
          <label className="block text-sm font-semibold text-primary mb-1">Где происходит оплата?</label>
          <select className={selectClass} value={loc} onChange={(e) => setLoc(e.target.value)}>
            {LOC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-1">Тип карты / способ оплаты</label>
          <select className={selectClass} value={meth} onChange={(e) => setMeth(e.target.value)}>
            {METH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-1">Окружение</label>
          <select className={selectClass} value={env} onChange={(e) => setEnv(e.target.value)}>
            {ENV_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-1">Твои действия</label>
          <select className={selectClass} value={act} onChange={(e) => setAct(e.target.value)}>
            {ACT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-1">Настройки безопасности карты</label>
          <select className={selectClass} value={set_} onChange={(e) => setSet(e.target.value)}>
            {SET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <button
          onClick={() => setShowTimeline(true)}
          className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors text-sm"
        >
          Протестировать сценарий
        </button>
      </div>

      {/* Right: metrics */}
      <div>
        <h3 className="font-semibold text-text-primary mb-3">Панель метрик</h3>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5">
          {/* Risk meter */}
          <div className="h-5 bg-gray-200 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full"
              style={{ background: risk.color }}
              animate={{ width: `${risk.total}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="text-center mb-4">
            <motion.span
              className="text-4xl font-bold"
              style={{ color: risk.color }}
              key={risk.total}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {risk.total}%
            </motion.span>
            <div className="text-xs text-gray-500 mt-1">Уровень риска</div>
          </div>

          {/* Metrics */}
          <div className="space-y-0">
            {[
              { label: 'Время до обнаружения', value: risk.time },
              { label: 'Потенциальный ущерб', value: risk.damage },
              { label: 'Метод атаки', value: risk.method },
            ].map((m) => (
              <div key={m.label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">{m.label}</span>
                <span className="font-bold text-text-primary">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className={`mt-4 p-3 rounded-xl text-sm leading-relaxed ${
            risk.recClass === 'safe' ? 'bg-green-50 border-l-4 border-green-500 text-green-800' :
            risk.recClass === 'medium' ? 'bg-orange-50 border-l-4 border-orange-400 text-orange-800' :
            risk.recClass === 'danger' ? 'bg-red-50 border-l-4 border-red-400 text-red-700' :
            'bg-red-100 border-l-4 border-red-700 text-red-900'
          }`}>
            {risk.rec}
          </div>
        </div>

        {/* Timeline */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-4 bg-gray-50 rounded-xl text-sm overflow-hidden"
            >
              <h4 className="font-semibold text-text-primary mb-2">
                {risk.total >= 60 ? 'Последствия:' : risk.total >= 25 ? 'Возможный сценарий:' : 'Безопасный сценарий:'}
              </h4>
              <div className="space-y-1.5">
                {risk.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-600">
                    <span className="text-gray-400 mt-0.5">\u25B8</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weaknesses report */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-4 bg-blue-50 rounded-xl text-sm leading-relaxed"
            >
              {risk.weaknesses.length > 0 ? (
                <>
                  <strong>Слабые места:</strong> {risk.weaknesses.join(', ')}.
                  <br /><br />
                  <strong>Рекомендация:</strong>{' '}
                  {meth === 'mag' && 'Перейдите на NFC или чип. '}
                  {(act === 'open' || act === 'ignore') && 'Прикрывайте руку и осматривайте банкомат. '}
                  {set_ === 'none' && 'Включите лимиты и гео-блокировку.'}
                </>
              ) : (
                <><strong>Отлично!</strong> Вы применяете все меры защиты. Так держать!</>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
