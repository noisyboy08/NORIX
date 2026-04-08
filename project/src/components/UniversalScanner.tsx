import { useState, useEffect } from 'react';
import {
  Globe, Mail, Phone, MessageSquare, Zap, CheckCircle,
  XCircle, AlertTriangle, Lightbulb, Flag, ChevronDown, Brain, Clock, Server, Eye
} from 'lucide-react';
import { analyzePhishingWithFallback, submitReport } from '../utils/api';
import { checkDomainAge, geolocateDomain, detectVisualSimilarity } from '../utils/threatIntel';
import { ExplainLikeIm5Toggle } from './EnterpriseFeatures';

type ScanType = 'url' | 'email' | 'message' | 'phone';

const DEMOS: Record<ScanType, string> = {
  url: 'http://paypal-login-security-update.com/verify?user=confirm',
  email: 'URGENT: Your PayPal account has been suspended!\n\nDear Customer,\nUnusual activity was detected. Click here to verify immediately or your account will be permanently locked.\n\nhttp://paypal-secure-update.net/confirm\n\nPayPal Security Team',
  message: 'Dear customer, your SBI KYC is pending. Share your Aadhaar OTP to verify or your bank account will be blocked. Reply NOW to 9876543210.',
  phone: '+91-9988001122 called claiming to be from RBI. Said my account has suspicious transactions. Asked for my card number and OTP to "unblock" it.',
};

const TYPE_CONFIG = {
  url:     { label: 'Website / URL',       icon: Globe,         placeholder: 'https://suspicious-site.com',       multi: false },
  email:   { label: 'Email',               icon: Mail,          placeholder: 'Paste full email content...',         multi: true  },
  message: { label: 'SMS / WhatsApp',      icon: MessageSquare, placeholder: 'Paste your SMS or message here...', multi: true  },
  phone:   { label: 'Phone Number / Call', icon: Phone,         placeholder: '+91-XXXXXXXXXX or describe the call...', multi: true },
};

function riskColor(s: number) {
  if (s >= 80) return 'text-red-400';
  if (s >= 60) return 'text-orange-400';
  if (s >= 40) return 'text-yellow-400';
  if (s >= 20) return 'text-blue-400';
  return 'text-emerald-400';
}
function riskBg(s: number) {
  if (s >= 80) return 'bg-red-950/40 border-red-500/40';
  if (s >= 60) return 'bg-orange-950/40 border-orange-500/40';
  if (s >= 40) return 'bg-yellow-950/40 border-yellow-500/40';
  if (s >= 20) return 'bg-blue-950/40 border-blue-500/40';
  return 'bg-emerald-950/40 border-emerald-500/40';
}
function riskBarColor(s: number) {
  if (s >= 80) return 'from-red-600 to-red-400';
  if (s >= 60) return 'from-orange-600 to-orange-400';
  if (s >= 40) return 'from-yellow-600 to-yellow-400';
  if (s >= 20) return 'from-blue-600 to-blue-400';
  return 'from-emerald-600 to-emerald-400';
}
function riskLabel(s: number) {
  if (s >= 80) return 'Critical Risk';
  if (s >= 60) return 'High Risk — Phishing Detected';
  if (s >= 40) return 'Medium Risk — Suspicious';
  if (s >= 20) return 'Low Risk';
  return 'Safe';
}

interface ScanResult {
  score: number;
  indicators: any[];
  domainAge?: any;
  geo?: any;
  visual?: any;
  mlScore?: number;
  mlFeatures?: any[];
  analysisSource?: 'cloud' | 'local';
}

