"use client";

import EntryForm from '@/components/EntryForm';
import EntryList from '@/components/EntryList';
import { useEntries } from '@/hooks/useEntries';
import { useState } from 'react';

export default function Page() {
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useEntries();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Journal</h1>
      {error && <div className="card text-red-600">{error}</div>}
      <EntryForm
        onSubmit={async (e) => {
          setError(null);
          try {
            await createEntry(e);
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create');
          }
        }}
        submitLabel="Add entry"
      />

      <div className="space-y-3">
        <h2 className="text-xl font-medium">Entries</h2>
        {isLoading ? (
          <div className="card">Loading...</div>
        ) : (
          <EntryList
            entries={entries}
            onUpdate={async (id, data) => {
              setError(null);
              try {
                await updateEntry(id, data);
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to update');
              }
            }}
            onDelete={async (id) => {
              setError(null);
              try {
                await deleteEntry(id);
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to delete');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}