import { useState } from 'react';
import { Mail, Search, AlertTriangle, CheckCircle, Server, Shield, User } from 'lucide-react';

interface HeaderField {
  key: string;
  value: string;
  suspicious: boolean;
  reason?: string;
}

interface ParsedHeader {
  from: string;
  replyTo: string;
  returnPath: string;
  spf: string;
  dkim: string;
  dmarc: string;
  xMailer: string;
  receivedChain: string[];
  riskScore: number;
  fields: HeaderField[];
  findings: { title: string; detail: string; severity: 'high' | 'medium' | 'low' }[];
}

const DEMO_HEADER = `From: "PayPal Support" <security-noreply@paypal-secure-login.net>
Reply-To: collect@scam-collector.xyz
Return-Path: bounce@phish-domain.ru
Received: from mail.phish-domain.ru (unknown [185.220.101.5])
Received: from localhost (localhost [127.0.0.1])
Subject: [URGENT] Your PayPal account has been suspended - Verify NOW
Date: Thu, 26 Mar 2026 00:00:00 +0000
X-Mailer: PHPMailer 6.0
X-Spam-Status: Yes, score=8.2
DKIM-Signature: v=1; a=rsa-sha256; d=paypal-secure-login.net;
Authentication-Results: spf=fail smtp.mailfrom=paypal-secure-login.net;
  dkim=fail header.d=paypal-secure-login.net;
  dmarc=fail`;

function parseHeaders(raw: string): ParsedHeader {
  const lines = raw.split('\n').map(l => l.trim());
  const get = (key: string) => {
    const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase() + ':'));
    return line ? line.slice(key.length + 1).trim() : '';
  };

  const from = get('From');
  const replyTo = get('Reply-To');
  const returnPath = get('Return-Path');
  const xMailer = get('X-Mailer');
  const authResults = lines.filter(l => l.toLowerCase().includes('authentication-results') || l.includes('spf=') || l.includes('dkim=') || l.includes('dmarc='));

  const spf = authResults.some(l => l.includes('spf=fail')) ? 'FAIL' : authResults.some(l => l.includes('spf=pass')) ? 'PASS' : 'UNKNOWN';
  const dkim = authResults.some(l => l.includes('dkim=fail')) ? 'FAIL' : authResults.some(l => l.includes('dkim=pass')) ? 'PASS' : 'UNKNOWN';
  const dmarc = authResults.some(l => l.includes('dmarc=fail')) ? 'FAIL' : authResults.some(l => l.includes('dmarc=pass')) ? 'PASS' : 'UNKNOWN';

  const receivedLines = lines.filter(l => l.toLowerCase().startsWith('received:'));
  const receivedChain = receivedLines.map(l => l.slice(9).trim());

  let score = 0;
  const findings: ParsedHeader['findings'] = [];
  const fields: HeaderField[] = [];

  // From domain vs authentication
  const fromDomain = from.match(/[\w.-]+\.\w+(?=>|$)/)?.[0]?.toLowerCase() || '';
  const brands = ['paypal', 'google', 'microsoft', 'apple', 'amazon', 'sbi', 'hdfc'];
  const hasBrand = brands.some(b => from.toLowerCase().includes(b));

  if (hasBrand && !from.includes(`@${brands.find(b => from.toLowerCase().includes(b))}.com`)) {
    score += 30;
    findings.push({ title: 'Brand Spoofing in From', detail: `From header claims to be a well-known brand but uses a different domain: ${fromDomain}`, severity: 'high' });
  }

  if (replyTo && replyTo !== from) {
    score += 20;
    findings.push({ title: 'Reply-To Mismatch', detail: `Reply-To (${replyTo}) differs from From address — replies go to a different mailbox.`, severity: 'high' });
  }

  if (spf === 'FAIL') { score += 25; findings.push({ title: 'SPF Authentication Failed', detail: 'Server not authorized to send on behalf of the From domain.', severity: 'high' }); }
  if (dkim === 'FAIL') { score += 20; findings.push({ title: 'DKIM Signature Invalid', detail: 'Email content may have been tampered with in transit.', severity: 'high' }); }
  if (dmarc === 'FAIL') { score += 20; findings.push({ title: 'DMARC Policy Violated', detail: 'Email failed domain policy check — strong indicator of spoofing.', severity: 'high' }); }

  if (xMailer && /(phpmailer|sendgrid|mailchimp|massmailer)/i.test(xMailer)) {
    score += 10;
    findings.push({ title: `Mass Mailer Detected: ${xMailer}`, detail: 'Email sent via a bulk-mailing tool — common in phishing campaigns.', severity: 'medium' });
  }

  if (/\b(185\.|193\.|94\.\d|45\.\d)/.test(receivedChain.join(' '))) {
    score += 15;
    findings.push({ title: 'Suspicious Origin IP', detail: 'Email originated from IP ranges associated with VPS/hosting frequently used for spam.', severity: 'medium' });
  }

  // Build fields list
  [['From', from], ['Reply-To', replyTo], ['Return-Path', returnPath], ['SPF', spf], ['DKIM', dkim], ['DMARC', dmarc], ['X-Mailer', xMailer]].forEach(([k, v]) => {
    if (v) fields.push({ key: k, value: v, suspicious: k === 'SPF' || k === 'DKIM' || k === 'DMARC' ? v === 'FAIL' : false });
  });

  return { from, replyTo, returnPath, spf, dkim, dmarc, xMailer, receivedChain, riskScore: Math.min(100, score), fields, findings };
}

