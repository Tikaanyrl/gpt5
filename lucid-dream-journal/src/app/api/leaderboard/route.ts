import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DreamEntry } from '@/models/DreamEntry';
import { User } from '@/models/User';

export const runtime = 'nodejs';

export async function GET() {
  await connectToDatabase();
  const agg = await DreamEntry.aggregate([
    {
      $group: {
        _id: '$userId',
        totalEntries: { $sum: 1 },
        lucidCount: { $sum: { $cond: ['$lucid', 1, 0] } },
        totalSleep: { $sum: '$sleepDurationHours' }
      }
    },
    { $sort: { lucidCount: -1, totalEntries: -1 } },
    { $limit: 20 }
  ]);

  const userIds = agg.map((a: any) => a._id);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const idToName = new Map(users.map((u) => [String(u._id), u.username]));

  const results = agg.map((a: any) => ({
    userId: a._id,
    username: idToName.get(String(a._id)) ?? 'Unknown',
    totalEntries: a.totalEntries,
    lucidCount: a.lucidCount,
    totalSleep: a.totalSleep
  }));

  return NextResponse.json(results);
}
