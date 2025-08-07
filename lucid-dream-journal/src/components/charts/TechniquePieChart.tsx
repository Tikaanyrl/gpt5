"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f472b6'];

type Props = {
  data: { name: string; value: number }[];
};

export default function TechniquePieChart({ data }: Props) {
  return (
    <div className="card">
      <h3 className="font-medium mb-3">Techniques</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'rgba(20,20,30,.8)', border: '1px solid rgba(255,255,255,.08)', color: 'white' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
