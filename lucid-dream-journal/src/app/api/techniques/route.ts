import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Technique } from '@/models/Technique';
import { slugify } from '@/utils/slugify';
import { getUserIdFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const DEFAULTS = [
  'MILD',
  'WILD',
  'SSILD',
  'Wake Back To Bed (WBTB)',
  'Reality Checks (RC)',
  'Dream Journal (DJ)',
  'Visualization',
  'Meditation',
  'Sleep Hygiene'
];

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectToDatabase();
  const count = await Technique.countDocuments({ userId });
  if (count === 0) {
    const docs = DEFAULTS.map((name) => ({ userId, name, slug: slugify(name), isDefault: true }));
    await Technique.insertMany(docs, { ordered: false }).catch(() => {});
  }
  const techniques = await Technique.find({ userId }).sort({ isDefault: -1, name: 1 }).lean();
  return NextResponse.json(techniques);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name } = await request.json();
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  await connectToDatabase();
  const slug = slugify(name);
  try {
    const created = await Technique.create({ userId, name, slug, isDefault: false });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Technique already exists' }, { status: 409 });
  }
}
