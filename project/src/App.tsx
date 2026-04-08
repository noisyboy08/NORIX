import { useState, useEffect } from 'react';
import {
  Shield, Zap, Link2, Mail, BarChart3, Clock,
  Wrench, ChevronRight, Menu, X, Upload, Search,
  Bot, Radio, BookOpen, Key, Fingerprint, Mic, Sun, Moon, Scale, Box, Lock,
  Globe, ScanLine, Database
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import { AppPageContent } from './AppPages';
import type { Page } from './pageTypes';
import { ToastContainer } from './components/Toast';
import { MobileBottomNav, applyTheme, type Theme } from './components/UIUpgrades';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from './components/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';

const NAV_GROUPS = [
  {
    label: 'Detection',
    items: [
      { id: 'universal' as Page, label: 'Universal Scan',    icon: Zap,         badge: 'AI',     color: 'text-blue-400'    },
      { id: 'url'       as Page, label: 'URL Scanner',       icon: Link2,       badge: null,     color: 'text-cyan-400'    },
      { id: 'text'      as Page, label: 'Email / Message',   icon: Mail,        badge: null,     color: 'text-purple-400'  },
      { id: 'bulk'      as Page, label: 'Bulk Scanner',      icon: Upload,      badge: null,     color: 'text-indigo-400'  },
      { id: 'header'    as Page, label: 'Email Headers',     icon: Search,      badge: null,     color: 'text-cyan-400'    },
      { id: 'otp'       as Page, label: 'OTP/SMS Scan',      icon: Shield,      badge: 'HOT',   color: 'text-red-400'     },
    ]
  },
  {
    label: 'Threat Intelligence',
    items: [
      { id: 'feed'       as Page, label: 'Live Threat Feed',  icon: Radio,       badge: 'LIVE',   color: 'text-red-400'    },
      { id: 'voice'      as Page, label: 'Voice Scam Scan',   icon: Mic,         badge: null,     color: 'text-pink-400'   },
      { id: 'campaign'   as Page, label: 'Campaign Tracker',  icon: Fingerprint, badge: null,     color: 'text-violet-400' },
    ]
  },
  {
    label: 'God-Level Intelligence',
    items: [
      { id: 'god_level'  as Page, label: 'Cognitive Shield AI', icon: Zap,    badge: 'PRO',     color: 'text-yellow-400' },
      { id: 'supreme_god' as Page, label: 'Supreme God Level',  icon: Zap,    badge: 'APEX',    color: 'text-red-500' },
    ]
  },
  {
    label: 'Analysis',
    items: [
      { id: 'history'    as Page, label: 'Browse History',    icon: Clock,       badge: null,     color: 'text-orange-400' },
      { id: 'dashboard'  as Page, label: 'Analytics',         icon: BarChart3,   badge: null,     color: 'text-emerald-400'},
      { id: 'tools'      as Page, label: 'Security Tools',    icon: Wrench,      badge: null,     color: 'text-yellow-400' },
      { id: 'breach'     as Page, label: 'Breach Checker',    icon: Key,         badge: null,     color: 'text-rose-400'   },
    ]
  },
  {
    label: 'Enterprise AI Suite',
    items: [
      { id: 'fleet'       as Page, label: 'Fleet Tracker',       icon: Globe,     badge: 'NEW', color: 'text-emerald-400' },
      { id: 'email_intel' as Page, label: 'Email Intelligence',  icon: Mail,      badge: 'ML', color: 'text-blue-400' },
      { id: 'phone_intel' as Page, label: 'Phone TrueScan',      icon: Radio,     badge: 'PRO', color: 'text-orange-400' },
      { id: 'ad_blocker'  as Page, label: 'Active Ad Blocker',   icon: Shield,    badge: null, color: 'text-rose-400' },
      { id: 'sandbox'     as Page, label: 'Sandbox Environment', icon: Box,       badge: 'NEW', color: 'text-indigo-400' },
      { id: 'enterprise'  as Page, label: 'Enterprise Security', icon: Lock,      badge: 'BDR', color: 'text-teal-400' },
    ]
  },
  {
    label: 'Advanced Vaults',
    items: [
      { id: 'threat_radar' as Page, label: 'Threat Radar Map', icon: Globe, badge: 'MAP', color: 'text-blue-400' },
      { id: 'visual_dom' as Page, label: 'Visual UI Cloning AI', icon: ScanLine, badge: 'NEW', color: 'text-purple-400' },
      { id: 'social_scan' as Page, label: 'Social Deepfake Check', icon: Fingerprint, badge: 'HOT', color: 'text-pink-400' },
      { id: 'breach_checker' as Page, label: 'Breach Autopsy Vault', icon: Database, badge: null, color: 'text-emerald-400' },
      { id: 'next_gen' as Page, label: 'NextGen 10 Features', icon: Zap, badge: 'V3.0', color: 'text-yellow-400' },
    ]
  },
  {
    label: 'Learn & Community',
    items: [
      { id: 'training'   as Page, label: 'Phishing Training', icon: BookOpen,    badge: null,     color: 'text-green-400'  },
      { id: 'phishbot'   as Page, label: 'PhishBot AI',       icon: Bot,         badge: 'AI',     color: 'text-blue-400'   },
      { id: 'leaderboard'as Page, label: 'Leaderboard',       icon: Shield,      badge: null,     color: 'text-yellow-400' },
    ]
  },
  {
    label: 'Ethics & Transparency',
    items: [
      { id: 'fairness' as Page,   label: 'Fairness Audit',   icon: Scale,        badge: 'NEW',    color: 'text-violet-400' },
    ]
  },
];

const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  universal:   { title: 'Universal Threat Scanner',  subtitle: 'Multi-phase AI: URL · Email · SMS · Phone — offline ML + cloud' },
  url:         { title: 'URL & Domain Scanner',      subtitle: 'Deep-scan any link for phishing, malware & brand impersonation' },
  text:        { title: 'Email & Message Analyzer',  subtitle: 'Detect social engineering, urgency tactics & scam content via NLP' },
  bulk:        { title: 'Bulk URL Scanner',           subtitle: 'Scan 100 URLs simultaneously — export CSV/JSON reports instantly' },
  header:      { title: 'Email Header Analyzer',     subtitle: 'Parse SPF, DKIM, DMARC & mail routing to detect spoofed emails' },
  otp:         { title: 'OTP & SMS Scam Detector',   subtitle: 'Detect KYC fraud, OTP scams, and banking smishing in real-time' },
  feed:        { title: 'Live Threat Intelligence',  subtitle: 'Real-time global phishing feed + animated threat origin heatmap' },
  voice:       { title: 'Voice & Call Scam Detector',subtitle: 'Record or paste call transcripts to detect vishing attacks' },
  campaign:    { title: 'Campaign Fingerprinter',    subtitle: 'Cluster phishing URLs to identify coordinated attack campaigns' },
  history:     { title: 'Browse History Analysis',   subtitle: 'AI retroactively scans your recent browsing for hidden threats' },
  dashboard:   { title: 'Analytics Dashboard',       subtitle: 'Real-time threat intelligence, 6 charts & community detections' },
  tools:       { title: 'Security Tools Hub',        subtitle: 'SSL checker, domain WHOIS, visual brand similarity, QR & rep check' },
  breach:      { title: 'Data Breach Checker',       subtitle: 'Check email/password exposure with k-Anonymity HIBP API' },
  training:    { title: 'Phishing Training Mode',    subtitle: 'Gamified quiz — identify real vs fake emails, URLs, SMS. Earn badges!' },
  phishbot:    { title: 'PhishBot — AI Assistant',   subtitle: 'Gemini-powered chatbot answering all your cybersecurity questions' },
  leaderboard: { title: 'Community Leaderboard',     subtitle: 'Top threat reporters keeping the community safe — Rookie to Elite' },
  fairness:    { title: 'AI Fairness & Bias Audit',   subtitle: 'Detect bias in automated decisions — rule weights, FP rates & full explainability' },
  email_intel: { title: 'Advanced Email Intelligence', subtitle: 'Classify emails, validate IDs (typosquatting), and analyze sender trust.' },
  phone_intel: { title: 'Phone Number Scanner',       subtitle: 'Truecaller-style AI detection of carrier, country, and spam reports.' },
  ad_blocker:  { title: 'Advanced Ad Blocker System', subtitle: 'Block YouTube ads, banners, popups, and trackers via network-level filtering.' },
  sandbox:     { title: 'SquareX-Style Sandbox',      subtitle: 'Disposable browsers, file viewers, and temporary email to neutralize attacks.' },
  enterprise:  { title: 'Enterprise Security',        subtitle: 'Browser Detection & Response (BDR), DLP, and secure private access monitoring.' },
  threat_radar:{ title: 'Global Threat Radar Map',    subtitle: 'Live WebGL map monitoring intercepted phishing and malware infrastructure.' },
  visual_dom:  { title: 'Visual UI Cloning AI',       subtitle: 'Headless Vision transformers that detect visual pixel-perfect brand impersonation.' },
  social_scan: { title: 'Deepfake & Impersonation Tracker', subtitle: 'Audit social handles for bot rings, AI-generated faces, and impersonation velocity.' },
  breach_checker:{ title: 'Breach Autopsy Vault',     subtitle: 'Interactive timeline tracking exactly when, where, and how your digital footprint leaked.' },
  next_gen:    { title: 'Norix 3.0 NextGen Suite', subtitle: 'Interactive demonstration of the 10 requested cutting-edge features.' },
  god_level:   { title: 'God-Level Cognitive AI',     subtitle: 'Detect human psychology manipulation and predict vulnerabilities.' },
  supreme_god: { title: 'Supreme God Level Warfare',  subtitle: 'Counter-offensive injection, zero-day tracing, and synthetic reality analysis.' },
  fleet:       { title: 'Fleet Tracker',              subtitle: 'Global monitoring of enterprise seats.' }
};

