"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUser() {
  const { data, isLoading, error, mutate } = useSWR('/api/me', fetcher);

  async function login(username: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? 'Login failed');
    }
    await mutate();
  }

  async function signup(username: string, password: string) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? 'Signup failed');
    }
    await mutate();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    await mutate();
  }

  return { user: data ?? null, isLoading, error, login, signup, logout, refresh: mutate };
}
