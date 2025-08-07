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

export async function PUT(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromRequest(_request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const json = await _request.json();
    const parse = EntrySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
    }
    const { id } = await context.params;
    await connectToDatabase();
    const updated = await DreamEntry.findOneAndUpdate({ _id: id, userId }, parse.data, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromRequest(_request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await context.params;
    await connectToDatabase();
    const deleted = await DreamEntry.findOneAndDelete({ _id: id, userId }).lean();
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}