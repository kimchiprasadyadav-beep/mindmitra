'use client';
import { useState, useEffect } from 'react';
import { getJournalEntries, addJournalEntry, type JournalEntry } from '@/lib/storage';

const PROMPTS = ['What made you smile today?', "What's on your mind?", 'Write a letter to yourself', "3 things you're grateful for"];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [activePrompt, setActivePrompt] = useState<string | undefined>();

  useEffect(() => { setEntries(getJournalEntries().reverse()); }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    const entry: JournalEntry = { id: Date.now().toString(), text: text.trim(), prompt: activePrompt, timestamp: Date.now() };
    addJournalEntry(entry);
    setEntries([entry, ...entries]);
    setText('');
    setActivePrompt(undefined);
  };

  const exportEntries = () => {
    const all = getJournalEntries();
    const content = all.map(e => {
      const date = new Date(e.timestamp).toLocaleDateString('en-IN', { dateStyle: 'long' });
      return `${date}${e.prompt ? ` — ${e.prompt}` : ''}\n${e.text}\n`;
    }).join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mindmitra-journal.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal 📝</h1>
        {entries.length > 0 && (
          <button onClick={exportEntries} className="text-xs px-3 py-1.5 rounded-full bg-[#E8D5F5]/50 dark:bg-[#E8D5F5]/10 hover:bg-[#E8D5F5] transition-colors">Export</button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {PROMPTS.map(p => (
          <button key={p} onClick={() => { setActivePrompt(p); setText(''); }} className={`text-xs px-3 py-1.5 rounded-full transition-all ${activePrompt === p ? 'bg-[#5B9EA6] text-white' : 'bg-white/60 dark:bg-[#222240]/60 hover:bg-[#E8D5F5]/50'}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activePrompt && <p className="text-sm font-medium text-[#5B9EA6]">{activePrompt}</p>}
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write freely, this is your space..." rows={5} className="w-full px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#222240]/80 focus:outline-none focus:ring-2 focus:ring-[#5B9EA6] text-sm resize-none" />
        <button onClick={handleSave} disabled={!text.trim()} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E8D5F5] to-[#5B9EA6] text-[#2D3436] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">Save Entry</button>
      </div>

      {entries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold opacity-50">Past Entries</h2>
          {entries.map(e => (
            <div key={e.id} className="bg-white/60 dark:bg-[#222240]/60 backdrop-blur-md rounded-2xl p-4 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-50">{new Date(e.timestamp).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                {e.prompt && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B9EA6]/10 text-[#5B9EA6]">{e.prompt}</span>}
              </div>
              <p className="text-sm leading-relaxed">{e.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
