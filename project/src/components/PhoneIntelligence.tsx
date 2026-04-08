import { useState, useEffect } from 'react';
import { Phone, CheckCircle, Search, ShieldAlert, MapPin, Radio, Shield, Info } from 'lucide-react';
import { parsePhoneInput } from '../utils/phoneParse';
import { mlScanPhone } from '../utils/mlDetection';

export default function PhoneIntelligence() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('phone');
    if (p) {
      setPhone(p);
      analyzeNumber(p);
    }
  }, []);

  const analyzeNumber = async (numToAnalyze: string) => {
    if (!numToAnalyze.trim()) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    const parsed = parsePhoneInput(numToAnalyze);
    const script = numToAnalyze.trim();
    const looksLikeScript = script.length > 45 || /(otp|called|said|asked|told me|verify|card|bank)/i.test(script);

    const ml = looksLikeScript ? mlScanPhone(script) : mlScanPhone(script);

    const scriptRisk = ml.score;
    const reasons: string[] = [];

    if (!parsed.validLength && !looksLikeScript) {
      reasons.push('Number length is unusual — double-check the full international format (e.g. +91…).');
    }
    if (parsed.regionGuess) {
      reasons.push(`Dial prefix suggests region: ${parsed.regionGuess} (best-effort guess, not carrier lookup).`);
    } else if (parsed.digitsOnly.length >= 8) {
      reasons.push('Could not map dial prefix to a region — number may omit country code.');
    }

    reasons.push(
      'Norix does not query commercial spam databases from the browser. Treat “report counts” from other apps as separate data.'
    );

    if (looksLikeScript && ml.features.length > 0) {
      reasons.push(
        `Call/script heuristics (${ml.confidence} signal strength): ${ml.features.map((f) => f.name).join(', ')}.`
      );
    } else if (!looksLikeScript) {
      reasons.push(
        'For better accuracy, paste what the caller said (vishing script). Keyword-only number checks are limited.'
      );
    }

    const riskLabel =
      scriptRisk >= 55 ? 'High — script matches common scam patterns' :
      scriptRisk >= 35 ? 'Elevated — review script / caller claims' :
      'Low — no strong scam script signals in text';

    const confidence = Math.min(85, 35 + scriptRisk * 0.5 + (looksLikeScript ? 12 : 0));

    setResult({
      type: scriptRisk >= 55 ? 'Treat as suspicious (heuristic)' : 'No strong scam script (heuristic)',
      riskLabel,
      scriptRisk,
      carrier: 'Unknown (not queried — add carrier API in backend for live lookup)',
      country: parsed.regionGuess || 'Unknown from prefix',
      state: '—',
      reports: '—',
      parsedDisplay: parsed.e164ish.startsWith('+') ? parsed.e164ish : `+${parsed.digitsOnly}`,
      confidence: Math.round(confidence),
      reasons,
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
          <Phone className="text-orange-400" /> Phone &amp; vishing script check
        </h2>
        <p className="mb-4 flex items-start gap-2 text-sm text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          Enter a number <strong className="text-slate-300">or</strong> paste the full call/SMS script. We do{' '}
          <strong className="text-slate-300">not</strong> fabricate spam “report counts” or mark numbers safe/scam by random digits.
        </p>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-semibold text-slate-300">Phone number and/or call script</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
              placeholder="e.g. +91 9876543210 or paste what they said…"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => analyzeNumber(phone)}
              disabled={loading || !phone}
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-500 disabled:opacity-50"
            >
              {loading ? 'Analyzing…' : (
                <>
                  <Search className="h-5 w-5" /> Analyze
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setPhone(
                'Caller said they are from RBI fraud department, my account is blocked, asked for OTP and debit card last 6 digits to unblock.'
              )
            }
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-orange-400"
          >
            Sample scam script
          </button>
          <button
            type="button"
            onClick={() => setPhone('+1 800 422 1000')}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400"
          >
            Sample number only
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-700 pb-2 text-lg font-bold text-white">
              <Shield className="h-5 w-5 text-slate-400" /> Parsed input
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Heuristic risk (script)</p>
                <p className="mt-1 text-xl font-black text-slate-200">{result.scriptRisk}/100</p>
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Summary</p>
                <p className="mt-1 text-sm font-bold leading-snug text-slate-200">{result.riskLabel}</p>
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                <p className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500">
                  <MapPin className="h-3 w-3" /> Region guess
                </p>
                <p className="mt-1 text-sm font-bold text-white">{result.country}</p>
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                <p className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500">
                  <Radio className="h-3 w-3" /> Carrier
                </p>
                <p className="mt-1 text-sm font-bold text-white">{result.carrier}</p>
              </div>
              <div className="col-span-2 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Normalized digits</p>
                <p className="mt-1 font-mono text-sm text-slate-200">{result.parsedDisplay}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <h3 className="mb-4 flex justify-between border-b border-slate-700 pb-2 text-lg font-bold text-white">
              What we can (and cannot) say
              <span className="text-sm font-bold text-purple-400">~{result.confidence}% clarity</span>
            </h3>

            <div className="mt-4 space-y-3 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              {result.reasons.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {result.scriptRisk >= 55 ? (
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  ) : (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  <span className={result.scriptRisk >= 55 ? 'text-red-200' : 'text-emerald-100'}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