export default function UniversalScanner() {
  const [scanType, setScanType] = useState<ScanType>('url');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [eli5, setEli5] = useState(false);

  const cfg = TYPE_CONFIG[scanType];
  const Icon = cfg.icon;

  function toggleExpand(key: string) {
    setExpanded(e => e.includes(key) ? e.filter(x => x !== key) : [...e, key]);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const textParam = params.get('text');
    const urlParam = params.get('url');
    
    if (textParam) {
      setScanType('message');
      setInput(textParam);
      setTimeout(() => performScan('message', textParam), 300);
    } else if (urlParam) {
      setScanType('url');
      setInput(urlParam);
      setTimeout(() => performScan('url', urlParam), 300);
    }
  }, []);

  async function handleScan() {
    performScan(scanType, input);
  }

  async function performScan(currentType: ScanType, currentInput: string) {
    if (!currentInput.trim()) return;
    setLoading(true);
    setResult(null);
    setExpanded([]);

    try {
      let domainAge = null, geo = null, visual = null;

      setPhase('⚡ Heuristic + intelligence pass...');
      await new Promise(r => setTimeout(r, 150));

      const urlArg = currentType === 'url' ? currentInput : '';
      const contentArg = currentType !== 'url' ? currentInput : '';
      const apiType =
        currentType === 'url' ? 'url' :
        currentType === 'email' ? 'email' :
        currentType === 'phone' ? 'phone' : 'message';

      setPhase('🧠 Analysis (cloud or local)...');
      const { result: api, ml, source } = await analyzePhishingWithFallback(urlArg, contentArg, apiType);

      let score = api.riskScore;
      const indicators: any[] = (api.threatIndicators || []).map((i: any) => ({
        rule: i.rule,
        weight: i.weight ?? 0,
        description: i.description ?? '',
      }));

      let domainBonus = 0;
      if (currentType === 'url') {
        setPhase('🔍 Domain age & brand signals...');
        let domain = '';
        try {
          domain = new URL(currentInput.startsWith('http') ? currentInput : `https://${currentInput}`).hostname;
        } catch { /* ignore */ }

        if (domain) {
          const [age, geoData, vis] = await Promise.all([
            checkDomainAge(domain),
            geolocateDomain(domain),
            Promise.resolve(detectVisualSimilarity(domain)),
          ]);
          domainAge = age;
          geo = geoData;
          visual = vis;

          if (age.isSuspicious) {
            domainBonus += 14;
            indicators.push({
              rule: 'New domain (< 7 days)',
              weight: 14,
              description: `Registered ${age.ageLabel}. New domains are common in phishing; verify through official channels.`,
            });
          } else if (age.isNew) {
            domainBonus += 7;
            indicators.push({
              rule: 'Recently registered domain',
              weight: 7,
              description: `Registered ${age.ageLabel}. Exercise caution with sensitive actions.`,
            });
          }
          if (visual && !visual.domainMatchesBrand && visual.warning) {
            domainBonus += 18;
            indicators.push({
              rule: `Possible brand impersonation: ${visual.detectedBrand}`,
              weight: 18,
              description: visual.warning,
            });
          }
        }
      }

      score = Math.min(100, Math.round(score + domainBonus));
      if (geo && currentType === 'url') {
        indicators.push({
          rule: `Hosting location: ${geo.country}`,
          weight: 0,
          description: `ISP: ${geo.isp}. Geography alone does not prove malicious intent; use with other signals.`,
        });
      }

      const mlFeatures = ml.features.filter((f) => f.triggered);

      setResult({
        score,
        indicators,
        domainAge,
        geo,
        visual,
        mlScore: ml.score,
        mlFeatures,
        analysisSource: source,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setPhase('');
    }
  }

  async function handleReport() {
    try {
      await submitReport(input, scanType, result ? (result.score >= 60 ? 'high' : 'medium') : 'medium', reportText);
      alert('✅ Report submitted! Thank you for helping the community.');
      setShowReport(false); setReportText('');
    } catch { alert('Failed to submit.'); }
  }

  return (
    <div className="space-y-6">
      {/* Scanner Card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Universal Threat Scanner</h2>
            <p className="text-xs text-slate-400">AI + Domain Intelligence + Visual Similarity Detection</p>
          </div>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {(Object.keys(TYPE_CONFIG) as ScanType[]).map(t => {
            const I = TYPE_CONFIG[t].icon;
            return (
              <button key={t} onClick={() => { setScanType(t); setResult(null); setInput(''); }}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border text-sm font-semibold transition-all ${
                  scanType === t
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}>
                <I className="w-5 h-5" />
                <span className="text-xs">{TYPE_CONFIG[t].label}</span>
              </button>
            );
          })}
        </div>

        {/* Input */}
        {cfg.multi ? (
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={5} placeholder={cfg.placeholder}
            className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-sm mb-3" />
        ) : (
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={cfg.placeholder}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm mb-3" />
        )}

        <div className="flex gap-2">
          <button onClick={handleScan} disabled={loading || !input.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30 text-sm">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{phase || 'Scanning...'}</>
            ) : (
              <><Zap className="w-4 h-4" />Scan Now</>
            )}
          </button>
          <button onClick={() => setInput(DEMOS[scanType])}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all">
            Demo
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-2xl border-2 p-6 space-y-5 transition-all ${riskBg(result.score)} ${result.score >= 80 ? 'risk-critical-glow' : ''}`}>
          {/* Score Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {result.score >= 60
                ? <XCircle className="w-10 h-10 text-red-400 flex-shrink-0" />
                : <CheckCircle className="w-10 h-10 text-emerald-400 flex-shrink-0" />}
              <div>
                <h3 className={`text-xl font-bold ${riskColor(result.score)}`}>{riskLabel(result.score)}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {result.score >= 60 ? '⚠️ Do NOT share credentials or personal info!' : '✅ No critical threats detected'}
                  {result.analysisSource === 'local' && (
                    <span className="mt-1 block text-amber-400/90">
                      Local heuristics only — not 100% accurate; configure Supabase for server-side checks.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className={`text-5xl font-extrabold ${riskColor(result.score)}`}>{result.score}</div>
          </div>

          {/* Score Bar */}
          <div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${riskBarColor(result.score)} transition-all duration-1000`}
                style={{ width: `${result.score}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              {['Safe', 'Low', 'Medium', 'High', 'Critical'].map(l => <span key={l}>{l}</span>)}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 rounded-xl p-3 text-center">
              <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">ML Score</p>
              <p className={`text-lg font-bold ${riskColor(result.mlScore || 0)}`}>{result.mlScore}</p>
            </div>
            {result.domainAge && (
              <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Domain Age</p>
                <p className={`text-xs font-bold ${result.domainAge.isNew ? 'text-red-400' : 'text-emerald-400'}`}>{result.domainAge.ageLabel}</p>
              </div>
            )}
            {result.geo && (
              <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                <Server className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Hosted In</p>
                <p className={`text-sm font-bold ${result.geo.isSuspicious ? 'text-red-400' : 'text-slate-300'}`}>{result.geo.country}</p>
              </div>
            )}
            {result.visual?.detectedBrand && (
              <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                <Eye className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Brand Similarity</p>
                <p className={`text-sm font-bold ${result.visual.domainMatchesBrand ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.visual.detectedBrand} {result.visual.domainMatchesBrand ? '✓' : '✗'}
                </p>
              </div>
            )}
          </div>

          {/* Threat Indicators */}
          {result.indicators.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => toggleExpand('indicators')}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Threat Indicators ({result.indicators.length})
                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded.includes('indicators') ? 'rotate-180' : ''}`} />
                </button>
                <ExplainLikeIm5Toggle active={eli5} onToggle={() => setEli5(!eli5)} />
              </div>
              {(expanded.includes('indicators') ? result.indicators : result.indicators.slice(0, 3)).map((ind, i) => (
                <div key={i} className="bg-slate-900/60 border-l-4 border-red-500 rounded-r-xl px-4 py-3 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200 text-sm">{eli5 && ind.rule.includes('Domain') ? 'Brand New Website' : ind.rule}</span>
                    <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full font-bold">+{ind.weight}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {eli5 
                      ? (ind.description.includes('Domain ') ? "This site was just created. Real companies have old sites. Scammers make new sites every day to trick people." :
                         ind.description.includes('Hosting location') || ind.description.includes('hosted') ? "Where a server sits doesn't prove a site is bad — scammers and real companies both use global hosting." :
                         ind.description.includes('Visual Impersonation') ? "This website looks exactly like a famous brand, but it's actually a fake copycat trying to steal your password." :
                         ind.description.includes('keyword') ? "The link has words like 'secure' or 'login' which scammers use to make fake links look real." :
                         "This looks like something a bad guy would send you to trick you.") 
                      : ind.description}
                  </p>
                </div>
              ))}
              {!expanded.includes('indicators') && result.indicators.length > 3 && (
                <button onClick={() => toggleExpand('indicators')} className="text-xs text-blue-400 hover:text-blue-300">
                  +{result.indicators.length - 3} more indicators...
                </button>
              )}
            </div>
          )}

          {/* ML Features */}
          {result.mlFeatures && result.mlFeatures.length > 0 && (
            <div>
              <button onClick={() => toggleExpand('ml')}
                className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2 hover:text-white transition-colors">
                <Brain className="w-4 h-4 text-purple-400" />
                AI Model Analysis
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${expanded.includes('ml') ? 'rotate-180' : ''}`} />
              </button>
              {expanded.includes('ml') && (
                <div className="bg-slate-900/60 rounded-xl p-4 space-y-2">
                  {result.mlFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 flex-1">{f.name}</span>
                      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(f.weight / 30) * 100}%` }} />
                      </div>
                      <span className="text-xs text-purple-400 w-8 text-right">+{f.weight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Recommendation */}
          <div className="bg-blue-950/40 border border-blue-500/20 rounded-xl p-4">
            <div className="flex gap-2 mb-2"><Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-blue-300">AI Recommendation</p>
            </div>
            <p className="text-sm text-slate-300">
              {result.score >= 80 ? '🚨 DO NOT proceed. This is almost certainly a phishing attack. Delete, block, and report immediately.' :
               result.score >= 60 ? '⚠️ High risk detected. Do not click links, share credentials, OTPs, or personal info. Verify via official channels.' :
               result.score >= 40 ? '⚡ Exercise caution. Verify the sender/site before taking any action.' :
               '✅ This appears safe. Maintain standard security practices.'}
            </p>
          </div>

          {/* Report */}
          <div>
            <button onClick={() => setShowReport(!showReport)}
              className="flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              <Flag className="w-4 h-4" />Report to Community
              <ChevronDown className={`w-4 h-4 transition-transform ${showReport ? 'rotate-180' : ''}`} />
            </button>
            {showReport && (
              <div className="mt-3 space-y-2">
                <textarea value={reportText} onChange={e => setReportText(e.target.value)} rows={2}
                  placeholder="What is this threat trying to do?"
                  className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleReport} disabled={!reportText.trim()}
                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-500 disabled:opacity-40">Submit</button>
                  <button onClick={() => setShowReport(false)}
                    className="flex-1 bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-semibold hover:bg-slate-600">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
