import { NextResponse } from 'next/server';
import { getUserIdFromRequest, verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = /(?:^|; )token=([^;]+)/.exec(cookie);
  if (!match) return NextResponse.json({ userId: null }, { status: 200 });
  const payload = await verifyJwt(decodeURIComponent(match[1]));
  if (!payload) return NextResponse.json({ userId: null }, { status: 200 });
  return NextResponse.json({ userId: payload.sub, username: payload.username });
}
