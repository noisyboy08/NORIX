// UI Upgrade 1: Animated Score Counter hook
// UI Upgrade 7: Typewriter effect hook
// UI Upgrade 10: Confetti animation
// UI Upgrade 4: Multi-step scan progress
// UI Upgrade 6: SVG Gauge / Speedometer

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

// ─── Animated Score Counter (UI #1) ──────────────────────────────
export function useAnimatedScore(target: number, duration = 900) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const steps = 40;
    const stepTime = duration / steps;
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setDisplay(target); clearInterval(timer); return; }
      setDisplay(Math.floor(start));
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return display;
}

// ─── Typewriter Effect (UI #7) ───────────────────────────────────
export function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayed;
}

// ─── Confetti (UI #10) ───────────────────────────────────────────
export function fireSafeConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#34d399', '#6ee7b7', '#3b82f6', '#60a5fa'] });
  setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.4, x: 0.2 } }), 300);
  setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.4, x: 0.8 } }), 500);
}

// ─── Multi-Step Progress (UI #4) ─────────────────────────────────
export interface ScanStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

export function MultiStepProgress({ steps }: { steps: ScanStep[] }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              {/* Circle */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                step.status === 'done'    ? 'bg-emerald-500 shadow-lg shadow-emerald-900/50' :
                step.status === 'running' ? 'bg-blue-500 shadow-lg shadow-blue-900/50 animate-pulse' :
                step.status === 'error'   ? 'bg-red-500' : 'bg-slate-700'
              }`}>
                {step.status === 'done'    && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                {step.status === 'running' && <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {step.status === 'error'   && <span className="text-white text-xs font-bold">!</span>}
                {step.status === 'pending' && <div className="w-2 h-2 bg-slate-500 rounded-full" />}
              </div>
              {/* Label */}
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${step.status === 'done' ? 'text-emerald-400' : step.status === 'running' ? 'text-blue-400' : step.status === 'error' ? 'text-red-400' : 'text-slate-500'}`}>
                  {step.label}
                </p>
                {step.detail && <p className="text-xs text-slate-500 truncate">{step.detail}</p>}
              </div>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-4 mx-1 flex-shrink-0 transition-all duration-700 ${
                steps[i + 1].status !== 'pending' ? 'bg-blue-500' : 'bg-slate-700'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gauge / Speedometer (UI #6) ─────────────────────────────────
export function RiskGauge({ score, size = 180 }: { score: number; size?: number }) {
  const radius = 70;
  const cx = 90, cy = 90;

  const riskColor = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : score >= 40 ? '#facc15' : score >= 20 ? '#3b82f6' : '#10b981';
  const displayScore = useAnimatedScore(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.6} viewBox="0 0 180 105">
        {/* Track */}
        <path d={`M 20 90 A 70 70 0 0 1 160 90`} fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
        {/* Color segments */}
        <path d={`M 20 90 A 70 70 0 0 1 56 30`}   fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
        <path d={`M 56 30 A 70 70 0 0 1 90 20`}   fill="none" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
        <path d={`M 90 20 A 70 70 0 0 1 124 30`}  fill="none" stroke="#facc15" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
        <path d={`M 124 30 A 70 70 0 0 1 160 90`} fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
        {/* Needle */}
        {score > 0 && (() => {
          const angle = (score / 100) * 180 - 180; // -180 to 0 degrees
          const rad = (angle * Math.PI) / 180;
          const nx = cx + radius * Math.cos(rad);
          const ny = cy + radius * Math.sin(rad);
          return (
            <>
              <path d={`M 20 90 A 70 70 0 ${score > 50 ? 1 : 0} 1 ${nx.toFixed(1)} ${ny.toFixed(1)}`}
                fill="none" stroke={riskColor} strokeWidth="10" strokeLinecap="round"
                style={{ transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
              {/* Needle tip */}
              <circle cx={nx} cy={ny} r="5" fill={riskColor} />
            </>
          );
        })()}
        {/* Center */}
        <circle cx={cx} cy={cy} r="10" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
        {/* Score text */}
        <text x={cx} y={cy - 15} textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="Inter,system-ui">{displayScore}</text>
        <text x={cx} y={cy - 2}  textAnchor="middle" fill="#64748b" fontSize="8"  fontFamily="Inter,system-ui">/ 100</text>
        {/* Labels */}
        <text x="14" y="102" fill="#10b981" fontSize="7" fontWeight="700">SAFE</text>
        <text x="152" y="102" fill="#ef4444" fontSize="7" fontWeight="700" textAnchor="end">THREAT</text>
      </svg>
      <div className={`text-sm font-extrabold -mt-1 ${score >= 60 ? 'text-red-400' : score >= 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
        {score >= 80 ? '🚨 CRITICAL' : score >= 60 ? '⚠️ HIGH RISK' : score >= 40 ? '⚡ SUSPICIOUS' : score >= 20 ? '🔵 LOW RISK' : '✅ SAFE'}
      </div>
    </div>
  );
}

// ─── Theme Context (UI #2: Dark/Light mode) ───────────────────────
export type Theme = 'dark' | 'light';

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg-base', '#f8f7f4');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--text-primary', '#111827');
    root.style.setProperty('--text-muted', '#6b7280');
    root.style.setProperty('--border-color', '#e5e7eb');
    document.body.style.backgroundColor = '#f8f7f4';
    document.body.style.color = '#111827';
    root.classList.add('light-mode');
    root.classList.remove('dark-mode', 'dark');
  } else {
    root.style.setProperty('--bg-base', '#0a0a0b');
    root.style.setProperty('--bg-card', '#0a0a0a');
    root.style.setProperty('--text-primary', '#f9fafb');
    root.style.setProperty('--text-muted', '#9ca3af');
    root.style.setProperty('--border-color', 'rgba(255,255,255,0.1)');
    document.body.style.backgroundColor = '#0a0a0b';
    document.body.style.color = '#f9fafb';
    root.classList.add('dark-mode', 'dark');
    root.classList.remove('light-mode');
  }
  localStorage.setItem('pg-theme', theme);
}

// ─── Dynamic Background (UI #3) ───────────────────────────────────
export function useDynamicBackground(score: number) {
  useEffect(() => {
    if (score === 0) return;
    const body = document.body;
    if (score >= 80) {
      body.style.background = 'radial-gradient(ellipse at top, #2e0808 0%, #000000 60%)';
    } else if (score >= 60) {
      body.style.background = 'radial-gradient(ellipse at top, #2b1600 0%, #000000 60%)';
    } else if (score >= 40) {
      body.style.background = 'radial-gradient(ellipse at top, #1a1a0c 0%, #000000 60%)';
    } else {
      body.style.background = 'radial-gradient(ellipse at top, #051a1a 0%, #000000 60%)';
    }
    return () => { body.style.background = ''; };
  }, [score]);
}

// ─── Glassmorphism CSS classes (UI #5) ──────────────────────────
// Use these class strings anywhere in the app:
export const GLASS = 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/30';
export const GLASS_CARD = 'bg-slate-800/40 backdrop-blur-xl border border-white/[0.06] shadow-xl';

export { default as CommunityLeaderboard } from './CommunityLeaderboard';

// ─── Mobile Bottom Nav (UI #8) ────────────────────────────────────
export function MobileBottomNav({
  current,
  onNav,
  theme = 'dark',
}: {
  current: string;
  onNav: (id: string) => void;
  theme?: Theme;
}) {
  const items = [
    { id: 'universal', icon: '⚡', label: 'Scan' },
    { id: 'history', icon: '🕐', label: 'History' },
    { id: 'dashboard', icon: '📊', label: 'Analytics' },
    { id: 'tools', icon: '🔧', label: 'Tools' },
    { id: 'phishbot', icon: '🤖', label: 'PhishBot' },
  ];
  const isLight = theme === 'light';
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-xl border-t ${
        isLight ? 'bg-white/95 border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]' : 'bg-black/90 border-white/10'
      }`}
    >
      <div className="flex relative">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNav(item.id)}
            className={`relative flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${
              current === item.id
                ? isLight
                  ? 'text-blue-600'
                  : 'text-blue-400'
                : isLight
                  ? 'text-gray-500'
                  : 'text-gray-500'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-bold">{item.label}</span>
            {current === item.id && (
              <div
                className={`absolute bottom-1 w-8 h-0.5 rounded-full ${isLight ? 'bg-blue-600' : 'bg-blue-400'}`}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
