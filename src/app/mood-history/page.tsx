'use client';
import { useState, useEffect } from 'react';
import { getMoods, type MoodEntry } from '@/lib/storage';

const MOOD_COLORS: Record<string, string> = { '😊': '#4CAF50', '😐': '#FFB74D', '😔': '#7986CB', '😰': '#FF8A65', '😡': '#EF5350' };

export default function MoodHistoryPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [range, setRange] = useState<7 | 30>(7);

  useEffect(() => { setMoods(getMoods()); }, []);

  const cutoff = Date.now() - range * 24 * 60 * 60 * 1000;
  const filtered = moods.filter(m => m.timestamp >= cutoff);

  const days = new Map<string, MoodEntry[]>();
  filtered.forEach(m => {
    const key = new Date(m.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (!days.has(key)) days.set(key, []);
    days.get(key)!.push(m);
  });
  const dayEntries = Array.from(days.entries());

  const avgRecent = filtered.length > 0 ? filtered.reduce((s, m) => s + m.value, 0) / filtered.length : 0;
  const trend = avgRecent >= 4 ? "You've been feeling great! 🌟" : avgRecent >= 3 ? "Steady vibes this week 💜" : avgRecent >= 2 ? "Hang in there, you're doing your best 🤗" : filtered.length > 0 ? "Tough times don't last, but tough people do 💪" : '';

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mood History 📊</h1>
        <div className="flex gap-1 bg-white/60 dark:bg-[#222240]/60 rounded-full p-1">
          {([7, 30] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} className={`text-xs px-3 py-1 rounded-full transition-all ${range === r ? 'bg-[#5B9EA6] text-white' : ''}`}>{r}d</button>
          ))}
        </div>
      </div>

      {trend && <p className="text-sm text-center opacity-70">{trend}</p>}

      {dayEntries.length > 0 ? (
        <div className="bg-white/60 dark:bg-[#222240]/60 backdrop-blur-md rounded-3xl p-6">
          <div className="flex items-end gap-2 h-40 overflow-x-auto">
            {dayEntries.map(([day, entries]) => {
              const avg = entries.reduce((s, m) => s + m.value, 0) / entries.length;
              const height = (avg / 5) * 100;
              const latestEmoji = entries[entries.length - 1].emoji;
              const color = MOOD_COLORS[latestEmoji] || '#5B9EA6';
              return (
                <div key={day} className="flex flex-col items-center gap-1 flex-1 min-w-[40px]">
                  <span className="text-lg">{latestEmoji}</span>
                  <div className="w-full flex justify-center">
                    <div className="w-6 rounded-full transition-all" style={{ height: `${height}%`, backgroundColor: color, opacity: 0.7, minHeight: '8px' }} />
                  </div>
                  <span className="text-[9px] opacity-50">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 opacity-40">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No mood data yet. Check in from the home page!</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold opacity-50">Recent Check-ins</h2>
          {[...filtered].reverse().slice(0, 10).map((m, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/40 dark:bg-[#222240]/40 rounded-xl px-4 py-2">
              <span className="text-xl">{m.emoji}</span>
              <span className="text-sm flex-1">{m.label}</span>
              <span className="text-xs opacity-40">{new Date(m.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
