import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) console.warn('AUTH_SECRET is not set. Set it in your environment.');
const key = AUTH_SECRET ? new TextEncoder().encode(AUTH_SECRET) : new TextEncoder().encode('dev-secret');

export type JwtPayload = {
  sub: string; // userId
  username: string;
};

export async function createJwt(payload: JwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function buildAuthCookie(token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  return `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}; ${isProd ? 'Secure' : ''}`;
}

export async function getUserIdFromRequest(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = /(?:^|; )token=([^;]+)/.exec(cookie);
  if (!match) return null;
  const payload = await verifyJwt(decodeURIComponent(match[1]));
  return payload?.sub ?? null;
}
