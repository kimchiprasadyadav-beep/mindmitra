'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';
const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: 'inhale', duration: 4000, label: 'Breathe In' },
  { phase: 'hold', duration: 7000, label: 'Hold' },
  { phase: 'exhale', duration: 8000, label: 'Breathe Out' },
];

export default function BreathePage() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);

  const startCountdown = useCallback((duration: number) => {
    const total = Math.ceil(duration / 1000);
    setCount(total);
    let c = total;
    countRef.current = setInterval(() => { c--; if (c >= 0) setCount(c); }, 1000);
  }, []);

  const runCycle = useCallback((idx: number) => {
    if (!activeRef.current) return;
    if (idx >= PHASES.length) { setCycles(c => c + 1); runCycle(0); return; }
    const { phase: p, duration } = PHASES[idx];
    setPhase(p);
    startCountdown(duration);
    timerRef.current = setTimeout(() => {
      if (countRef.current) clearInterval(countRef.current);
      runCycle(idx + 1);
    }, duration);
  }, [startCountdown]);

  const start = () => { activeRef.current = true; setActive(true); setCycles(0); runCycle(0); };
  const stop = useCallback(() => {
    activeRef.current = false; setActive(false); setPhase('idle'); setCount(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const circleClass = phase === 'inhale' ? 'breathe-in' : phase === 'hold' ? 'breathe-hold' : phase === 'exhale' ? 'breathe-out' : '';
  const phaseLabel = PHASES.find(p => p.phase === phase)?.label || 'Ready';

  return (
    <div className="pt-6 flex flex-col items-center min-h-[calc(100vh-10rem)]">
      <h1 className="text-2xl font-bold mb-2">Breathing Exercise 🫁</h1>
      <p className="text-xs opacity-50 mb-8">4-7-8 Technique • Calms your nervous system</p>
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-[#E8D5F5] to-[#5B9EA6] flex items-center justify-center transition-all ${circleClass} ${active ? 'pulse-glow' : ''}`} style={{ transform: phase === 'idle' ? 'scale(0.6)' : undefined, opacity: phase === 'idle' ? 0.5 : undefined }}>
            <div className="text-center text-white">
              <div className="text-4xl font-bold">{active ? count : '🧘'}</div>
              <div className="text-sm mt-1 font-medium">{phaseLabel}</div>
            </div>
          </div>
          <div className={`absolute inset-[-12px] rounded-full border-2 border-[#5B9EA6]/20 ${active ? 'animate-ping' : ''}`} style={{ animationDuration: '4s' }} />
        </div>
      </div>
      <div className="space-y-3 w-full max-w-xs pb-8">
        {cycles > 0 && <p className="text-center text-xs opacity-50">{cycles} cycle{cycles > 1 ? 's' : ''} complete</p>}
        <button onClick={active ? stop : start} className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${active ? 'bg-white/60 dark:bg-[#222240]/60 text-[#2D3436] dark:text-white' : 'bg-gradient-to-r from-[#E8D5F5] to-[#5B9EA6] text-[#2D3436]'}`}>
          {active ? 'Stop' : 'Start Breathing'}
        </button>
      </div>
    </div>
  );
}
