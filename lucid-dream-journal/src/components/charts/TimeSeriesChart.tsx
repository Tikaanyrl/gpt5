"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, defs, linearGradient, stop } from 'recharts';

type Props = {
  data: { date: string; avgQuality: number; avgSleep: number }[];
};

export default function TimeSeriesChart({ data }: Props) {
  return (
    <div className="card">
      <h3 className="font-medium mb-3">Last 30 days</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="q" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[0, 10]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 12]} />
            <Tooltip contentStyle={{ background: 'rgba(20,20,30,.8)', border: '1px solid rgba(255,255,255,.08)', color: 'white' }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="avgQuality" stroke="#60a5fa" strokeWidth={2} name="Avg quality" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="avgSleep" stroke="#34d399" strokeWidth={2} name="Avg sleep (h)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
