import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import Disclaimer from '@/components/Disclaimer';

export const metadata: Metadata = {
  title: 'MindMitra — Your AI Wellness Companion',
  description: 'A warm, empathetic AI therapy companion for mood tracking, journaling, and CBT-based conversations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><link rel="manifest" href="/manifest.json" /></head>
      <body className="min-h-screen pb-20">
        <main className="max-w-lg mx-auto px-4">{children}</main>
        <div className="max-w-lg mx-auto"><Disclaimer /></div>
        <NavBar />
      </body>
    </html>
  );
}
