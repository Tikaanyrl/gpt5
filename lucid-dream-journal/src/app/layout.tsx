import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lucid Dream Journal',
  description: 'Track your dreams and lucidity over time.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative min-h-screen overflow-x-clip">
            <div className="aurora" />

            <header className="border-b border-border">
              <div className="container flex items-center justify-between h-16">
                <Link href="/" className="font-semibold flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 shadow-inner" />
                  Lucid Dream Journal
                </Link>
                <nav className="flex items-center gap-3 text-sm">
                  <Link href="/" className="hover:underline">Journal</Link>
                  <Link href="/overview" className="hover:underline">Overview</Link>
                  <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
                  <ThemeToggle />
                  <UserNav />
                </nav>
              </div>
            </header>
            <main className="container py-6 animate-fadeInUp">{children}</main>
            <footer className="container py-8 text-xs text-neutral-500">
              Built with Next.js • Deployed on Vercel • MongoDB Atlas
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}