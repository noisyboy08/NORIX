import { useState } from 'react';
import { CheckCircle, Search, UserX, Crosshair, Eye, Info } from 'lucide-react';
import { analyzePhishingWithFallback } from '../utils/api';
import { detectTyposquatDomain } from '../utils/typosquat';

export default function EmailIntelligence() {
  const [email, setEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const blob = [
        senderName.trim() ? `Display name: ${senderName.trim()}` : '',
        `From: ${email.trim()}`,
        '',
        body.trim(),
      ]
        .filter(Boolean)
        .join('\n');

      const { result: api, source } = await analyzePhishingWithFallback('', blob, 'email');

      const domainPart = email.split('@')[1]?.toLowerCase().trim() || '';
      const squat = domainPart ? detectTyposquatDomain(domainPart) : null;

      const classification =
        api.riskScore >= 55 ? 'Likely phishing / fraud' :
        api.riskScore >= 35 ? 'Suspicious — verify' :
        'Likely benign (heuristic)';

      const reasons = (api.threatIndicators || [])
        .filter((i: { weight?: number }) => (i.weight ?? 0) > 0)
        .map((i: { description?: string }) => i.description || '')
        .filter(Boolean);

      if (squat) {
        reasons.unshift(
          `Typosquat check: “${domainPart}” is within ${squat.distance} edit(s) of “${squat.target}”.`
        );
      }

      if (reasons.length === 0) {
        reasons.push('No strong scam keyword patterns in the pasted content.');
        reasons.push('Legitimate mail can still be spoofed — confirm urgent requests out-of-band.');
      }

      const confidence = Math.min(
        82,
        40 + Math.min(api.threatIndicators?.length || 0, 6) * 6 + (squat ? 10 : 0)
      );

      setResult({
        classification,
        emailIdValid: !squat,
        trustScore: Math.max(0, 100 - api.riskScore),
        reasons,
        confidence: Math.round(confidence),
        riskScore: api.riskScore,
        source,
      });
    } catch (e) {
      console.error(e);
      setResult({
        classification: 'Error',
        emailIdValid: true,
        trustScore: 0,
        reasons: ['Analysis failed. Check network or Supabase configuration.'],
        confidence: 0,
        riskScore: 0,
        source: 'local',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
          <Eye className="text-blue-400" /> Email intelligence
        </h2>
        <p className="mb-4 flex items-start gap-2 text-sm text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          Combines Norix heuristics (and Supabase Edge Function when configured). Scores are{' '}
          <span className="text-slate-300">probabilistic</span>, not legal proof.
        </p>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-300">Sender email</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50"
              placeholder="e.g. support@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-300">Display name (optional)</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50"
              placeholder="e.g. PayPal Support"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-300">Email body</label>
          <textarea
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50"
            placeholder="Paste subject + body…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={analyze}
            disabled={loading || !email}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : (
              <>
                <Search className="h-5 w-5" /> Analyze
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('support@gmil.com');
              setSenderName('PayPal');
              setBody(
                'URGENT: Your account will be suspended in 24 hours. Click here to verify immediately or access will be permanently locked.'
              );
            }}
            className="rounded-xl bg-slate-700 px-6 py-3 font-bold text-white hover:bg-slate-600"
          >
            Load demo
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <h3 className="mb-4 border-b border-slate-700 pb-2 text-lg font-bold text-white">
              Classification
            </h3>

            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <span className="text-sm font-semibold text-slate-400">Verdict</span>
              <span
                className={`rounded-md border px-3 py-1 text-sm font-bold uppercase ${
                  result.riskScore >= 55
                    ? 'border-red-500/30 bg-red-500/20 text-red-400'
                    : result.riskScore >= 35
                      ? 'border-orange-500/30 bg-orange-500/20 text-orange-400'
                      : 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {result.classification}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-400">Sender domain typosquat</p>
                <p className="mt-0.5 text-xs text-slate-500">Edit-distance vs major brands</p>
              </div>
              {result.emailIdValid ? (
                <div className="flex items-center gap-1 font-bold text-green-400">
                  <CheckCircle className="h-5 w-5" /> No close match
                </div>
              ) : (
                <div className="flex items-center gap-1 font-bold text-red-400">
                  <UserX className="h-5 w-5" /> Possible lookalike
                </div>
              )}
            </div>
            {result.source === 'local' && (
              <p className="mt-3 text-xs text-amber-400/90">Using local mode — configure Supabase for server-side enrichment.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <h3 className="mb-4 border-b border-slate-700 pb-2 text-lg font-bold text-white">
              Risk &amp; rationale
            </h3>

            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">Trust score (inverse of risk)</p>
                <div
                  className="mt-1 text-4xl font-black"
                  style={{
                    color: result.trustScore > 70 ? '#4ade80' : result.trustScore > 40 ? '#fbbf24' : '#f87171',
                  }}
                >
                  {result.trustScore}/100
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Est. clarity</p>
                <p className="text-lg font-bold text-purple-400">{result.confidence}%</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Signals</p>
              {result.reasons.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Crosshair className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span className="text-slate-300">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
