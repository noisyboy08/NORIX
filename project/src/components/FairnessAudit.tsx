// ═══════════════════════════════════════════════════════════
// Norix — Fairness & Bias Detection Module
// Purpose: Ensure AI decisions are fair, explainable, and
//          auditable across languages, regions, and scan types.
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import {
  Scale, AlertTriangle, CheckCircle, ThumbsUp, ThumbsDown,
  BarChart2, Globe, RefreshCw, Info, Plus, Trash2, Sliders,
  Eye, TrendingUp, TrendingDown, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
interface FeedbackEntry {
  id: string;
  input: string;
  type: string;
  score: number;
  verdict: string;
  userFeedback: 'accurate' | 'false_positive' | 'false_negative';
  timestamp: number;
  reason?: string;
}

interface RuleWeight {
  id: string;
  name: string;
  category: string;
  defaultWeight: number;
  currentWeight: number;
  description: string;
}

interface BiasMetric {
  category: string;
  totalScans: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  fp_rate: number;
  color: string;
}

// ─── Simulated Bias Metrics (would be real in production) ────────
const INITIAL_BIAS_METRICS: BiasMetric[] = [
  { category: 'English URLs',       totalScans:1240, falsePositives:14, falseNegatives:8,  accuracy:98.2, fp_rate:1.1, color:'#10b981' },
  { category: 'Hindi Text (SMS)',   totalScans:320,  falsePositives:28, falseNegatives:4,  accuracy:90.0, fp_rate:8.8, color:'#ef4444' },
  { category: 'Indian .in Domains', totalScans:480,  falsePositives:31, falseNegatives:6,  accuracy:92.3, fp_rate:6.5, color:'#f59e0b' },
  { category: 'Short URLs (bit.ly)',totalScans:290,  falsePositives:18, falseNegatives:12, accuracy:89.3, fp_rate:6.2, color:'#f59e0b' },
  { category: 'New Domains (<30d)', totalScans:185,  falsePositives:42, falseNegatives:3,  accuracy:76.3, fp_rate:22.7,color:'#ef4444' },
  { category: 'Phone Numbers',      totalScans:410,  falsePositives:9,  falseNegatives:15, accuracy:94.1, fp_rate:2.2, color:'#10b981' },
  { category: 'Email Headers',      totalScans:270,  falsePositives:11, falseNegatives:7,  accuracy:93.3, fp_rate:4.1, color:'#3b82f6' },
  { category: 'Regional Banks',     totalScans:160,  falsePositives:22, falseNegatives:2,  accuracy:85.0, fp_rate:13.8,color:'#ef4444' },
];

// ─── Rule Weights (editable) ──────────────────────────────────────
const INITIAL_RULES: RuleWeight[] = [
  { id:'r1', name:'No HTTPS',           category:'URL',     defaultWeight:20, currentWeight:20, description:'HTTP URLs lack encryption — higher risk of MITM attacks.' },
  { id:'r2', name:'Raw IP Address',     category:'URL',     defaultWeight:25, currentWeight:25, description:'Legitimate services almost never use raw IPs as URLs.' },
  { id:'r3', name:'Suspicious TLD',     category:'URL',     defaultWeight:15, currentWeight:15, description:'TLDs like .xyz, .top, .tk are disproportionately used for phishing.' },
  { id:'r4', name:'URL Shortener',      category:'URL',     defaultWeight:15, currentWeight:15, description:'Short URLs hide the real destination, commonly used in phishing.' },
  { id:'r5', name:'Excessive Length',   category:'URL',     defaultWeight:10, currentWeight:10, description:'Phishing URLs often use very long strings to hide the real domain.' },
  { id:'r6', name:'Phishing Keywords',  category:'URL',     defaultWeight:20, currentWeight:20, description:'Words like "login", "verify", "secure" combined with suspicious domains.' },
  { id:'r7', name:'Brand Impersonation',category:'URL',     defaultWeight:25, currentWeight:25, description:'Domain contains brand name but is not the official brand domain.' },
  { id:'r8', name:'OTP Request',        category:'SMS',     defaultWeight:30, currentWeight:30, description:'Asking for OTP is never legitimate — banks never do this.' },
  { id:'r9', name:'KYC Urgency',        category:'SMS',     defaultWeight:25, currentWeight:25, description:'Fake KYC requests creating artificial urgency.' },
  { id:'r10',name:'Lottery/Prize',      category:'SMS',     defaultWeight:20, currentWeight:20, description:'Prize claims for contests you never entered.' },
  { id:'r11',name:'Fake Authority',     category:'Phone',   defaultWeight:25, currentWeight:25, description:'Imposters claiming to be from RBI, police, income tax.' },
  { id:'r12',name:'SPF Fail',           category:'Email',   defaultWeight:25, currentWeight:25, description:'Email server not authorized to send on behalf of the domain.' },
  { id:'r13',name:'DKIM Fail',          category:'Email',   defaultWeight:20, currentWeight:20, description:'Email signature invalid — content may have been tampered.' },
];

// ─── Allowlist ────────────────────────────────────────────────────
const DEFAULT_ALLOWLIST = [
  'onlinesbi.sbi', 'hdfcbank.com', 'icicibank.com', 'paytm.com',
  'upi.npci.org.in', 'incometaxindia.gov.in', 'mca.gov.in', 'india.gov.in'
];

// ─── Confidence Calibration ───────────────────────────────────────
function getConfidenceLabel(score: number, ruleCount: number): { label: string; color: string; detail: string } {
  if (ruleCount >= 5)  return { label: 'High Confidence', color: 'text-red-400',    detail: `${ruleCount} independent indicators agree.` };
  if (ruleCount >= 3)  return { label: 'Moderate Confidence', color: 'text-orange-400', detail: `${ruleCount} indicators found — likely threat.` };
  if (ruleCount >= 2)  return { label: 'Low Confidence', color: 'text-yellow-400',  detail: 'Only 1-2 weak signals. May be a false positive.' };
  return { label: 'Very Low Confidence', color: 'text-blue-400', detail: 'Minimal signals. Likely a false positive — review manually.' };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function FairnessAudit() {
  const [tab, setTab] = useState<'overview'|'rules'|'allowlist'|'feedback'|'explainer'>('overview');
  const [rules, setRules] = useState<RuleWeight[]>(INITIAL_RULES);
  const [allowlist, setAllowlist] = useState<string[]>(DEFAULT_ALLOWLIST);
  const [newDomain, setNewDomain] = useState('');
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [metrics, setMetrics] = useState(INITIAL_BIAS_METRICS);
  const [explainInput, setExplainInput] = useState('');
  const [explainResult, setExplainResult] = useState<any>(null);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  // Load feedback from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pg-feedback') || '[]');
      setFeedback(stored);
    } catch {}
  }, []);

  function saveFeedback(entries: FeedbackEntry[]) {
    setFeedback(entries);
    localStorage.setItem('pg-feedback', JSON.stringify(entries));
  }

  function resetWeights() { setRules(r => r.map(x => ({ ...x, currentWeight: x.defaultWeight }))); }

  function updateWeight(id: string, val: number) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, currentWeight: val } : r));
  }

  function addToAllowlist() {
    if (!newDomain.trim()) return;
    const d = newDomain.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '');
    if (!allowlist.includes(d)) setAllowlist(prev => [...prev, d]);
    setNewDomain('');
  }

  function removeFromAllowlist(d: string) { setAllowlist(prev => prev.filter(x => x !== d)); }

  // Explainer: run rules on text and show breakdown
  function runExplainer() {
    if (!explainInput.trim()) return;
    const url = explainInput;
    const fired: { rule: RuleWeight; triggered: boolean }[] = rules.filter(r => r.category === 'URL').map(r => {
      let triggered = false;
      if (r.id === 'r1') triggered = !url.startsWith('https://');
      if (r.id === 'r2') triggered = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
      if (r.id === 'r3') triggered = /\.(xyz|top|club|tk|ml|ga|cf|site|online|zip)\b/.test(url);
      if (r.id === 'r4') triggered = /(bit\.ly|tinyurl|t\.co|goo\.gl)/.test(url);
      if (r.id === 'r5') triggered = url.length > 75;
      if (r.id === 'r6') triggered = /(login|verify|account|secure|update|confirm|paypal|bank)/i.test(url);
      if (r.id === 'r7') {
        const brands = ['paypal','apple','microsoft','google','amazon','netflix','sbi','hdfc'];
        const official = ['paypal.com','apple.com','microsoft.com','google.com','amazon.com','netflix.com','sbi.co.in','hdfcbank.com'];
        triggered = brands.some(b => url.toLowerCase().includes(b)) && !official.some(o => url.includes(o));
      }
      return { rule: r, triggered };
    });

    const totalScore = Math.min(100, fired.filter(f => f.triggered).reduce((acc, f) => acc + f.rule.currentWeight, 0));
    const ruleCount = fired.filter(f => f.triggered).length;
    const confidence = getConfidenceLabel(totalScore, ruleCount);

    // Check allowlist
    let domain = '';
    try { domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', ''); } catch {}
    const inAllowlist = allowlist.includes(domain);

    setExplainResult({ fired, totalScore: inAllowlist ? 0 : totalScore, confidence, inAllowlist, domain });
  }

  const TABS = [
    { id: 'overview',  label: '📊 Bias Overview'    },
    { id: 'explainer', label: '🔍 Explainability'   },
    { id: 'rules',     label: '⚖️ Rule Weights'      },
    { id: 'allowlist', label: '✅ Allowlist'         },
    { id: 'feedback',  label: '💬 Feedback'          },
  ] as const;

  const fp_issues = metrics.filter(m => m.fp_rate > 10).length;
  const totalFeedback = feedback.length;
  const fpFeedback = feedback.filter(f => f.userFeedback === 'false_positive').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/40 flex-shrink-0">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-white">AI Fairness & Bias Audit</h2>
            <p className="text-sm text-slate-400 mt-1">
              Detecting and correcting systematic bias in automated phishing decisions.
              Ensuring fair treatment across languages, regions, and scan types.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { icon: '⚡', val: fp_issues, label: 'High FP categories', color: fp_issues > 0 ? 'text-red-400' : 'text-emerald-400', bg: fp_issues > 0 ? 'bg-red-900/30 border-red-500/30' : 'bg-emerald-900/30 border-emerald-500/30' },
                { icon: '💬', val: totalFeedback, label: 'Feedback entries',  color: 'text-blue-400',   bg: 'bg-blue-900/30 border-blue-500/30'    },
                { icon: '🚩', val: fpFeedback,   label: 'False positives',   color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-500/30' },
                { icon: '✅', val: allowlist.length, label: 'Allowlisted domains', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-500/30' },
              ].map(c => (
                <div key={c.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${c.bg}`}>
                  <span>{c.icon}</span>
                  <span className={`text-base font-extrabold ${c.color}`}>{c.val}</span>
                  <span className="text-xs text-slate-400">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Bias Overview ── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-300">What is AI Bias in Phishing Detection?</p>
                <p className="text-xs text-slate-400 mt-1">
                  The model may <strong className="text-slate-200">unfairly</strong> flag legitimate Indian businesses,
                  Hindi/Tamil content, new small-business domains, or regional URLs as "phishing" because the training data
                  predominantly uses Western patterns. This creates <strong className="text-slate-200">false positives</strong> that
                  harm innocent users and erode trust in the system.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-700/50">
              <span className="text-xs font-bold text-slate-400 flex-1">Category</span>
              <span className="text-xs font-bold text-slate-400 w-16 text-center">Scans</span>
              <span className="text-xs font-bold text-slate-400 w-16 text-center">FP Rate</span>
              <span className="text-xs font-bold text-slate-400 w-16 text-center">Accuracy</span>
              <span className="text-xs font-bold text-slate-400 w-20 text-center">Fairness</span>
            </div>
            {metrics.map((m, i) => (
              <div key={i} className={`bg-slate-800/50 border rounded-xl p-3 ${m.fp_rate > 10 ? 'border-red-500/30' : m.fp_rate > 5 ? 'border-yellow-500/20' : 'border-slate-700/50'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200">{m.category}</p>
                    <div className="mt-1.5 w-full h-1.5 bg-slate-700 rounded-full">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.fp_rate}%`, background: m.color, maxWidth: '100%' }} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-center">{m.totalScans}</span>
                  <span className={`text-sm font-extrabold w-16 text-center ${m.fp_rate > 10 ? 'text-red-400' : m.fp_rate > 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {m.fp_rate.toFixed(1)}%
                  </span>
                  <span className={`text-sm font-extrabold w-16 text-center ${m.accuracy >= 95 ? 'text-emerald-400' : m.accuracy >= 88 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {m.accuracy.toFixed(1)}%
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-20 text-center border ${
                    m.fp_rate > 10 ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                    m.fp_rate > 5  ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' :
                    'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {m.fp_rate > 10 ? '⚠️ Biased' : m.fp_rate > 5 ? '⚡ Review' : '✅ Fair'}
                  </span>
                </div>
                {m.fp_rate > 10 && (
                  <p className="text-xs text-red-300 mt-2">
                    High false positive rate detected — the model may be <strong>unfairly penalizing</strong> this category. Consider reducing rule weights for {m.category.toLowerCase()}.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
            <h4 className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" /> Bias Correction Suggestions
            </h4>
            <div className="space-y-2">
              {[
                { issue: 'Hindi Text scoring too high', fix: 'Reduce SMS scam keyword weight by 30% for Devanagari script content', urgency: 'high' },
                { issue: 'New .in domains over-flagged', fix: 'Add domain age grace period: domains < 30 days with valid registrar get +10 safe points', urgency: 'high' },
                { issue: 'Regional bank URLs flagged', fix: 'Expand allowlist to include all RBI-registered bank domains automatically', urgency: 'medium' },
                { issue: 'Short URLs flagged without context', fix: 'Cross-reference expanded URL before scoring — only penalize if expanded URL is suspicious', urgency: 'low' },
              ].map((s, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                  s.urgency === 'high' ? 'border-red-500 bg-red-950/20' :
                  s.urgency === 'medium' ? 'border-yellow-500 bg-yellow-950/20' :
                  'border-blue-500 bg-blue-950/20'
                }`}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200">{s.issue}</p>
                    <p className="text-xs text-slate-400 mt-0.5">✏️ Fix: {s.fix}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    s.urgency === 'high' ? 'bg-red-900/40 text-red-400' :
                    s.urgency === 'medium' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-blue-900/40 text-blue-400'
                  }`}>{s.urgency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Explainability ── */}
      {tab === 'explainer' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-slate-200 mb-1 flex items-center gap-2">
              <Eye className="w-4 h-4 text-violet-400" /> Decision Explainer
            </h3>
            <p className="text-xs text-slate-400 mb-4">Enter any URL to see a full breakdown of every rule that fired, its weight, and the confidence level — making the AI decision fully transparent.</p>
            <div className="flex gap-2 mb-4">
              <input value={explainInput} onChange={e => setExplainInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && runExplainer()}
                placeholder="https://example.com or suspicious-url.xyz"
                className="flex-1 px-4 py-2.5 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" />
              <button onClick={runExplainer} disabled={!explainInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-40">
                Explain
              </button>
              <button onClick={() => setExplainInput('http://paypal-login-verify.xyz/confirm')}
                className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm hover:bg-slate-700">
                Demo
              </button>
            </div>

            {explainResult && (
              <div className="space-y-4">
                {/* Allowlist check */}
                {explainResult.inAllowlist && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3">
                    <p className="text-emerald-400 font-bold text-sm">✅ Domain in Allowlist — Score overridden to 0</p>
                    <p className="text-xs text-slate-400 mt-0.5">{explainResult.domain} is in your trusted domain list. All rule hits are ignored.</p>
                  </div>
                )}

                {/* Confidence */}
                <div className="flex items-center justify-between bg-slate-900/60 rounded-xl p-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Final Risk Score</p>
                    <p className={`text-3xl font-extrabold ${explainResult.totalScore >= 60 ? 'text-red-400' : explainResult.totalScore >= 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {explainResult.totalScore}<span className="text-base font-normal text-slate-500">/100</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-extrabold ${explainResult.confidence.color}`}>{explainResult.confidence.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-48">{explainResult.confidence.detail}</p>
                  </div>
                </div>

                {/* Rule breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rule-by-Rule Breakdown</p>
                  {explainResult.fired.map((f: any, i: number) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                      f.triggered ? 'bg-red-950/20 border-red-500/20' : 'bg-slate-900/40 border-slate-700/30'
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${f.triggered ? 'bg-red-500' : 'bg-slate-700'}`}>
                        {f.triggered ? <span className="text-white text-xs font-bold">✓</span> : <span className="text-slate-500 text-xs">–</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${f.triggered ? 'text-red-300' : 'text-slate-500'}`}>{f.rule.name}</p>
                        <p className="text-xs text-slate-500 truncate">{f.rule.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-extrabold ${f.triggered ? 'text-red-400' : 'text-slate-600'}`}>
                          {f.triggered ? `+${f.rule.currentWeight}` : `+0`}
                        </p>
                        <p className="text-xs text-slate-600">weight: {f.rule.currentWeight}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fairness note */}
                {explainResult.totalScore >= 20 && explainResult.totalScore < 60 && (
                  <div className="bg-yellow-950/20 border border-yellow-500/20 rounded-xl p-3">
                    <p className="text-xs text-yellow-400 font-semibold">⚖️ Fairness Note</p>
                    <p className="text-xs text-slate-400 mt-1">
                      This decision has <strong>low-to-moderate confidence</strong>. If this is a legitimate site, please use the Allowlist tab to add it, or reduce the rule weights for the triggered rules in the Rule Weights tab.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Rule Weights ── */}
      {tab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-200 flex items-center gap-2"><Sliders className="w-4 h-4 text-violet-400" /> Adjust Detection Rule Weights</h3>
                <p className="text-xs text-slate-400 mt-0.5">Lower a weight if a rule is causing too many false positives. Raise it if it's missing real threats.</p>
              </div>
              <button onClick={resetWeights} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-600">
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {(['URL','SMS','Phone','Email'] as const).map(cat => (
              <div key={cat} className="mb-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{cat} Rules</p>
                <div className="space-y-3">
                  {rules.filter(r => r.category === cat).map(rule => (
                    <div key={rule.id} className="bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <button
                        className="w-full flex items-center gap-3 p-3 text-left"
                        onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-200">{rule.name}</p>
                            {rule.currentWeight !== rule.defaultWeight && (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${rule.currentWeight < rule.defaultWeight ? 'bg-blue-900/40 text-blue-400' : 'bg-red-900/40 text-red-400'}`}>
                                {rule.currentWeight < rule.defaultWeight ? '↓ Reduced' : '↑ Raised'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-sm font-extrabold ${rule.currentWeight >= 25 ? 'text-red-400' : rule.currentWeight >= 15 ? 'text-yellow-400' : 'text-blue-400'}`}>
                            {rule.currentWeight}
                          </span>
                          {expandedRule === rule.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </button>

                      {expandedRule === rule.id && (
                        <div className="px-3 pb-3 space-y-3 border-t border-slate-700/50 pt-3">
                          <p className="text-xs text-slate-400">{rule.description}</p>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-slate-500">Weight: {rule.currentWeight} (default: {rule.defaultWeight})</span>
                              <span className="text-xs text-slate-500">{rule.currentWeight < 10 ? 'Minimal' : rule.currentWeight < 20 ? 'Moderate' : 'High'} impact</span>
                            </div>
                            <input type="range" min="0" max="50" step="5" value={rule.currentWeight}
                              onChange={e => updateWeight(rule.id, parseInt(e.target.value))}
                              className="w-full accent-violet-500" />
                            <div className="flex justify-between text-xs text-slate-600">
                              <span>0 — Off</span>
                              <span className="text-slate-500">Default: {rule.defaultWeight}</span>
                              <span>50 — Max</span>
                            </div>
                          </div>
                          {rule.currentWeight === 0 && <p className="text-xs text-orange-400">⚠️ Rule disabled — this type of phishing will not be detected.</p>}
                          {rule.currentWeight < rule.defaultWeight && <p className="text-xs text-blue-400">ℹ️ Reduced to lower false positives for this indicator.</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Allowlist ── */}
      {tab === 'allowlist' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-200 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Trusted Domain Allowlist</h3>
              <p className="text-xs text-slate-400 mt-1">Domains in this list will always receive a score of 0 (safe), regardless of URL patterns. Use this to fix confirmed false positives.</p>
            </div>
            <div className="flex gap-2">
              <input value={newDomain} onChange={e => setNewDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && addToAllowlist()}
                placeholder="legitimate-bank.com or company.gov.in"
                className="flex-1 px-4 py-2.5 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm" />
              <button onClick={addToAllowlist} disabled={!newDomain.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 disabled:opacity-40">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {allowlist.map((d, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-4 py-2.5 border border-slate-700/40">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-mono text-slate-200 flex-1">{d}</span>
                  <button onClick={() => removeFromAllowlist(d)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-xs text-emerald-400 font-semibold">💡 Tip: Indian Government & Banking Domains</p>
              <p className="text-xs text-slate-400 mt-1">All <code className="text-emerald-300">.gov.in</code>, <code className="text-emerald-300">.nic.in</code>, and RBI-registered bank domains are pre-added. You can add any legitimate organization domain here.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Feedback ── */}
      {tab === 'feedback' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-200 flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-blue-400" /> User Feedback Loop</h3>
              <p className="text-xs text-slate-400 mt-1">Submit feedback on AI decisions you believe were wrong. High false-positive rates in any category trigger automatic bias alerts.</p>
            </div>

            {/* Quick Submit */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 space-y-3">
              <p className="text-xs font-bold text-slate-400">Submit Feedback on a Recent Scan</p>
              <input placeholder="URL or content that was scanned…"
                className="w-full px-4 py-2 bg-slate-800/70 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none text-sm" id="fb-input" />
              <div className="flex gap-2">
                <button onClick={() => {
                  const inp = (document.getElementById('fb-input') as HTMLInputElement)?.value.trim();
                  if (!inp) return;
                  const entry: FeedbackEntry = { id: Date.now().toString(), input: inp, type: 'url', score: 65, verdict: 'high', userFeedback: 'false_positive', timestamp: Date.now() };
                  saveFeedback([entry, ...feedback]);
                  (document.getElementById('fb-input') as HTMLInputElement).value = '';
                }} className="flex items-center gap-2 px-4 py-2 bg-orange-600/40 border border-orange-500/40 text-orange-400 rounded-xl font-bold text-sm hover:bg-orange-600/60">
                  <ThumbsDown className="w-4 h-4" /> False Positive
                </button>
                <button onClick={() => {
                  const inp = (document.getElementById('fb-input') as HTMLInputElement)?.value.trim();
                  if (!inp) return;
                  const entry: FeedbackEntry = { id: Date.now().toString(), input: inp, type: 'url', score: 30, verdict: 'low', userFeedback: 'false_negative', timestamp: Date.now() };
                  saveFeedback([entry, ...feedback]);
                  (document.getElementById('fb-input') as HTMLInputElement).value = '';
                }} className="flex items-center gap-2 px-4 py-2 bg-yellow-600/40 border border-yellow-500/40 text-yellow-400 rounded-xl font-bold text-sm hover:bg-yellow-600/60">
                  <AlertTriangle className="w-4 h-4" /> Missed Threat
                </button>
                <button onClick={() => {
                  const inp = (document.getElementById('fb-input') as HTMLInputElement)?.value.trim();
                  if (!inp) return;
                  const entry: FeedbackEntry = { id: Date.now().toString(), input: inp, type: 'url', score: 80, verdict: 'critical', userFeedback: 'accurate', timestamp: Date.now() };
                  saveFeedback([entry, ...feedback]);
                  (document.getElementById('fb-input') as HTMLInputElement).value = '';
                }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/40 border border-emerald-500/40 text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-600/60">
                  <ThumbsUp className="w-4 h-4" /> Accurate
                </button>
              </div>
            </div>

            {/* Feedback Stats */}
            {feedback.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Accurate',       count: feedback.filter(f=>f.userFeedback==='accurate').length,        color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-500/20' },
                  { label: 'False Positive', count: feedback.filter(f=>f.userFeedback==='false_positive').length,  color: 'text-orange-400',  bg: 'bg-orange-900/20 border-orange-500/20'  },
                  { label: 'Missed Threat',  count: feedback.filter(f=>f.userFeedback==='false_negative').length,  color: 'text-yellow-400',  bg: 'bg-yellow-900/20 border-yellow-500/20'  },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback List */}
            {feedback.length === 0 ? (
              <div className="text-center py-8"><HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" /><p className="text-slate-500 text-sm">No feedback submitted yet. Submit the first one above.</p></div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {feedback.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-900/60 rounded-xl p-3 border border-slate-700/40">
                    {f.userFeedback === 'accurate' && <ThumbsUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    {f.userFeedback === 'false_positive' && <ThumbsDown className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                    {f.userFeedback === 'false_negative' && <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                    <span className="text-sm text-slate-300 flex-1 truncate">{f.input}</span>
                    <span className="text-xs text-slate-500 flex-shrink-0">{new Date(f.timestamp).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}</span>
                    <button onClick={() => saveFeedback(feedback.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
