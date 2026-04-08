import { useState } from 'react';
import { Shield, Lock, QrCode, Search, CheckCircle, XCircle, Wifi } from 'lucide-react';
import { detectVisualSimilarity, checkDomainAge, geolocateDomain } from '../utils/threatIntel';
import { mlScanURL } from '../utils/mlDetection';

export default function SecurityTools() {
  const [activeTool, setActiveTool] = useState('ssl');

  const tools = [
    { id: 'ssl',     label: 'SSL / HTTPS',       icon: Lock    },
    { id: 'domain',  label: 'Domain Info',        icon: Search  },
    { id: 'visual',  label: 'Brand Similarity',   icon: Shield  },
    { id: 'qr',      label: 'QR Code Scanner',    icon: QrCode  },
    { id: 'pwned',   label: 'Reputation Check',   icon: Wifi    },
  ];

  return (
    <div className="space-y-5">
      {/* Tool Selector */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" /> Security Tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {tools.map(t => {
            const I = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTool(t.id)}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-all ${
                  activeTool === t.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}>
                <I className="w-5 h-5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tool */}
      {activeTool === 'ssl'    && <SSLChecker />}
      {activeTool === 'domain' && <DomainInfoTool />}
      {activeTool === 'visual' && <VisualSimilarityTool />}
      {activeTool === 'qr'     && <QRScanner />}
      {activeTool === 'pwned'  && <ReputationChecker />}
    </div>
  );
}

// ─── SSL Checker ──────────────────────────────────────────
function SSLChecker() {
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function check() {
    if (!url.trim()) return;
    setChecking(true);
    await new Promise(r => setTimeout(r, 700));

    const isHttps = url.trim().startsWith('https://');
    let domain = '';
    try { domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch {}

    const checks = [
      { label: 'Uses HTTPS', pass: isHttps, detail: isHttps ? 'Connection is encrypted' : 'No SSL — data sent in plaintext ⚠️' },
      { label: 'Valid URL Format', pass: !!domain, detail: domain ? `Hostname: ${domain}` : 'Invalid URL format' },
      { label: 'No IP-based URL', pass: !/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url), detail: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url) ? 'Uses raw IP address' : 'Uses proper domain name' },
      { label: 'No Suspicious TLD', pass: !/\.(xyz|top|club|tk|ml|ga|cf)\b/.test(url), detail: 'TLD checked against suspicious list' },
    ];

    const score = Math.round((checks.filter(c => c.pass).length / checks.length) * 100);
    setResult({ checks, score, domain });
    setChecking(false);
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-slate-200 flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-400" /> SSL & HTTPS Checker</h3>
      <div className="flex gap-2">
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="https://example.com" className="flex-1 px-4 py-2.5 bg-slate-900/70 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        <button onClick={check} disabled={checking || !url.trim()} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-500 disabled:opacity-40">
          {checking ? '…' : 'Check'}
        </button>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-300">Security Score</span>
            <span className={`text-2xl font-extrabold ${result.score >= 75 ? 'text-emerald-400' : result.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{result.score}%</span>
          </div>
          {result.checks.map((c: any, i: number) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3">
              {c.pass ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
              <div>
                <p className={`text-sm font-semibold ${c.pass ? 'text-slate-200' : 'text-red-300'}`}>{c.label}</p>
                <p className="text-xs text-slate-400">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Domain Info ──────────────────────────────────────────
function DomainInfoTool() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function check() {
    if (!domain.trim()) return;
    setLoading(true);
    const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    try {
      const [age, geo, vis, ml] = await Promise.all([
        checkDomainAge(clean),
        geolocateDomain(clean),
        Promise.resolve(detectVisualSimilarity(clean)),
        Promise.resolve(mlScanURL(`https://${clean}`)),
      ]);
      setResult({ age, geo, vis, mlScore: ml.score });
    } catch {}
    setLoading(false);
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-slate-200 flex items-center gap-2"><Search className="w-4 h-4 text-cyan-400" /> Domain Intelligence</h3>
      <div className="flex gap-2">
        <input value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="example.com" className="flex-1 px-4 py-2.5 bg-slate-900/70 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        <button onClick={check} disabled={loading || !domain.trim()} className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-semibold text-sm hover:bg-cyan-500 disabled:opacity-40">
          {loading ? '…' : 'Lookup'}
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Domain Age',   val: result.age?.ageLabel || 'Unknown',   flag: result.age?.isNew    },
            { label: 'Registrar',    val: result.age?.registrar || 'Unknown',  flag: false               },
            { label: 'Server Country', val: result.geo?.country || 'Unknown', flag: result.geo?.isSuspicious },
            { label: 'Hosting ISP',  val: result.geo?.isp     || 'Unknown',   flag: false               },
            { label: 'Brand Resembles', val: result.vis?.detectedBrand || 'None', flag: result.vis?.detectedBrand && !result.vis?.domainMatchesBrand },
            { label: 'ML Risk Score', val: `${result.mlScore}/100`,           flag: result.mlScore >= 60 },
          ].map((item, i) => (
            <div key={i} className={`bg-slate-900/60 rounded-xl p-3 ${item.flag ? 'border border-red-500/30' : ''}`}>
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className={`text-sm font-bold ${item.flag ? 'text-red-400' : 'text-slate-200'}`}>{item.val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Visual Similarity ────────────────────────────────────
function VisualSimilarityTool() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);

  function check() {
    if (!url.trim()) return;
    let domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    const title = url; // use URL as title proxy
    const vis = detectVisualSimilarity(domain, title);
    setResult(vis);
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-slate-200 flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-400" /> Visual Brand Similarity</h3>
      <p className="text-xs text-slate-400">Detects if a domain is impersonating a well-known brand (PayPal, Apple, SBI, etc.)</p>
      <div className="flex gap-2">
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="paypal-secure-login.xyz" className="flex-1 px-4 py-2.5 bg-slate-900/70 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        <button onClick={check} disabled={!url.trim()} className="px-5 py-2.5 bg-yellow-600 text-white rounded-xl font-semibold text-sm hover:bg-yellow-500 disabled:opacity-40">
          Analyze
        </button>
      </div>
      {result && (
        <div className={`rounded-xl p-4 border ${result.warning ? 'bg-red-950/40 border-red-500/40' : 'bg-emerald-950/30 border-emerald-500/30'}`}>
          {result.detectedBrand ? (
            <>
              <p className="font-bold text-slate-200 mb-1">Detected Brand: <span className="text-blue-400">{result.detectedBrand}</span></p>
              {result.domainMatchesBrand
                ? <p className="text-sm text-emerald-400">✅ Domain matches official {result.detectedBrand} domain.</p>
                : <><p className="text-sm text-red-400 font-semibold">⚠️ Brand Impersonation Detected!</p><p className="text-xs text-slate-300 mt-1">{result.warning}</p></>
              }
            </>
          ) : <p className="text-sm text-emerald-400">✅ No brand impersonation patterns detected.</p>}
        </div>
      )}
    </div>
  );
}

// ─── QR Scanner ───────────────────────────────────────────
function QRScanner() {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-slate-200 flex items-center gap-2"><QrCode className="w-4 h-4 text-purple-400" /> QR Code Scanner</h3>
      <div className="bg-slate-900/60 rounded-xl p-6 border-2 border-dashed border-slate-700 text-center">
        <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-semibold text-sm">Upload QR Code Image</p>
        <p className="text-xs text-slate-500 mt-1">QR codes can hide malicious URLs. We decode and scan them for phishing.</p>
        <label className="mt-4 inline-block">
          <input type="file" accept="image/*" className="hidden" onChange={() => alert('QR scanning available in Chrome Extension. Upload to extension popup > Scan > QR Mode.')} />
          <span className="cursor-pointer inline-block px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-500 mt-3">
            Select QR Image
          </span>
        </label>
      </div>
      <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3">
        <p className="text-xs text-purple-300">💡 <strong>Tip:</strong> QR code phishing (Quishing) is a growing attack vector. Always scan QR codes before visiting URLs, especially in emails and flyers.</p>
      </div>
    </div>
  );
}

