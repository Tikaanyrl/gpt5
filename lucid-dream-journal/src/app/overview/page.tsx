"use client";

import { useEntries } from '@/hooks/useEntries';
import StatsCards from '@/components/StatsCards';
import { computeStats, buildDailySeries, techniqueFrequency } from '@/utils/stats';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import TechniquePieChart from '@/components/charts/TechniquePieChart';
import LucidBarChart from '@/components/charts/LucidBarChart';

export default function OverviewPage() {
  const { entries, isLoading } = useEntries();

  if (isLoading) return <div className="card">Loading...</div>;

  const { day, week, month, allTime } = computeStats(entries);
  const series = buildDailySeries(entries, 30);
  const techs = techniqueFrequency(entries);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid gap-4">
        <StatsCards title="Today" summary={day} />
        <StatsCards title="This week" summary={week} />
        <StatsCards title="This month" summary={month} />
        <StatsCards title="All time" summary={allTime} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <TimeSeriesChart data={series} />
        <TechniquePieChart data={techs} />
      </div>

      <LucidBarChart entries={entries} />
    </div>
  );
}