// Feature 5: Real-Time Threat Feed + Feature 8: Global Threat Heatmap
import { useState, useEffect, useRef } from 'react';
import { Radio, Globe, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';

// Simulated live threat feed (would connect to Supabase Realtime)
const FEED_TEMPLATES = [
  { type: 'url',     country: 'Russia',   domain: 'paypal-secure-login.xyz',   method: 'Brand Impersonation' },
  { type: 'email',   country: 'Nigeria',  domain: 'lottery-winner-2024.com',   method: 'Lottery Scam'        },
  { type: 'sms',     country: 'Pakistan', domain: 'sbi-kyc-update.net',        method: 'KYC Fraud'           },
  { type: 'url',     country: 'China',    domain: 'amazon-prize-india.top',    method: 'Prize Scam'          },
  { type: 'phone',   country: 'Romania',  domain: 'ICICI Bank Spoofing',       method: 'Vishing'             },
  { type: 'email',   country: 'Ukraine',  domain: 'microsoft-alert.ru',        method: 'Tech Support Scam'   },
  { type: 'url',     country: 'Brazil',   domain: 'hdfc-kyc-update.xyz',       method: 'Banking Phishing'    },
  { type: 'sms',     country: 'Indonesia',domain: 'RBI-reward-2024.ml',        method: 'Impersonation'       },
  { type: 'url',     country: 'Cameroon', domain: 'netflix-free-trial.ga',     method: 'Credential Theft'    },
  { type: 'phone',   country: 'Russia',   domain: 'Income Tax Scam Call',      method: 'Government Fraud'    },
];

const COUNTRY_POSITIONS: Record<string, [number, number]> = {
  'Russia':   [62, 30], 'Nigeria':    [48, 52], 'China':   [73, 38],
  'Pakistan': [62, 43], 'Romania':    [50, 35], 'Brazil':  [30, 60],
  'Ukraine':  [52, 32], 'Indonesia':  [77, 54], 'Cameroon':[48, 52],
};

const TYPE_ICON: Record<string, string> = { url: '🔗', email: '✉️', sms: '📱', phone: '📞' };

function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function generateEvent() {
  const t = randItem(FEED_TEMPLATES);
  return { ...t, id: Math.random().toString(36).slice(2), ts: new Date(), score: Math.floor(Math.random() * 40 + 60) };
}

// SVG World Map (simplified)
function WorldMapDots({ attacks }: { attacks: typeof COUNTRY_POSITIONS }) {
  return (
    <svg viewBox="0 0 200 110" className="w-full h-40 md:h-52">
      {/* Continents approximation using simplified ellipses */}
      <g opacity="0.25" fill="#334155">
        <ellipse cx="27" cy="45" rx="18" ry="18" /> {/* North America */}
        <ellipse cx="30" cy="65" rx="12" ry="15" /> {/* South America */}
        <ellipse cx="50" cy="40" rx="12" ry="18" /> {/* Europe */}
        <ellipse cx="55" cy="58" rx="18" ry="16" /> {/* Africa */}
        <ellipse cx="70" cy="42" rx="20" ry="18" /> {/* Asia */}
        <ellipse cx="83" cy="60" rx="10" ry="10" /> {/* SE Asia */}
        <ellipse cx="90" cy="68" rx="12" ry="8"  /> {/* Australia */}
      </g>
      {/* Attack origin dots */}
      {Object.entries(attacks).map(([country, [x, y]]) => (
        <g key={country}>
          <circle cx={x} cy={y} r="3.5" fill="#ef4444" opacity="0.7">
            <animate attributeName="r" values="3.5;6;3.5" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={x} cy={y} r="2" fill="#ef4444" />
        </g>
      ))}
      {/* Target: India */}
      <circle cx="65" cy="47" r="4" fill="#3b82f6" opacity="0.8">
        <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="65" cy="47" r="2" fill="#60a5fa" />
      <text x="65" y="44" textAnchor="middle" fill="#93c5fd" fontSize="3" fontWeight="bold">🇮🇳 India</text>
      {/* Attack lines from origins to India */}
      {Object.entries(attacks).map(([country, [x, y]]) => (
        <line key={`line-${country}`} x1={x} y1={y} x2="65" y2="47" stroke="#ef444430" strokeWidth="0.5" strokeDasharray="3,3" />
      ))}
    </svg>
  );
}

export default function ThreatFeed() {
  const [events, setEvents] = useState(() => Array.from({ length: 8 }, generateEvent));
  const [paused, setPaused] = useState(false);
  const [view, setView] = useState<'feed' | 'map'>('feed');
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (paused) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setEvents(ev => [generateEvent(), ...ev.slice(0, 19)]);
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const urlCount   = events.filter(e => e.type === 'url').length;
  const emailCount = events.filter(e => e.type === 'email').length;
  const smsCount   = events.filter(e => e.type === 'sms').length;

  return (
    <div className="space-y-5">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Threat Intelligence Feed</h2>
              <div className="flex items-center gap-2">
                {!paused && <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />}
                <p className="text-xs text-slate-400">{paused ? 'Paused' : 'Live — updating every 3 seconds'}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView(v => v === 'feed' ? 'map' : 'feed')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700">
              {view === 'feed' ? <><Globe className="w-3.5 h-3.5" /> Map</> : <><Radio className="w-3.5 h-3.5" /> Feed</>}
            </button>
            <button onClick={() => setPaused(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${paused ? 'bg-emerald-700/40 border-emerald-600/40 text-emerald-400' : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700'}`}>
              {paused ? <><RefreshCw className="w-3.5 h-3.5" /> Resume</> : '⏸ Pause'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[['🔗 URLs', urlCount, 'text-red-400'], ['✉️ Emails', emailCount, 'text-orange-400'], ['📱 SMS', smsCount, 'text-yellow-400']].map(([l, v, c]) => (
            <div key={l as string} className="bg-slate-900/60 rounded-xl p-3 text-center">
              <p className={`text-xl font-extrabold ${c}`}>{v}</p>
              <p className="text-xs text-slate-400">{l}</p>
            </div>
          ))}
        </div>

        {view === 'map' ? (
          <div>
            <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-red-400" /> Attack origins targeting India (live)
            </p>
            <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/50">
              <WorldMapDots attacks={COUNTRY_POSITIONS} />
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /> Attack Origin</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400"><div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" /> Target: India</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {events.map((e, i) => (
              <div key={e.id} className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${i === 0 && !paused ? 'bg-red-950/30 border-red-500/30 animate-count' : 'bg-slate-900/50 border-slate-700/30'}`}>
                <span className="text-lg flex-shrink-0">{TYPE_ICON[e.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{e.domain}</p>
                  <p className="text-xs text-slate-500">{e.method} · from {e.country}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">Score: {e.score}</span>
                  <span className="text-xs text-slate-500">{e.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
