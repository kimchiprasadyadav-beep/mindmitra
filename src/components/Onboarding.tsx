'use client';
import { useState } from 'react';
import { setUserName, setOnboarded } from '@/lib/storage';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) { setUserName(name.trim()); setOnboarded(); onComplete(); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#E8D5F5] to-[#5B9EA6]/30 dark:from-[#2A1F3D] dark:to-[#1A3A3F] p-6">
      <div className="bg-white/90 dark:bg-[#222240]/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-5xl mb-4">💜</div>
        <h1 className="text-2xl font-bold mb-2">Hi, I&apos;m MindMitra</h1>
        <p className="text-sm opacity-70 mb-6">Your safe space to think, feel, and grow.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm opacity-70 block mb-1">What should I call you?</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name..." className="w-full px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A2E] text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#5B9EA6]" autoFocus />
          </div>
          <button type="submit" disabled={!name.trim()} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E8D5F5] to-[#5B9EA6] text-[#2D3436] font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-40">
            Let&apos;s begin ✨
          </button>
        </form>
      </div>
    </div>
  );
}
