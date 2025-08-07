"use client";

import useSWR, { mutate as globalMutate } from 'swr';
import type { DreamEntryDTO } from '@/types';

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${r.status}`);
  }
  return r.json();
};

export function useEntries() {
  const { data, error, isLoading, mutate } = useSWR<DreamEntryDTO[]>('/api/entries', fetcher);

  async function createEntry(entry: DreamEntryDTO) {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? 'Failed to create');
    }
    await mutate();
  }

  async function updateEntry(id: string, entry: DreamEntryDTO) {
    const res = await fetch(`/api/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? 'Failed to update');
    }
    await mutate();
  }

  async function deleteEntry(id: string) {
    const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? 'Failed to delete');
    }
    await mutate();
  }

  return { entries: data ?? [], error, isLoading, createEntry, updateEntry, deleteEntry, refresh: mutate };
}

export async function revalidateEntries() {
  await globalMutate('/api/entries');
}