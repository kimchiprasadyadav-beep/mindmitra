'use client';
import { useEffect, useState } from 'react';
import { getDarkMode, setDarkMode } from '@/lib/storage';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = getDarkMode();
    setDark(d);
    document.documentElement.classList.toggle('dark', d);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };
  return (
    <button onClick={toggle} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="Toggle dark mode">
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
