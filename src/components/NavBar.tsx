'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

const links = [
  { href: '/', label: '🏠', title: 'Home' },
  { href: '/chat', label: '💬', title: 'Chat' },
  { href: '/journal', label: '📝', title: 'Journal' },
  { href: '/breathe', label: '🫁', title: 'Breathe' },
  { href: '/mood-history', label: '📊', title: 'Moods' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#222240]/90 backdrop-blur-lg border-t border-black/5 dark:border-white/10">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${pathname === l.href ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
            <span className="text-xl">{l.label}</span>
            <span className="text-[10px]">{l.title}</span>
          </Link>
        ))}
        <DarkModeToggle />
      </div>
    </nav>
  );
}
