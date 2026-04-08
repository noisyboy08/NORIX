// Feature 9: PDF Report Generator
// Feature 10: Password Audit  
// Features 1+2: Voice Scam Detector + Campaign Fingerprinter (UI)
import { useState, useRef, useEffect } from 'react';
import { FileText, Download, Mic, MicOff, Fingerprint, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';

// ─── PDF Report ───────────────────────────────────────────────────
interface ScanResultForPDF {
  url?: string;
  content?: string;
  type: string;
  score: number;
  riskLevel: string;
  indicators: { rule: string; description?: string; weight?: number }[];
  domainAge?: string;
  country?: string;
  brand?: string;
}

export function generatePDFReport(result: ScanResultForPDF) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.width;
  let y = 20;

  // Header
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, w, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Norix — Security Report', 15, 18);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 15, 26);
  pdf.text('SDG 9 & 16 Aligned | Protecting Digital India', w - 15, 26, { align: 'right' });

  y = 45;

  // Risk Score Box
  const riskColors: Record<string, [number, number, number]> = {
    critical: [239, 68, 68], high: [245, 158, 11], medium: [250, 204, 21], low: [59, 130, 246], safe: [16, 185, 129]
  };
  const [r, g, bb] = riskColors[result.riskLevel] || [100, 100, 100];
  pdf.setFillColor(r, g, bb);
  pdf.roundedRect(15, y, w - 30, 28, 4, 4, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${result.score}`, 35, y + 18);
  pdf.setFontSize(11);
  pdf.text('/100', 50, y + 18);
  pdf.setFontSize(16);
  pdf.text(result.riskLevel.toUpperCase(), 70, y + 18);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(result.type.toUpperCase() + ' ANALYSIS', w - 20, y + 10, { align: 'right' });
  y += 36;

  // Scan Target
  pdf.setTextColor(51, 65, 85);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SCAN TARGET', 15, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(9);
  const target = result.url || result.content?.slice(0, 100) || 'N/A';
  pdf.text(target, 15, y, { maxWidth: w - 30 });
  y += 12;

  // Metadata
  if (result.domainAge || result.country || result.brand) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.setFontSize(8);
    pdf.text('THREAT INTELLIGENCE', 15, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(9);
    if (result.domainAge) pdf.text(`Domain Age: ${result.domainAge}`, 15, y++);
    if (result.country)   pdf.text(`Hosting Country: ${result.country}`, 15, y++);
    if (result.brand)     pdf.text(`⚠️ Brand Impersonation: ${result.brand}`, 15, y++);
    y += 8;
  }

  // Indicators
  if (result.indicators.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 65, 85);
    pdf.setFontSize(8);
    pdf.text('THREAT INDICATORS', 15, y);
    y += 6;
    result.indicators.slice(0, 10).forEach(ind => {
      pdf.setFillColor(254, 226, 226);
      pdf.roundedRect(15, y - 3, w - 30, 9, 2, 2, 'F');
      pdf.setTextColor(185, 28, 28);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(`• ${ind.rule}`, 18, y + 2);
      if (ind.weight) pdf.text(`+${ind.weight}pts`, w - 18, y + 2, { align: 'right' });
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      if (ind.description) pdf.text(ind.description, 20, y + 7);
      y += 12;
    });
  }

  y += 5;
  // Recommendation box
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(15, y, w - 30, 22, 4, 4, 'F');
  pdf.setTextColor(30, 64, 175);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('RECOMMENDATIONS', 18, y + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(51, 65, 85);
  const recs = result.score >= 60
    ? 'Do NOT visit this site or share any credentials. Report to CERT-In at www.cert-in.org.in or call 1930.'
    : result.score >= 40
    ? 'Exercise caution. Verify the URL carefully before entering any information.'
    : 'This appears safe. Continue with normal caution.';
  pdf.text(recs, 18, y + 13, { maxWidth: w - 36 });
  y += 28;

  // Footer
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 280, w, 17, 'F');
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7);
  pdf.text('Norix v2.0 — AI-Powered Cybersecurity Platform', 15, 287);
  pdf.text('Report ID: PG-' + Date.now(), w - 15, 287, { align: 'right' });
  pdf.text('This report is generated automatically. For official use, verify with a certified cybersecurity professional.', 15, 292);

  pdf.save(`Norix-Report-${Date.now()}.pdf`);
}

// ─── PDF button (embeddable) ──────────────────────────────────────
export function PDFReportButton({ result }: { result: ScanResultForPDF }) {
  return (
    <button onClick={() => generatePDFReport(result)}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-700/40 border border-emerald-600/40 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-700/60 transition-all">
      <Download className="w-4 h-4" /> Download PDF Report
    </button>
  );
}

// ─── Voice Scam Detector ─────────────────────────────────────────
const VOICE_KEYWORDS = [
  'otp', 'one time password', 'atm pin', 'card number', 'cvv', 'account number',
  'aadhaar', 'pan number', 'suspended', 'arrested', 'police', 'rbi', 'sebi',
  'income tax', 'refund', 'prize', 'lottery', 'kyc', 'blocked', 'remote access',
];

export function VoiceScamDetector() {
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<{ score: number; hits: string[] } | null>(null);
  const recogRef = useRef<any>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('transcript');
    if (t) {
      setTranscript(t);
      analyzeVoice(t);
    }
  }, []);

  function startRecording() {
    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Please use Chrome.'); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
      setTranscript(t);
    };
    recognition.start();
    recogRef.current = recognition;
    setRecording(true);
  }

  function stopRecording() {
    recogRef.current?.stop();
    setRecording(false);
    analyzeVoice(transcript);
  }

  function analyzeText() { analyzeVoice(transcript); }

  function analyzeVoice(text: string) {
    const lo = text.toLowerCase();
    const hits = VOICE_KEYWORDS.filter(kw => lo.includes(kw));
    const score = Math.min(100, hits.length * 15 + (text.length > 50 ? 10 : 0));
    setResult({ score, hits });
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">Voice & Call Scam Detector</h3>
          <p className="text-xs text-slate-400">Record a scam call or paste transcript to analyze</p>
        </div>
      </div>
      <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={4}
        placeholder="Paste call transcript or speak using microphone…"
        className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none text-sm" />
      <div className="flex gap-2">
        {recording
          ? <button onClick={stopRecording} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm animate-pulse"><MicOff className="w-4 h-4" /> Stop</button>
          : <button onClick={startRecording} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl font-bold text-sm hover:bg-pink-500"><Mic className="w-4 h-4" /> Record Call</button>
        }
        <button onClick={analyzeText} disabled={!transcript.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-600 disabled:opacity-40">
          <Play className="w-4 h-4" /> Analyze Text
        </button>
      </div>
      {result && (
        <div className={`rounded-xl p-4 border-2 ${result.score >= 40 ? 'bg-red-950/30 border-red-500/40' : 'bg-emerald-950/30 border-emerald-500/40'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-extrabold ${result.score >= 40 ? 'text-red-400' : 'text-emerald-400'}`}>
              {result.score >= 60 ? '🚨 High-Risk Vishing Attempt!' : result.score >= 40 ? '⚠️ Suspicious Call Pattern' : '✅ Appears Legitimate'}
            </span>
            <span className={`text-xl font-extrabold ${result.score >= 40 ? 'text-red-400' : 'text-emerald-400'}`}>{result.score}</span>
          </div>
          {result.hits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {result.hits.map(h => <span key={h} className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">{h}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Campaign Fingerprinter ───────────────────────────────────────
export function CampaignFingerprinter() {
  const [urls, setUrls] = useState('');
  const [campaigns, setCampaigns] = useState<{ pattern: string; urls: string[]; risk: string }[]>([]);

  function fingerprint() {
    const list = urls.split('\n').map(u => u.trim()).filter(Boolean);
    const groups: Record<string, string[]> = {};
    list.forEach(url => {
      let key = 'Unknown';
      try {
        const h = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
        const parts = h.split('.');
        // Group by TLD pattern + registrar
        if (/(login|verify|account|secure|update)/i.test(h)) key = 'Credential Theft Campaign';
        else if (/(kyc|bank|sbi|hdfc|icici)/i.test(h)) key = 'Banking Fraud Campaign';
        else if (/(lottery|prize|won|reward)/i.test(h)) key = 'Prize/Lottery Scam';
        else if (/\.(xyz|top|ml|ga|cf|tk)\b/.test(h)) key = 'Free TLD Phishing';
        else if (/\d{1,3}\.\d{1,3}/.test(h)) key = 'IP-Based Phishing';
        else key = `Generic Phish (${parts.slice(-2).join('.')})`;
      } catch {}
      if (!groups[key]) groups[key] = [];
      groups[key].push(url);
    });
    const result = Object.entries(groups).map(([pattern, urls]) => ({
      pattern, urls,
      risk: urls.length >= 3 ? 'Coordinated Campaign' : urls.length >= 2 ? 'Possible Campaign' : 'Single Instance'
    }));
    setCampaigns(result.sort((a, b) => b.urls.length - a.urls.length));
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Fingerprint className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">Campaign Fingerprinter</h3>
          <p className="text-xs text-slate-400">Cluster phishing URLs to identify coordinated attack campaigns</p>
        </div>
      </div>
      <textarea value={urls} onChange={e => setUrls(e.target.value)} rows={5}
        placeholder="Paste multiple URLs (one per line) to cluster them into campaigns…"
        className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none text-sm font-mono" />
      <button onClick={fingerprint} disabled={!urls.trim()}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-40">
        <Fingerprint className="w-4 h-4" /> Analyze Campaigns
      </button>
      {campaigns.length > 0 && (
        <div className="space-y-3">
          {campaigns.map((c, i) => (
            <div key={i} className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-200">{c.pattern}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${c.urls.length >= 3 ? 'bg-red-900/40 text-red-400 border border-red-500/30' : 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30'}`}>
                  {c.risk} ({c.urls.length})
                </span>
              </div>
              <div className="space-y-0.5">
                {c.urls.slice(0, 3).map((u, j) => <p key={j} className="text-xs font-mono text-slate-400 truncate">{u}</p>)}
                {c.urls.length > 3 && <p className="text-xs text-slate-500">+{c.urls.length - 3} more…</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OTP Scam Detector Component ─────────────────────────────────
export function OTPScanDetector() {
  const [sms, setSms] = useState('');
  const [result, setResult] = useState<any>(null);

  const OTP_PATTERNS = [
    { p: /\b\d{4,8}\b.*\b(otp|code|pin)\b/i, name: 'OTP in message body', score: 35 },
    { p: /(share|send|give|read out|tell).*(otp|code|pin)/i, name: 'Asked to share OTP', score: 40 },
    { p: /(kyc|know your customer)/i, name: 'KYC request', score: 25 },
    { p: /(block|suspend|arrest|urgent)/i, name: 'Fear/urgency tactic', score: 20 },
    { p: /(bank|sbi|hdfc|icici|rbi)/i, name: 'Bank or RBI mention', score: 15 },
    { p: /call.*\d{10}/i, name: 'Call back number provided', score: 20 },
    { p: /(click|tap|visit).*http/i, name: 'Link with action request', score: 25 },
  ];

  function scan() {
    const hits = OTP_PATTERNS.filter(p => p.p.test(sms));
    const score = Math.min(100, hits.reduce((acc, h) => acc + h.score, 0));
    setResult({ score, hits });
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">OTP & SMS Scam Detector</h3>
          <p className="text-xs text-slate-400">Paste SMS/WhatsApp message — detects OTP fraud & KYC scams instantly</p>
        </div>
      </div>
      <textarea value={sms} onChange={e => setSms(e.target.value)} rows={4}
        placeholder="Paste suspicious SMS or WhatsApp message here…"
        className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none text-sm" />
      <div className="flex gap-2">
        <button onClick={scan} disabled={!sms.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-40">
          Scan Message
        </button>
        <button onClick={() => setSms('SBI ALERT: Your A/C is blocked. Share OTP 7841 received on your phone to unblock: Call 9988774455 NOW')}
          className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700">
          Demo
        </button>
      </div>
      {result && (
        <div className={`rounded-xl p-4 border-2 ${result.score >= 40 ? 'bg-red-950/30 border-red-500/40' : 'bg-emerald-950/30 border-emerald-500/40'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`font-extrabold ${result.score >= 60 ? 'text-red-400' : result.score >= 40 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {result.score >= 60 ? '🚨 OTP Scam Detected!' : result.score >= 40 ? '⚠️ Suspicious Pattern' : '✅ Appears Legitimate'}
            </span>
            <span className={`text-2xl font-extrabold ${result.score >= 40 ? 'text-red-400' : 'text-emerald-400'}`}>{result.score}</span>
          </div>
          {result.hits.map((h: any, i: number) => (
            <div key={i} className="text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />{h.name} (+{h.score})
            </div>
          ))}
          {result.score >= 60 && <p className="text-xs text-red-400 mt-3 font-bold">⚠️ NEVER share any OTP or personal info in response to this message!</p>}
        </div>
      )}
    </div>
  );
}
