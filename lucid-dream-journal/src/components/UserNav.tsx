"use client";

import { useUser } from '@/hooks/useUser';

export default function UserNav() {
  const { user, logout } = useUser();
  if (!user?.userId) {
    return (
      <div className="flex items-center gap-3">
        <a href="/login" className="hover:underline">Log in</a>
        <a href="/signup" className="hover:underline">Sign up</a>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <span className="text-neutral-500 text-sm">{user.username}</span>
      <button className="btn-outline" onClick={() => logout()}>Log out</button>
    </div>
  );
}
