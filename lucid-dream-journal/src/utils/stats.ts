import type { DreamEntryDTO } from '@/types';
import { parseISO, startOfDay, startOfWeek, startOfMonth, isSameDay, format } from 'date-fns';

export type Aggregates = {
  count: number; // entry count
  totalQuality: number; // sum over entries
  totalSleep: number; // sum over unique dates
  totalWbtb: number; // sum over unique dates
  lucidCount: number; // entry count where lucid
  totalLucidity: number; // sum over lucid entries
  uniqueDates: number; // number of unique dates in window
};

export type Summary = Aggregates & {
  avgQuality: number; // per entry
  avgSleep: number; // per unique date
  avgWbtb: number; // per unique date
  avgLucidity: number; // among lucid entries
};

function aggregate(entries: DreamEntryDTO[], dateFilter?: (d: Date) => boolean): Summary {
  const dateMap = new Map<string, { sleep: number; wbtb: number; qualitySum: number; entryCount: number; lucidCount: number; luciditySum: number }>();

  for (const e of entries) {
    const d = parseISO(e.date);
    if (dateFilter && !dateFilter(d)) continue;
    const key = format(d, 'yyyy-MM-dd');
    const rec = dateMap.get(key) ?? { sleep: 0, wbtb: 0, qualitySum: 0, entryCount: 0, lucidCount: 0, luciditySum: 0 };
    rec.sleep = Math.max(rec.sleep, e.sleepDurationHours ?? 0);
    rec.wbtb = Math.max(rec.wbtb, e.wbtbCount ?? 0);
    rec.qualitySum += e.quality;
    rec.entryCount += 1;
    if (e.lucid) {
      rec.lucidCount += 1;
      rec.luciditySum += e.lucidity;
    }
    dateMap.set(key, rec);
  }

  let totalQuality = 0;
  let totalSleep = 0;
  let totalWbtb = 0;
  let count = 0;
  let lucidCount = 0;
  let totalLucidity = 0;

  for (const [, rec] of dateMap) {
    totalQuality += rec.qualitySum;
    totalSleep += rec.sleep;
    totalWbtb += rec.wbtb;
    count += rec.entryCount;
    lucidCount += rec.lucidCount;
    totalLucidity += rec.luciditySum;
  }

  const uniqueDates = dateMap.size;

  return {
    count,
    totalQuality,
    totalSleep,
    totalWbtb,
    lucidCount,
    totalLucidity,
    uniqueDates,
    avgQuality: count ? totalQuality / count : 0,
    avgSleep: uniqueDates ? totalSleep / uniqueDates : 0,
    avgWbtb: uniqueDates ? totalWbtb / uniqueDates : 0,
    avgLucidity: lucidCount ? totalLucidity / lucidCount : 0
  };
}

export function computeStats(entries: DreamEntryDTO[]) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const monthStart = startOfMonth(now);

  const day = aggregate(entries, (d) => isSameDay(d, dayStart));
  const week = aggregate(entries, (d) => d >= weekStart);
  const month = aggregate(entries, (d) => d >= monthStart);
  const allTime = aggregate(entries);

  return { day, week, month, allTime };
}

export function buildDailySeries(entries: DreamEntryDTO[], days = 30) {
  // Build per-day aggregates: average quality per entry, sleep per unique date
  const map = new Map<string, { qSum: number; s: number; c: number }>();
  for (const e of entries) {
    const d = format(parseISO(e.date), 'yyyy-MM-dd');
    const rec = map.get(d) ?? { qSum: 0, s: 0, c: 0 };
    rec.qSum += e.quality;
    rec.c += 1;
    rec.s = Math.max(rec.s, e.sleepDurationHours ?? 0);
    map.set(d, rec);
  }
  const dates = Array.from(map.keys()).sort();
  const tail = dates.slice(Math.max(0, dates.length - days));
  return tail.map((d) => ({
    date: d,
    avgQuality: map.get(d)!.qSum / map.get(d)!.c,
    avgSleep: map.get(d)!.s
  }));
}

export function techniqueFrequency(entries: DreamEntryDTO[]) {
  const freq = new Map<string, number>();
  for (const e of entries) {
    for (const t of e.techniques ?? []) {
      freq.set(t, (freq.get(t) ?? 0) + 1);
    }
  }
  return Array.from(freq.entries()).map(([name, value]) => ({ name, value }));
}