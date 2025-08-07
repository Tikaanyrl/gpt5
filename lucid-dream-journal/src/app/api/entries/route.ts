import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import { DreamEntry } from '@/models/DreamEntry';
import { getUserIdFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const EntrySchema = z.object({
  date: z.string(),
  quality: z.number().min(1).max(10),
  sleepDurationHours: z.number().min(0).max(24),
  wbtbCount: z.number().min(0).max(10),
  lucid: z.boolean(),
  lucidity: z.number().min(0).max(10),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  techniques: z.array(z.string()).optional()
});

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectToDatabase();
    const entries = await DreamEntry.find({ userId }).sort({ date: -1, createdAt: -1 }).lean();
    return NextResponse.json(entries);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const json = await request.json();
    const parse = EntrySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
    }
    await connectToDatabase();
    const created = await DreamEntry.create({ ...parse.data, userId });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}