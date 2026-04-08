import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

const COLORS = {
  success: 'border-emerald-500/40 bg-emerald-950/80',
  error:   'border-red-500/40 bg-red-950/80',
  warning: 'border-yellow-500/40 bg-yellow-950/80',
  info:    'border-blue-500/40 bg-blue-950/80',
};

const TEXT = {
  success: 'text-emerald-300',
  error:   'text-red-300',
  warning: 'text-yellow-300',
  info:    'text-blue-300',
};

let toastHandlers: ((toast: Toast) => void)[] = [];

export function showToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  toastHandlers.forEach(h => h({ ...toast, id }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration ?? 4000);
    };
    toastHandlers.push(handler);
    return () => { toastHandlers = toastHandlers.filter(h => h !== handler); };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg shadow-2xl min-w-64 max-w-80 pointer-events-auto animate-slide-in ${COLORS[t.type]}`}>
          <span className="text-lg flex-shrink-0 mt-0.5">{ICONS[t.type]}</span>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${TEXT[t.type]}`}>{t.title}</p>
            {t.message && <p className="text-xs text-slate-400 mt-0.5">{t.message}</p>}
          </div>
          <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
            className="text-slate-500 hover:text-slate-300 text-sm flex-shrink-0 ml-1">✕</button>
        </div>
      ))}
    </div>
  );
}