// ── Router: Landing Page → App ──────────────────────────────────────────────
import AuthPage from './components/AuthPage';

export default function Router() {
  const [view, setView] = useState<'landing' | 'features' | 'extension' | 'pricing' | 'about' | 'auth' | 'app'>(() => {
    // 1. Check URL param first (used for separate pages and extension bypass)
    const urlView = new URLSearchParams(window.location.search).get('view') as any;
    if (urlView) {
      if (['app', 'auth', 'features', 'extension', 'pricing', 'about'].includes(urlView)) {
        if (urlView === 'app') localStorage.setItem('pg-view', 'app');
        return urlView;
      }
    }
    // 2. Fall back to localStorage, default to 'landing'
    return (localStorage.getItem('pg-view') as any) || 'landing';
  });

  useEffect(() => {
    const handlePopState = () => {
       const v = new URLSearchParams(window.location.search).get('view') as any || 'landing';
       setView(v);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigateView(v: string) {
    if (v === 'app') {
      localStorage.setItem('pg-view', 'app');
    } else {
      localStorage.setItem('pg-view', 'landing');
    }
    const url = new URL(window.location.href);
    url.searchParams.set('view', v);
    window.history.pushState({}, '', url.toString());
    setView(v as any);
    window.scrollTo(0, 0);
  }

  if (view === 'auth') {
    return <AuthPage onLogin={() => navigateView('app')} onBack={() => navigateView('landing')} />;
  }

  if (view !== 'app') {
    return <LandingPage activeTab={view} navigate={navigateView} onEnterApp={() => navigateView('app')} />;
  }

  return <App onBackToLanding={() => navigateView('landing')} />;
}

function App({ onBackToLanding }: { onBackToLanding: () => void }) {
  const [page, setPage] = useState<Page>(() => {
    const p = new URLSearchParams(window.location.search).get('page');
    return Object.keys(PAGE_META).includes(p || '') ? (p as Page) : 'universal';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('pg-theme') as Theme) || 'dark');
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('pg-theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';
  const cn = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  }

  function navigate(id: Page) { setPage(id); setSidebarOpen(false); }

  const meta = PAGE_META[page];
  
  const TAG_MAP: Record<string, Page> = {
    'ML Model': 'universal',
    'HIBP': 'breach',
    'Heatmap': 'threat_radar',
    'Voice AI': 'voice',
    'SPF/DKIM': 'header',
    'PhishBot': 'phishbot',
    'Training': 'training',
    'PWA': 'dashboard',
    'Confetti 🎉': 'training',
    'Gauge': 'universal'
  };

  const marqueeItems = (
    <>
      <span>🛡️ Norix v3.0 — Cognitive phishing defense</span>
      <span>🚀 Built for teams · Same design as norix.ai</span>
      <span>🏆 SDG 9 &amp; 16 aligned</span>
      <span>🔐 Offline ML + optional cloud AI</span>
    </>
  );

  return (
    <div
      className={cn(
        'relative flex min-h-screen min-h-[100dvh] flex-col',
        'md:h-[100dvh] md:max-h-[100dvh] md:min-h-0 md:overflow-hidden',
        isDark ? 'text-gray-100' : 'text-gray-900'
      )}
    >
      {/* Marketing-site canvas */}
      <div className={cn('absolute inset-0 -z-20', isDark ? 'bg-[#0a0a0b]' : 'bg-[#f8f7f4]')} />
      <div
        className={cn(
          'norix-dot-grid absolute inset-0 -z-10 pointer-events-none',
          isDark ? 'norix-dot-grid--dark' : 'norix-dot-grid--light'
        )}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Same blue ticker as landing */}
        <div className="shrink-0 bg-blue-600 text-white text-[11px] font-semibold py-2 overflow-hidden">
          <div className="norix-marquee-track gap-16">
            {[0, 1, 2].map((i) => (
              <span key={i} className="flex items-center gap-10 pr-10">
                {marqueeItems}
              </span>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <CommandPalette open={cmdOpen} setOpen={setCmdOpen} navigate={navigate} isDark={isDark} />
          <ToastContainer />

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
          )}

          {/* Sidebar — glass + borders like landing nav */}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden border-r transition-transform duration-300 md:static md:z-auto md:h-full md:min-h-0 md:translate-x-0 md:shrink-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
              isDark
                ? 'border-white/10 bg-black/85 backdrop-blur-xl'
                : 'border-gray-200 bg-white/95 backdrop-blur-xl shadow-sm'
            )}
          >
            <div
              className={cn(
                'border-b p-5',
                isDark ? 'border-white/10' : 'border-gray-200'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-[15px] font-extrabold leading-tight tracking-tight">Norix</h1>
                  <span className="text-[11px] font-semibold text-blue-500">Dashboard · v3.0</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'ml-auto p-1 md:hidden',
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div
                className={cn(
                  'mt-3 flex items-center gap-2 rounded-full border px-3 py-2',
                  isDark
                    ? 'border-white/15 bg-white/[0.04]'
                    : 'border-gray-200 bg-white shadow-sm'
                )}
              >
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-500">Protection active</span>
              </div>
            </div>

            <nav className="norix-scroll-sidebar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-3 pr-2">
              {NAV_GROUPS.map((group) => (
                <div
                  key={group.label}
                  className={cn(
                    'rounded-xl border p-2.5',
                    isDark
                      ? 'border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
                      : 'border-gray-200 bg-white shadow-sm'
                  )}
                >
                  <p
                    className={cn(
                      'mb-2 border-b pb-2 text-[10px] font-bold uppercase tracking-widest',
                      isDark ? 'border-white/10 text-gray-400' : 'border-gray-100 text-gray-500'
                    )}
                  >
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavItem
                        key={item.id}
                        item={item}
                        active={page === item.id}
                        theme={theme}
                        onClick={() => navigate(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div
              className={cn(
                'space-y-2 border-t p-4',
                isDark ? 'border-white/10' : 'border-gray-200'
              )}
            >
              <div
                className={cn(
                  'rounded-2xl border p-3',
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white shadow-sm'
                )}
              >
                <p className="mb-1 text-xs font-bold text-blue-500">Chrome extension</p>
                <p className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Same Norix engine in your browser — badges, clipboard guard, ad blocking.
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToLanding}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-colors',
                  isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                ← Back to website
              </button>
              <p className={cn('text-center text-[11px]', isDark ? 'text-gray-500' : 'text-gray-400')}>
                © 2026 Norix · SDG 9 &amp; 16
              </p>
            </div>
          </aside>

          {/* Main column: header fixed to pane; body scrolls with its own scrollbar */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-16 md:pb-0">
            <header
              className={cn(
                'z-20 flex shrink-0 items-center gap-3 border-b px-4 py-3.5 backdrop-blur-xl md:px-6',
                isDark ? 'border-white/10 bg-[#0a0a0b]/85' : 'border-gray-200 bg-[#f8f7f4]/90'
              )}
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className={cn('p-1 md:hidden', isDark ? 'text-gray-400' : 'text-gray-600')}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'serif-display text-sm leading-tight sm:text-base',
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  )}
                >
                  Security workspace
                </p>
                <h2 className="truncate text-base font-extrabold">{meta.title}</h2>
                <p
                  className={cn(
                    'hidden truncate text-xs sm:block',
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  )}
                >
                  {meta.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={cn(
                  'rounded-xl border p-2 transition-all',
                  isDark
                    ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                    : 'border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50'
                )}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={onBackToLanding}
                className={cn(
                  'hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:flex',
                  isDark
                    ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                    : 'border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <Globe className={cn('h-4 w-4 shrink-0', isDark ? 'text-blue-400' : 'text-blue-600')} aria-hidden />
                Website
              </button>
            </header>

            <div className="norix-scroll-main min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <div className="px-4 pt-5 md:px-6 lg:px-8">
                <div
                  className={cn(
                    'relative mb-5 overflow-hidden rounded-2xl border shadow-xl',
                    isDark
                      ? 'border-white/10 bg-gradient-to-r from-[#0a0a0a] via-indigo-950/35 to-[#0a0a0a] shadow-black/40'
                      : 'border-gray-200 bg-white shadow-gray-200/50'
                  )}
                >
                  {/* Headline block — separate from shortcuts */}
                  <div className="p-5 pb-4">
                    <p
                      className={cn(
                        'text-base font-extrabold md:text-lg',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      Norix — 25-feature cyber defense
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-xs font-bold',
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      )}
                    >
                      URL · Email · SMS · Voice · Headers · Bulk · Training · AI
                    </p>
                  </div>

                  {/* Quick links: horizontal strip + edge fades + distinct scrollbar */}
                  <div
                    className={cn(
                      'relative border-t px-3 py-3 sm:px-5',
                      isDark ? 'border-white/10 bg-black/25' : 'border-gray-100 bg-gray-50/90'
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 px-1">
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-widest',
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        )}
                      >
                        Quick links
                      </span>
                      <span
                        className={cn(
                          'hidden text-[9px] font-semibold sm:inline',
                          isDark ? 'text-gray-600' : 'text-gray-400'
                        )}
                      >
                        Swipe or scroll →
                      </span>
                    </div>
                    <div className="relative">
                      <div
                        className={cn(
                          'pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r sm:w-10',
                          isDark ? 'from-[#0a0a0a]/95 to-transparent' : 'from-gray-50 to-transparent'
                        )}
                        aria-hidden
                      />
                      <div
                        className={cn(
                          'pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l sm:w-10',
                          isDark ? 'from-[#0a0a0a]/95 to-transparent' : 'from-gray-50 to-transparent'
                        )}
                        aria-hidden
                      />
                      <div
                        className="norix-scroll-quicklinks flex gap-2 overflow-x-auto pb-2 pl-1 pr-1"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        {Object.entries(TAG_MAP).map(([tag, targetPage]) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => navigate(targetPage)}
                            className={cn(
                              'shrink-0 snap-start rounded-full border px-3 py-1.5 text-[10px] font-bold whitespace-nowrap shadow-sm transition hover:brightness-110 active:scale-[0.98]',
                              isDark
                                ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                                : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-100'
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <main className="px-4 pb-4 md:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={page}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ErrorBoundary key={page} variant="inline" fallbackTitle="This tool hit an error">
                      <AppPageContent page={page} />
                    </ErrorBoundary>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[
                    {
                      icon: '🏦',
                      tip: 'Banks never ask for OTPs, PINs, or card numbers via email, SMS, or phone calls.',
                    },
                    {
                      icon: '🔗',
                      tip: 'Before clicking any link, hover over it to check the real URL in your status bar.',
                    },
                    {
                      icon: '🚨',
                      tip: 'Call 1930 to report cybercrime in India. Visit cybercrime.gov.in for online reporting.',
                    },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex gap-3 rounded-2xl border p-4',
                        isDark
                          ? 'border-white/10 bg-black/30'
                          : 'border-gray-200 bg-white shadow-sm'
                      )}
                    >
                      <span className="flex-shrink-0 text-xl">{t.icon}</span>
                      <div>
                        <p className="mb-1 text-xs font-bold text-blue-500">Security tip #{i + 1}</p>
                        <p className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>{t.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav current={page} onNav={(id) => navigate(id as Page)} theme={theme} />
    </div>
  );
}

function NavItem({
  item,
  active,
  onClick,
  theme,
}: {
  item: (typeof ALL_NAV)[0];
  active: boolean;
  onClick: () => void;
  theme: Theme;
}) {
  const Icon = item.icon;
  const isLight = theme === 'light';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all duration-150 ${
        active
          ? isLight
            ? `bg-gray-200 text-gray-900 ${item.color}`
            : `bg-white/10 text-white ${item.color}`
          : isLight
            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${active ? item.color : isLight ? 'text-gray-500 group-hover:text-gray-800' : 'text-gray-500 group-hover:text-gray-200'}`}
      />
      <span className="min-w-0 flex-1 truncate leading-none">{item.label}</span>
      {item.badge && (
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
            item.badge === 'LIVE'
              ? 'animate-pulse bg-red-600 text-white'
              : item.badge === 'HOT'
                ? 'bg-orange-500 text-white'
                : 'bg-blue-600 text-white'
          }`}
        >
          {item.badge}
        </span>
      )}
      {active && <ChevronRight className={`h-3 w-3 shrink-0 ${item.color}`} />}
    </button>
  );
}
