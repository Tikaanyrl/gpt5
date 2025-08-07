"use client";

import { useEffect, useMemo, useState } from 'react';
import type { DreamEntryDTO } from '@/types';
import { format } from 'date-fns';
import { useEntries } from '@/hooks/useEntries';
import { useTechniques } from '@/hooks/useTechniques';

const todayIso = () => format(new Date(), 'yyyy-MM-dd');

type Props = {
  initial?: Partial<DreamEntryDTO>;
  onSubmit: (entry: DreamEntryDTO) => Promise<void> | void;
  submitLabel?: string;
};

export default function EntryForm({ initial, onSubmit, submitLabel = 'Save entry' }: Props) {
  const { entries } = useEntries();
  const { techniques, addTechnique } = useTechniques();

  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [quality, setQuality] = useState(initial?.quality ?? 5);
  const [sleepDurationHours, setSleepDurationHours] = useState(initial?.sleepDurationHours ?? 7.5);
  const [wbtbCount, setWbtbCount] = useState(initial?.wbtbCount ?? 0);
  const [lucid, setLucid] = useState(initial?.lucid ?? false);
  const [lucidity, setLucidity] = useState(initial?.lucidity ?? 0);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(initial?.techniques ?? []);
  const [newTechnique, setNewTechnique] = useState('');
  const [loading, setLoading] = useState(false);

  // Build per-date defaults and most recent techniques globally (entries are already sorted newest first)
  const defaults = useMemo(() => {
    const byDate = new Map<string, { sleep: number; wbtb: number; techniques: string[] }>();
    for (const e of entries) {
      const key = e.date;
      const rec = byDate.get(key) ?? { sleep: 0, wbtb: 0, techniques: [] };
      rec.sleep = Math.max(rec.sleep, e.sleepDurationHours ?? 0);
      rec.wbtb = Math.max(rec.wbtb, e.wbtbCount ?? 0);
      if ((rec.techniques?.length ?? 0) === 0 && (e.techniques?.length ?? 0) > 0) {
        rec.techniques = e.techniques ?? [];
      }
      byDate.set(key, rec);
    }
    const mostRecentTechniques = (entries.find((e) => (e.techniques?.length ?? 0) > 0)?.techniques ?? []).slice();
    return { byDate, mostRecentTechniques };
  }, [entries]);

  // When date changes and not editing an existing entry, prefill from that date; otherwise use most recent techniques
  useEffect(() => {
    if (initial && initial._id) return; // do not override when editing
    const rec = defaults.byDate.get(date);
    if (rec) {
      setSleepDurationHours(rec.sleep);
      setWbtbCount(rec.wbtb);
      if (selectedTechniques.length === 0 && rec.techniques.length > 0) {
        setSelectedTechniques(rec.techniques);
      }
    } else if (selectedTechniques.length === 0 && defaults.mostRecentTechniques.length > 0) {
      setSelectedTechniques(defaults.mostRecentTechniques);
    }
  }, [date, defaults, initial]);

  function toggleTechnique(name: string) {
    setSelectedTechniques((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  }

  async function handleAddTechnique() {
    const name = newTechnique.trim();
    if (!name) return;
    await addTechnique(name);
    setSelectedTechniques((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setNewTechnique('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const entry: DreamEntryDTO = {
        date,
        quality: Number(quality),
        sleepDurationHours: Number(sleepDurationHours),
        wbtbCount: Number(wbtbCount),
        lucid,
        lucidity: lucid ? Number(lucidity) : 0,
        notes: notes.trim() ? notes : undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        techniques: selectedTechniques
      };
      await onSubmit(entry);
      if (!initial) {
        // Keep per-night values (sleep, wbtb) and techniques for faster subsequent entries
        setQuality(5);
        setLucid(false);
        setLucidity(0);
        setNotes('');
        setTags('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Quality: {quality}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="range"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Sleep duration (hours): {sleepDurationHours}</span>
          <input
            type="range"
            min={0}
            max={14}
            step={0.5}
            value={sleepDurationHours}
            onChange={(e) => setSleepDurationHours(Number(e.target.value))}
            className="range"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">WBTB count: {wbtbCount}</span>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={wbtbCount}
            onChange={(e) => setWbtbCount(Number(e.target.value))}
            className="range"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Lucid dream?</span>
          <div className="flex items-center gap-3">
            <input
              id="lucid"
              type="checkbox"
              checked={lucid}
              onChange={(e) => setLucid(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="lucid" className="text-sm">
              Yes
            </label>
          </div>
        </label>
        <label className={`space-y-2 ${!lucid ? 'opacity-50' : ''}`}>
          <span className="text-sm font-medium">Lucidity level: {lucidity}</span>
          <input
            disabled={!lucid}
            type="range"
            min={0}
            max={10}
            value={lucidity}
            onChange={(e) => setLucidity(Number(e.target.value))}
            className="range"
          />
        </label>
      </div>

      <label className="space-y-2 block">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          className="textarea"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What happened in your dream? Any dream signs, techniques, or reflections?"
        />
      </label>

      <label className="space-y-2 block">
        <span className="text-sm font-medium">Tags (comma separated)</span>
        <input
          className="input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. flying, school, WILD, RC"
        />
      </label>

      <div className="space-y-2">
        <div className="text-sm font-medium">Techniques</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(Array.isArray(techniques) ? techniques : []).map((t) => (
            <label key={t.slug} className="flex items-center gap-2 text-sm border border-border rounded-md px-3 py-2">
              <input
                type="checkbox"
                checked={selectedTechniques.includes(t.name)}
                onChange={() => toggleTechnique(t.name)}
              />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            className="input"
            placeholder="Add custom technique"
            value={newTechnique}
            onChange={(e) => setNewTechnique(e.target.value)}
          />
          <button type="button" className="btn" onClick={handleAddTechnique}>
            Add
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn" disabled={loading} type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}