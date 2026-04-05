'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { IconActivity } from '@/components/icons/Icons';

interface DayActivity {
  date: string;
  count: number;
}

const WEEKS = 40;
const DAYS_PER_WEEK = 7;
const DAY_LABELS = ['Пн', '', 'Ср', '', 'Пт', '', 'Вс'];

function getColor(count: number): string {
  if (count === 0) return '#ebedf0';
  if (count === 1) return '#a5d6a7';
  if (count === 2) return '#66bb6a';
  if (count <= 4) return '#43a047';
  return '#2e7d32';
}

function generateDaysGrid(data: DayActivity[]): { date: string; count: number }[][] {
  const map = new Map<string, number>();
  data.forEach((d) => map.set(d.date, d.count));

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const totalDays = WEEKS * DAYS_PER_WEEK;

  // Calculate start date: go back totalDays from today
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays + 1);

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    currentWeek.push({ date: iso, count: map.get(iso) || 0 });

    if (currentWeek.length === DAYS_PER_WEEK) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

export default function ActivityGrid() {
  const [data, setData] = useState<DayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    api
      .get<DayActivity[]>('/api/learning/activity')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const weeks = generateDaysGrid(data);
  const totalCompleted = data.reduce((s, d) => s + d.count, 0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="h-32 flex items-center justify-center text-text-secondary text-sm">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-white rounded-xl shadow-card p-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl flex items-center gap-2">
          <IconActivity size={20} className="text-primary" />
          Активность обучения
        </h3>
        <span className="text-sm text-text-secondary">
          {totalCompleted} модулей за последние {WEEKS * 7} дней
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-[3px] relative" onMouseLeave={() => setTooltip(null)}>
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-2 pt-0">
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="h-[22px] flex items-center text-[11px] text-text-secondary leading-none"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={day.date}
                  className="w-[22px] h-[22px] rounded-[3px] cursor-pointer transition-all hover:ring-1 hover:ring-primary/40"
                  style={{ backgroundColor: getColor(day.count) }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const formatted = new Date(day.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    setTooltip({
                      text: `${formatted}: ${day.count === 0 ? 'нет активности' : `${day.count} модулей`}`,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-text-secondary">
        <span>Меньше</span>
        {[0, 1, 2, 3, 5].map((v) => (
          <div
            key={v}
            className="w-[22px] h-[22px] rounded-[3px]"
            style={{ backgroundColor: getColor(v) }}
          />
        ))}
        <span>Больше</span>
      </div>

      {/* Tooltip rendered via portal-like fixed position */}
      {tooltip && (
        <div
          className="fixed z-[100] pointer-events-none bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </motion.div>
  );
}
