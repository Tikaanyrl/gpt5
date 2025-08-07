import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { createJwt, hashPassword, buildAuthCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    await connectToDatabase();
    const existing = await User.findOne({ username }).lean();
    if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    const passwordHash = await hashPassword(password);
    const user = await User.create({ username, passwordHash });
    const token = await createJwt({ sub: String(user._id), username });
    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', buildAuthCookie(token));
    return res;
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
