import { useState } from 'react';
import {
  Upload, Link2, Download, AlertTriangle, CheckCircle, XCircle,
  FileText, Trash2, Play, BarChart2
} from 'lucide-react';
import { mlScanURL } from '../utils/mlDetection';
import { detectVisualSimilarity } from '../utils/threatIntel';

interface BulkResult {
  url: string;
  score: number;
  level: string;
  indicators: string[];
  brand: string | null;
}

function riskLevel(s: number) {
  if (s >= 80) return 'critical';
  if (s >= 60) return 'high';
  if (s >= 40) return 'medium';
  if (s >= 20) return 'low';
  return 'safe';
}

const LEVEL_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  low:      'text-blue-400 bg-blue-500/10 border-blue-500/30',
  safe:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const DEMO_URLS = `https://www.google.com
http://paypal-login-verify.com/account?user=confirm
https://bit.ly/win-iphone-13
http://sbi-kyc-update.xyz/verify
https://github.com
http://192.168.1.1/admin
https://amazon.in/deals
http://microsoft-alert-secure.net/warn`;

export default function BulkScanner() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<BulkResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  async function scan() {
    const urls = input.split('\n').map(u => u.trim()).filter(u => u.length > 3 && u.includes('.'));
    if (!urls.length) return;
    setScanning(true);
    setResults([]);

    const out: BulkResult[] = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const ml = mlScanURL(url);
      let domain = '';
      try { domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch {}
      const vis = domain ? detectVisualSimilarity(domain) : { detectedBrand: null };

      out.push({
        url,
        score: ml.score,
        level: riskLevel(ml.score),
        indicators: ml.features.filter(f => f.triggered).map(f => f.name),
        brand: vis.detectedBrand && !detectVisualSimilarity(domain).domainMatchesBrand ? vis.detectedBrand : null,
      });
      setProgress(Math.round(((i + 1) / urls.length) * 100));
      await new Promise(r => setTimeout(r, 50)); // throttle visually
    }
    setResults(out);
    setScanning(false);
    setProgress(0);
  }

  function exportCSV() {
    const rows = [['URL', 'Risk Score', 'Risk Level', 'Indicators', 'Brand Impersonation']];
    results.forEach(r => rows.push([r.url, String(r.score), r.level, r.indicators.join('; '), r.brand || '']));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `norix-bulk-scan-${Date.now()}.csv`;
    a.click();
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `norix-bulk-scan-${Date.now()}.json`;
    a.click();
  }

  const threats = results.filter(r => r.score >= 60);
  const suspicious = results.filter(r => r.score >= 40 && r.score < 60);

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Bulk URL Scanner</h2>
            <p className="text-xs text-slate-400">Scan up to 100 URLs at once — instant AI analysis</p>
          </div>
        </div>

        <textarea value={input} onChange={e => setInput(e.target.value)} rows={7}
          placeholder="Paste URLs one per line:&#10;https://example.com&#10;http://suspicious-site.xyz"
          className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm font-mono mb-3" />

        <div className="flex gap-2">
          <button onClick={scan} disabled={scanning || !input.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 text-sm shadow-lg shadow-indigo-900/30">
            <Play className="w-4 h-4" />
            {scanning ? `Scanning… ${progress}%` : 'Start Bulk Scan'}
          </button>
          <button onClick={() => setInput(DEMO_URLS)}
            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700">
            Load Demo
          </button>
          <button onClick={() => { setInput(''); setResults([]); }}
            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {scanning && (
          <div className="mt-3">
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1">{progress}% — scanning URLs...</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Scanned', val: results.length,   color: 'text-slate-200' },
              { label: 'Threats',       val: threats.length,   color: 'text-red-400'    },
              { label: 'Suspicious',    val: suspicious.length, color: 'text-yellow-400'},
              { label: 'Safe',          val: results.filter(r => r.score < 20).length, color: 'text-emerald-400' },
            ].map(c => (
              <div key={c.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
                <p className={`text-2xl font-extrabold ${c.color}`}>{c.val}</p>
                <p className="text-xs text-slate-400 mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Export */}
          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700/40 border border-emerald-600/40 text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-700/60">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={exportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700/40 border border-blue-600/40 text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-700/60">
              <FileText className="w-4 h-4" /> Export JSON
            </button>
          </div>

          {/* Results Table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700/50">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-slate-200 text-sm">Scan Results</h3>
            </div>
            <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
              {results.sort((a, b) => b.score - a.score).map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-700/20">
                  {r.score >= 60
                    ? <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    : r.score >= 40
                    ? <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    : <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  <span className="flex-1 font-mono text-xs text-slate-300 truncate">{r.url}</span>
                  {r.brand && (
                    <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 flex-shrink-0">
                      ⚠️ {r.brand}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-bold flex-shrink-0 capitalize ${LEVEL_COLOR[r.level]}`}>
                    {r.level}
                  </span>
                  <span className={`text-sm font-extrabold flex-shrink-0 ml-1 ${r.score >= 60 ? 'text-red-400' : r.score >= 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {r.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
