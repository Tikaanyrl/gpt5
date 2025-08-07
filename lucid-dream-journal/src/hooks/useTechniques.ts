"use client";

import useSWR from 'swr';
import type { Technique } from '@/types';

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) {
    // Not logged in or server error → return empty list so UI can render safely
    return [] as Technique[];
  }
  const data = await r.json();
  return Array.isArray(data) ? (data as Technique[]) : [];
};

export function useTechniques() {
  const { data, isLoading, error, mutate } = useSWR<Technique[]>('/api/techniques', fetcher);

  async function addTechnique(name: string) {
    const res = await fetch('/api/techniques', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok && res.status !== 409) throw new Error('Failed to add technique');
    await mutate();
  }

  const list = Array.isArray(data) ? data : [];

  return { techniques: list, isLoading, error, addTechnique, refresh: mutate };
}
