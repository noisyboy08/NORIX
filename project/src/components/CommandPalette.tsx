import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Zap, SearchCode, Mail, Link, AlertTriangle, CreditCard, Box, Settings, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../pageTypes';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (b: boolean) => void;
  navigate: (page: Page) => void;
  isDark: boolean;
}

const ITEMS: { title: string; icon: typeof Zap; page: Page; badge?: string }[] = [
  { title: 'Universal Scan', icon: Zap, page: 'universal' },
  { title: 'URL Scanner', icon: Link, page: 'url' },
  { title: 'Email Intel', icon: Mail, page: 'email_intel' },
  { title: 'Fleet Tracker', icon: Box, page: 'fleet', badge: 'NEW' },
  { title: 'Catch the Phish Sandbox', icon: AlertTriangle, page: 'training' },
  { title: 'PhishBot AI', icon: SearchCode, page: 'phishbot' },
  { title: 'Enterprise Settings', icon: Settings, page: 'enterprise' },
];

export default function CommandPalette({ open, setOpen, navigate, isDark }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = 'norix-cmd-title';

  const filtered = ITEMS.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setSelected(0);
  }, [query, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const root = panelRef.current;
    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const list = focusables();
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (!filtered.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((i) => (i + 1) % filtered.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((i) => (i - 1 + filtered.length) % filtered.length);
      }
      if (e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const item = filtered[selected];
        if (item) {
          navigate(item.page);
          setOpen(false);
        }
      }
    };
    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, selected, navigate, setOpen]);

  const runNavigate = useCallback(
    (page: Page) => {
      navigate(page);
      setOpen(false);
    },
    [navigate, setOpen]
  );

  if (!open) return null;

  const C = {
    overlay: isDark ? 'bg-black/55 backdrop-blur-md' : 'bg-gray-900/15 backdrop-blur-md',
    modal: isDark ? 'bg-[#0a0a0b] border-white/10 ring-white/10 shadow-2xl shadow-black/50' : 'bg-[#f8f7f4] border-gray-200 ring-black/5 shadow-xl',
    input: isDark ? 'bg-transparent text-white placeholder-gray-500' : 'bg-transparent text-gray-900 placeholder-gray-400',
    item: isDark ? 'hover:bg-white/5 data-[selected=true]:bg-white/10' : 'hover:bg-gray-200/80 data-[selected=true]:bg-gray-200',
    itemText: isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900',
    sectionText: isDark ? 'text-gray-500' : 'text-gray-500',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] ${C.overlay}`}
        onClick={() => setOpen(false)}
        role="presentation"
      >
        <motion.div
          ref={panelRef}
          id="norix-command-palette"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-xl rounded-xl border ring-1 shadow-2xl overflow-hidden outline-none ${C.modal}`}
          tabIndex={-1}
        >
          <span id={titleId} className="sr-only">
            Command palette — search or jump to a Norix tool
          </span>
          <div className={`flex items-center px-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} gap-3`}>
            <Search className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} aria-hidden />
            <input
              autoFocus
              className={`flex-1 h-14 outline-none ${C.input} text-lg`}
              placeholder="Search Norix or type a command..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search commands"
              aria-controls="norix-cmd-results"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`p-1 rounded-md hover:bg-gray-500/20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              aria-label="Close command palette"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2" id="norix-cmd-results" role="listbox" aria-label="Suggestions">
            {filtered.length === 0 && (
              <div className={`p-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No results found.</div>
            )}

            {filtered.length > 0 && (
              <div className="py-2">
                <div className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${C.sectionText}`}>Suggestions</div>
                {filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const isSel = idx === selected;
                  return (
                    <button
                      key={item.page}
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      data-selected={isSel}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg group transition-colors ${C.item}`}
                      onClick={() => runNavigate(item.page)}
                      onMouseEnter={() => setSelected(idx)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-md ${isDark ? 'bg-white/5 text-gray-400 group-hover:text-blue-400' : 'bg-gray-100 text-gray-500 group-hover:text-blue-600'}`}
                        >
                          <Icon className="w-4 h-4" aria-hidden />
                        </div>
                        <span className={`text-sm font-medium ${C.itemText}`}>{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] font-bold bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded uppercase">{item.badge}</span>
                        )}
                      </div>
                      <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-gray-400' : 'text-gray-400'}`} aria-hidden />
                    </button>
                  );
                })}
              </div>
            )}

            {!query && (
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className={`text-xs font-semibold uppercase tracking-wider px-3 my-2 ${C.sectionText}`}>Quick Actions</div>
                <button
                  type="button"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg group ${C.item}`}
                  onClick={() => {
                    localStorage.removeItem('pg-view');
                    window.location.reload();
                  }}
                >
                  <CreditCard className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} aria-hidden />
                  <span className={`text-sm ${C.itemText}`}>Log out & return to Landing Page</span>
                </button>
              </div>
            )}
          </div>

          <div
            className={`p-3 border-t text-[10px] flex items-center justify-between ${isDark ? 'border-white/5 bg-white/[0.02] text-gray-500' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
          >
            <span className="flex items-center gap-1">
              Search powered by <span className="font-bold">Norix OS</span>
            </span>
            <div className="flex gap-2 flex-wrap justify-end">
              <span className="flex gap-1 items-center">
                <kbd className={`px-1.5 py-0.5 rounded border ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-white'}`}>↑↓</kbd>{' '}
                navigate
              </span>
              <span className="flex gap-1 items-center">
                <kbd className={`px-1.5 py-0.5 rounded border ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-white'}`}>↵</kbd>{' '}
                open
              </span>
              <span className="flex gap-1 items-center">
                <kbd className={`px-1.5 py-0.5 rounded border ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-white'}`}>esc</kbd>{' '}
                close
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
