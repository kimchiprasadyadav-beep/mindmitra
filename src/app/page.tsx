'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Onboarding from '@/components/Onboarding';
import { hasOnboarded, getUserName, addMood, getMoods } from '@/lib/storage';

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 5 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😔', label: 'Sad', value: 2 },
  { emoji: '😰', label: 'Anxious', value: 1 },
  { emoji: '😡', label: 'Angry', value: 1 },
];

const ACTIONS = [
  { href: '/chat', emoji: '💬', label: 'Talk to MindMitra' },
  { href: '/journal', emoji: '📝', label: 'Journal' },
  { href: '/breathe', emoji: '🫁', label: 'Breathing Exercise' },
  { href: '/mood-history', emoji: '📊', label: 'Mood History' },
];

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserNameState] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    if (!hasOnboarded()) setShowOnboarding(true);
    else setUserNameState(getUserName());
    const moods = getMoods();
    const today = new Date().toDateString();
    if (moods.some(m => new Date(m.timestamp).toDateString() === today)) setTodayLogged(true);
  }, []);

  const handleMoodSelect = (idx: number) => {
    setSelectedMood(idx);
    addMood({ ...MOODS[idx], timestamp: Date.now() });
    setTodayLogged(true);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={() => { setShowOnboarding(false); setUserNameState(getUserName()); }} />;
  }

  return (
    <div className="pt-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9B6BB0] to-[#5B9EA6] bg-clip-text text-transparent">
          {userName ? `Hi, ${userName} 💜` : 'Welcome back 💜'}
        </h1>
        <p className="text-sm opacity-60 mt-1">How are you feeling today?</p>
      </div>

      <div className="bg-white/60 dark:bg-[#222240]/60 backdrop-blur-md rounded-3xl p-6 shadow-sm">
        {todayLogged && selectedMood === null ? (
          <p className="text-center text-sm opacity-60">You&apos;ve already checked in today ✨</p>
        ) : selectedMood !== null ? (
          <div className="text-center space-y-2 animate-fade-in-up">
            <div className="text-4xl">{MOODS[selectedMood].emoji}</div>
            <p className="text-sm opacity-70">Noted! Thanks for checking in 💜</p>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => handleMoodSelect(i)} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-[#E8D5F5]/50 dark:hover:bg-[#E8D5F5]/10 transition-all hover:scale-110 active:scale-95">
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-[10px] opacity-60">{m.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map(a => (
          <Link key={a.href} href={a.href} className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-[#222240]/60 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <span className="text-2xl">{a.emoji}</span>
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
