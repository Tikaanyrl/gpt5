"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { startOfWeek, format, parseISO } from 'date-fns';
import type { DreamEntryDTO } from '@/types';

type Props = {
  entries: DreamEntryDTO[];
};

export default function LucidBarChart({ entries }: Props) {
  const weeks = new Map<string, { lucid: number; nonLucid: number }>();
  for (const e of entries) {
    const ws = startOfWeek(parseISO(e.date), { weekStartsOn: 1 });
    const key = format(ws, 'yyyy-ww');
    const rec = weeks.get(key) ?? { lucid: 0, nonLucid: 0 };
    if (e.lucid) rec.lucid += 1; else rec.nonLucid += 1;
    weeks.set(key, rec);
  }
  const data = Array.from(weeks.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-12)
    .map(([k, v]) => ({ week: k, ...v }));

  return (
    <div className="card">
      <h3 className="font-medium mb-3">Lucid vs Non-lucid (last 12 weeks)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: 'rgba(20,20,30,.8)', border: '1px solid rgba(255,255,255,.08)', color: 'white' }} />
            <Legend />
            <Bar dataKey="lucid" stackId="a" fill="#60a5fa" name="Lucid" />
            <Bar dataKey="nonLucid" stackId="a" fill="#1f2937" name="Non-lucid" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
