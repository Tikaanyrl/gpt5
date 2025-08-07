import type { Summary } from '@/utils/stats';

type Props = {
  title: string;
  summary: Summary;
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-sm">
      <div className="text-neutral-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

export default function StatsCards({ title, summary }: Props) {
  const { count, totalSleep, totalWbtb, lucidCount, avgQuality, avgSleep, avgWbtb, avgLucidity } = summary;
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Entries" value={count} />
        <Stat label="Total sleep (h)" value={totalSleep.toFixed(1)} />
        <Stat label="Total WBTB" value={totalWbtb} />
        <Stat label="Lucid count" value={lucidCount} />
        <Stat label="Avg quality" value={avgQuality.toFixed(1)} />
        <Stat label="Avg sleep (h)" value={avgSleep.toFixed(1)} />
        <Stat label="Avg WBTB" value={avgWbtb.toFixed(2)} />
        <Stat label="Avg lucidity" value={avgLucidity.toFixed(1)} />
      </div>
    </div>
  );
}