const AUTH_COLOR = (v: string) => v === 'PASS' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : v === 'FAIL' ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-slate-400 bg-slate-700/30 border-slate-600/30';

export default function EmailHeaderAnalyzer() {
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<ParsedHeader | null>(null);

  function analyze() {
    if (!raw.trim()) return;
    setResult(parseHeaders(raw));
  }

  const riskBg = (s: number) => s >= 60 ? 'border-red-500/40 bg-red-950/30' : s >= 40 ? 'border-yellow-500/40 bg-yellow-950/30' : 'border-emerald-500/40 bg-emerald-950/30';

  return (
    <div className="space-y-5">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Email Header Analyzer</h2>
            <p className="text-xs text-slate-400">Detect spoofing via SPF, DKIM, DMARC & routing analysis</p>
          </div>
        </div>
        <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={8}
          placeholder="Paste raw email headers here (From:, Received:, Authentication-Results:, DKIM-Signature: etc.)"
          className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none text-xs font-mono mb-3" />
        <div className="flex gap-2">
          <button onClick={analyze} disabled={!raw.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 text-sm">
            <Search className="w-4 h-4" /> Analyze Headers
          </button>
          <button onClick={() => setRaw(DEMO_HEADER)}
            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700">
            Load Demo
          </button>
        </div>
      </div>

      {result && (
        <div className={`rounded-2xl border-2 p-5 space-y-5 ${riskBg(result.riskScore)}`}>
          {/* Score */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-bold ${result.riskScore >= 60 ? 'text-red-400' : result.riskScore >= 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {result.riskScore >= 60 ? '⚠️ Spoofed / Phishing Email' : result.riskScore >= 40 ? '⚡ Suspicious Email' : '✅ Passes Authentication'}
              </h3>
              <p className="text-xs text-slate-400">Header analysis complete</p>
            </div>
            <div className={`text-4xl font-extrabold ${result.riskScore >= 60 ? 'text-red-400' : 'text-emerald-400'}`}>{result.riskScore}</div>
          </div>

          {/* Auth Badges */}
          <div className="grid grid-cols-3 gap-2">
            {[['SPF', result.spf], ['DKIM', result.dkim], ['DMARC', result.dmarc]].map(([k, v]) => (
              <div key={k} className={`rounded-xl border px-3 py-2 text-center ${AUTH_COLOR(v)}`}>
                <p className="text-xs font-bold opacity-70">{k}</p>
                <p className="text-sm font-extrabold">{v}</p>
              </div>
            ))}
          </div>

          {/* Findings */}
          {result.findings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" /> Security Findings
              </h4>
              {result.findings.map((f, i) => (
                <div key={i} className={`border-l-4 pl-3 py-2 rounded-r-xl ${
                  f.severity === 'high' ? 'border-red-500 bg-red-950/30' : f.severity === 'medium' ? 'border-yellow-500 bg-yellow-950/20' : 'border-blue-500 bg-blue-950/20'
                }`}>
                  <p className="text-sm font-bold text-slate-200">{f.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sender Chain */}
          {result.receivedChain.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-cyan-400" /> Mail Routing Chain
              </h4>
              <div className="space-y-1">
                {result.receivedChain.map((r, i) => (
                  <div key={i} className="text-xs font-mono text-slate-400 bg-slate-900/60 rounded px-3 py-1.5 truncate">
                    {i + 1}. {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
