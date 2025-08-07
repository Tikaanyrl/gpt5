"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Row = {
  userId: string;
  username: string;
  totalEntries: number;
  lucidCount: number;
  totalSleep: number;
};

export default function LeaderboardPage() {
  const { data, isLoading } = useSWR<Row[]>('/api/leaderboard', fetcher);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>
      <div className="card overflow-x-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr>
                <th className="py-2">User</th>
                <th className="py-2">Lucid</th>
                <th className="py-2">Entries</th>
                <th className="py-2">Total sleep (h)</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((r) => (
                <tr key={r.userId} className="border-t border-border">
                  <td className="py-2">{r.username}</td>
                  <td className="py-2">{r.lucidCount}</td>
                  <td className="py-2">{r.totalEntries}</td>
                  <td className="py-2">{r.totalSleep.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
