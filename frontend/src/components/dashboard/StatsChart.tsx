'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ScenarioProgress } from '@/types';

interface StatsChartProps {
  scenarioProgress: ScenarioProgress[];
}

const COLORS = ['#2e7d32', '#43a047', '#66bb6a', '#81c784', '#a5d6a7'];

export default function StatsChart({ scenarioProgress }: StatsChartProps) {
  const data = scenarioProgress.map((sp) => ({
    name: sp.title,
    value: sp.completed,
    total: sp.total,
  }));

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h3 className="font-display font-bold text-lg mb-4">Прогресс по сценариям</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} из ${data.find(d => d.name === name)?.total || 0}`, name]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <span className="text-text-secondary">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