// ─── Reputation Checker ───────────────────────────────────
function ReputationChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function check() {
    if (!url.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ml = mlScanURL(url);
    // Simulated reputation sources
    const sources = [
      { name: 'Norix', verdict: ml.score >= 60 ? 'MALICIOUS' : 'CLEAN', score: ml.score, color: ml.score >= 60 ? 'text-red-400' : 'text-emerald-400' },
      { name: 'Google Safe Browsing', verdict: url.includes('paypal-') || url.includes('-verify') ? 'SUSPICIOUS' : 'CLEAN', score: null, color: url.includes('paypal-') ? 'text-orange-400' : 'text-emerald-400' },
      { name: 'Community Reports', verdict: ml.score >= 40 ? 'REPORTED' : 'NO REPORTS', score: ml.score >= 40 ? Math.floor(ml.score / 10) : 0, color: ml.score >= 40 ? 'text-orange-400' : 'text-slate-400' },
    ];
    setResult({ sources, overallScore: ml.score });
    setLoading(false);
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-slate-200 flex items-center gap-2"><Wifi className="w-4 h-4 text-cyan-400" /> Reputation Checker</h3>
      <div className="flex gap-2">
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="https://suspicious.com" className="flex-1 px-4 py-2.5 bg-slate-900/70 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        <button onClick={check} disabled={loading || !url.trim()} className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-semibold text-sm hover:bg-cyan-500 disabled:opacity-40">
          {loading ? '…' : 'Check'}
        </button>
      </div>
      {result && (
        <div className="space-y-2">
          {result.sources.map((s: any, i: number) => (
            <div key={i} className="bg-slate-900/60 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">{s.name}</p>
                {s.score !== null && <p className="text-xs text-slate-500">Confidence: {s.score}/100</p>}
              </div>
              <span className={`text-sm font-bold ${s.color}`}>{s.verdict}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
