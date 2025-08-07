"use client";

import { useMemo, useState } from 'react';
import { Pencil, Trash2, ArrowUpDown, CalendarDays, Filter } from 'lucide-react';
import type { DreamEntryDTO } from '@/types';
import EntryForm from './EntryForm';

type Props = {
  entries: DreamEntryDTO[];
  onUpdate: (id: string, entry: DreamEntryDTO) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
};

type SortKey = 'date' | 'quality' | 'sleep' | 'wbtb' | 'lucidity' | 'techniques';

type SortState = { key: SortKey; dir: 'asc' | 'desc' };

const comparators: Record<SortKey, (a: DreamEntryDTO, b: DreamEntryDTO) => number> = {
  date: (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0),
  quality: (a, b) => a.quality - b.quality,
  sleep: (a, b) => (a.sleepDurationHours ?? 0) - (b.sleepDurationHours ?? 0),
  wbtb: (a, b) => (a.wbtbCount ?? 0) - (b.wbtbCount ?? 0),
  lucidity: (a, b) => (a.lucidity ?? 0) - (b.lucidity ?? 0),
  techniques: (a, b) => (a.techniques?.join(',') || '').localeCompare(b.techniques?.join(',') || '')
};

export default function EntryList({ entries, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({ key: 'date', dir: 'desc' });
  const [groupByNight, setGroupByNight] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTechnique, setFilterTechnique] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [lucidOnly, setLucidOnly] = useState(false);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (lucidOnly && !e.lucid) return false;
      if (filterTechnique && !(e.techniques ?? []).some((t) => t.toLowerCase().includes(filterTechnique.toLowerCase()))) return false;
      if (filterTag && !(e.tags ?? []).some((t) => t.toLowerCase().includes(filterTag.toLowerCase()))) return false;
      if (search) {
        const hay = [e.date, e.notes ?? '', ...(e.tags ?? []), ...(e.techniques ?? [])].join(' ').toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [entries, lucidOnly, filterTechnique, filterTag, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const cmp = comparators[sort.key];
    arr.sort((a, b) => (sort.dir === 'asc' ? cmp(a, b) : -cmp(a, b)));
    return arr;
  }, [filtered, sort]);

  function setSortKey(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }

  if (!entries.length) {
    return <div className="card">No entries yet. Add your first dream above.</div>;
  }

  // Group by date with per-night header showing deduped sleep/WBTB
  const grouped = useMemo(() => {
    const map = new Map<string, DreamEntryDTO[]>();
    for (const e of sorted) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (sort.dir === 'asc' ? (a < b ? -1 : 1) : a > b ? -1 : 1))
      .map(([date, list]) => ({
        date,
        entries: list,
        sleep: Math.max(...list.map((x) => x.sleepDurationHours ?? 0)),
        wbtb: Math.max(...list.map((x) => x.wbtbCount ?? 0))
      }));
  }, [sorted, sort]);

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap gap-3 items-center">
        <span className="text-sm text-neutral-500">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['date', 'Date'],
              ['quality', 'Quality'],
              ['sleep', 'Sleep'],
              ['wbtb', 'WBTB'],
              ['lucidity', 'Lucidity'],
              ['techniques', 'Techniques']
            ] as [SortKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              className={`btn-outline ${sort.key === key ? 'ring-1 ring-blue-500/60' : ''}`}
              onClick={() => setSortKey(key)}
            >
              <ArrowUpDown size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          <span className="text-sm text-neutral-500 flex items-center gap-2"><Filter size={14}/>Filters:</span>
          <input className="input" placeholder="Search text..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <input className="input" placeholder="Technique" value={filterTechnique} onChange={(e) => setFilterTechnique(e.target.value)} />
          <input className="input" placeholder="Tag" value={filterTag} onChange={(e) => setFilterTag(e.target.value)} />
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={lucidOnly} onChange={(e) => setLucidOnly(e.target.checked)} /> Lucid only
          </label>
          <button className="btn-outline" onClick={() => setGroupByNight((v) => !v)}>
            <CalendarDays size={14} /> {groupByNight ? 'Ungroup' : 'Group by night'}
          </button>
        </div>
      </div>

      {groupByNight
        ? grouped.map((g) => (
            <div key={g.date} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">{g.date}</div>
                <div className="text-sm text-neutral-500">Sleep: {g.sleep} h • WBTB: {g.wbtb}</div>
              </div>
              <div className="space-y-3">
                {g.entries.map((e) => (
                  <div key={e._id ?? `${e.date}-${Math.random()}`} className="rounded-md border border-border p-3">
                    {editingId === e._id ? (
                      <EntryForm
                        initial={e}
                        submitLabel="Update entry"
                        onSubmit={async (data) => {
                          if (!e._id) return;
                          await onUpdate(e._id, data);
                          setEditingId(null);
                        }}
                      />
                    ) : (
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {e.tags && e.tags.length > 0 && (
                              <span className="text-xs text-neutral-500">#{e.tags.join(' #')}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {e._id && (
                              <button className="btn-outline" onClick={() => setEditingId(e._id!)}>
                                <Pencil size={16} /> Edit
                              </button>
                            )}
                            {e._id && (
                              <button className="btn-outline" onClick={() => onDelete(e._id!)}>
                                <Trash2 size={16} /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-300 grid md:grid-cols-2 gap-y-1">
                          <div>Quality: {e.quality} / 10</div>
                          <div>Lucid: {e.lucid ? `Yes (level ${e.lucidity})` : 'No'}</div>
                          {e.techniques && e.techniques.length > 0 && <div>Techniques: {e.techniques.join(', ')}</div>}
                          {e.notes && <p className="md:col-span-2 mt-2 whitespace-pre-wrap">{e.notes}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        : sorted.map((e) => (
            <div key={e._id ?? `${e.date}-${Math.random()}`} className="card">
              {editingId === e._id ? (
                <EntryForm
                  initial={e}
                  submitLabel="Update entry"
                  onSubmit={async (data) => {
                    if (!e._id) return;
                    await onUpdate(e._id, data);
                    setEditingId(null);
                  }}
                />
              ) : (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {e.date}
                      {e.tags && e.tags.length > 0 && (
                        <span className="ml-2 text-xs text-neutral-500">#{e.tags.join(' #')}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {e._id && (
                        <button className="btn-outline" onClick={() => setEditingId(e._id!)}>
                          <Pencil size={16} /> Edit
                        </button>
                      )}
                      {e._id && (
                        <button className="btn-outline" onClick={() => onDelete(e._id!)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300 grid md:grid-cols-2 gap-y-1">
                    <div>Quality: {e.quality} / 10</div>
                    <div>Sleep: {e.sleepDurationHours} h • WBTB: {e.wbtbCount}</div>
                    <div>Lucid: {e.lucid ? `Yes (level ${e.lucidity})` : 'No'}</div>
                    {e.techniques && e.techniques.length > 0 && <div>Techniques: {e.techniques.join(', ')}</div>}
                    {e.notes && <p className="md:col-span-2 mt-2 whitespace-pre-wrap">{e.notes}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
    </div>
  );
}