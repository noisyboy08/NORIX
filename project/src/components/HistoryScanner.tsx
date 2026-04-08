import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Shield, Trash2 } from 'lucide-react';
import { mlScanURL } from '../utils/mlDetection';

interface HistoryEntry {
  url: string;
  title: string;
  visitTime: number;
  score: number;
  riskLevel: string;
}

function riskLevel(score: number) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'safe';
}

const BADGE: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
  high:     'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  medium:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  low:      'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  safe:     'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
};

// Simulated history when Chrome history API isn't available (web app view)
const DEMO_HISTORY: HistoryEntry[] = [
  { url: 'http://paypal-login-verify.com/account', title: 'PayPal Login -- Verify', visitTime: Date.now() - 3600000, score: 87, riskLevel: 'critical' },
  { url: 'https://bit.ly/scam-link-123', title: 'Redirect Page', visitTime: Date.now() - 7200000, score: 65, riskLevel: 'high' },
  { url: 'http://sbi-kyc-update.xyz/verify', title: 'SBI KYC Update', visitTime: Date.now() - 14400000, score: 91, riskLevel: 'critical' },
  { url: 'https://www.google.com', title: 'Google', visitTime: Date.now() - 18000000, score: 0, riskLevel: 'safe' },
  { url: 'https://192.168.1.1/login', title: 'Router Login', visitTime: Date.now() - 21600000, score: 45, riskLevel: 'medium' },
  { url: 'https://www.amazon.in', title: 'Amazon India', visitTime: Date.now() - 25200000, score: 0, riskLevel: 'safe' },
  { url: 'https://secure-banking-login.net', title: 'Secure Banking', visitTime: Date.now() - 28800000, score: 72, riskLevel: 'high' },
  { url: 'https://github.com', title: 'GitHub', visitTime: Date.now() - 32400000, score: 0, riskLevel: 'safe' },
];

export default function HistoryScanner() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'threats'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      // In extension context: chrome.history API. In web app: use demo data.
      // Extension popup links to this for full analysis
      await new Promise(r => setTimeout(r, 800));
      // Score demo URLs with ML model
      const scored = DEMO_HISTORY.map(h => {
        const ml = mlScanURL(h.url);
        return { ...h, score: ml.score, riskLevel: riskLevel(ml.score) };
      }).sort((a, b) => b.score - a.score);
      setHistory(scored);
    } catch {
      setHistory(DEMO_HISTORY);
    }
    setLoading(false);
  }

  const displayed = filter === 'threats' ? history.filter(h => h.score >= 40) : history;
  const threatCount = history.filter(h => h.score >= 60).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Browse History Analysis</h2>
              <p className="text-xs text-slate-400">AI scans your recent visited URLs for threats</p>
            </div>
          </div>
          {threatCount > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold px-3 py-1.5 rounded-full">
              ⚠️ {threatCount} threats found
            </div>
          )}
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pages Scanned', val: history.length, color: 'text-blue-400' },
            { label: 'Threats Found',  val: threatCount,           color: 'text-red-400'    },
            { label: 'Safe Pages',    val: history.filter(h => h.score < 20).length, color: 'text-emerald-400' },
          ].map(c => (
            <div key={c.label} className="bg-slate-900/60 rounded-xl p-3 text-center">
              <p className={`text-2xl font-extrabold ${c.color}`}>{c.val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'threats'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white'}`}>
            {f === 'all' ? `All Pages (${history.length})` : `Threats Only (${threatCount})`}
          </button>
        ))}
        <button onClick={loadHistory} className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white transition-all">
          ↻ Rescan
        </button>
      </div>

      {/* History List */}
      <div className="space-y-2">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />)
        ) : displayed.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-10 text-center">
            <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold">All Clear!</p>
            <p className="text-slate-500 text-sm">No threats detected in your recent browsing history.</p>
          </div>
        ) : displayed.map((entry, i) => (
          <div key={i} className={`bg-slate-800/50 border rounded-xl p-4 flex items-center gap-4 ${entry.score >= 60 ? 'border-red-500/30' : 'border-slate-700/50'}`}>
            {entry.score >= 60
              ? <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              : <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{entry.title || 'Untitled'}</p>
              <p className="text-xs text-slate-500 font-mono truncate">{entry.url}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {new Date(entry.visitTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${BADGE[entry.riskLevel]}`}>
                {entry.riskLevel}
              </span>
              <span className={`text-sm font-extrabold ${entry.score >= 60 ? 'text-red-400' : entry.score >= 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {entry.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Extension Note */}
      <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs text-blue-300 font-semibold mb-1">📌 Real History Scanning</p>
        <p className="text-xs text-slate-400">The Chrome Extension scans your actual browsing history using the <code className="text-blue-400">chrome.history</code> API. Install the extension and click "Open Dashboard" to see real data from your browser.</p>
      </div>
    </div>
  );
}
