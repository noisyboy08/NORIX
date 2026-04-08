// Feature 4: Phishing Simulation & Training Mode (Gamified)
import { useState } from 'react';
import { Trophy, Brain, CheckCircle, XCircle, ChevronRight, RefreshCw, Star } from 'lucide-react';

interface Question {
  id: number;
  type: 'email' | 'url' | 'sms';
  content: string;
  isPhishing: boolean;
  indicators: string[];
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1, type: 'email', isPhishing: true,
    content: 'From: paypal-security@paypal-secure-login.net\nSubject: URGENT: Your PayPal account has been limited!\n\nDear Customer,\n\nWe have detected suspicious activity on your account. Click here to verify your identity within 24 hours or your account will be permanently suspended.\n\n[VERIFY NOW] http://paypal-verify-account.xyz/confirm',
    indicators: ['Suspicious sender domain (paypal-secure-login.net ≠ paypal.com)', 'Urgency tactic ("24 hours")', 'Threat of suspension', 'External phishing link'],
    explanation: 'Legitimate PayPal emails always come from @paypal.com — never a hyphenated domain. The link goes to .xyz, not paypal.com.'
  },
  {
    id: 2, type: 'url', isPhishing: false,
    content: 'https://www.amazon.in/gp/cart/view.html?ref=nav_cart',
    indicators: [],
    explanation: 'This is the official Amazon India cart URL. It uses HTTPS, the correct amazon.in domain, and a legitimate path structure.'
  },
  {
    id: 3, type: 'sms', isPhishing: true,
    content: 'SBI ALERT: Your A/C linked to Aadhaar is blocked. Share your OTP 7814 received on registered mobile to unblock: Call 9988774455',
    indicators: ['Banks NEVER ask you to "share an OTP"', 'OTP is already embedded in the message (social engineering)', 'Fake urgency: "blocked account"', 'Unknown phone number'],
    explanation: 'Real SBI alerts never share an OTP in the message and ask you to read it back. The scammer already has the OTP and is trying to verify it.'
  },
  {
    id: 4, type: 'url', isPhishing: true,
    content: 'http://193.148.22.10/sbi-internet-banking/login.php',
    indicators: ['Uses HTTP (not HTTPS)', 'Raw IP address instead of domain name', 'Fake SBI path on non-SBI server', 'No legitimate domain'],
    explanation: 'SBI Internet Banking always uses https://www.onlinesbi.sbi/ — never a raw IP address. This is classic phishing.'
  },
  {
    id: 5, type: 'email', isPhishing: false,
    content: 'From: no-reply@github.com\nSubject: [GitHub] Your SSH key was added\n\nHi username,\n\nA new SSH key was added to your account on March 26, 2026.\nIf you did not add this key, please remove it immediately.\n\nhttps://github.com/settings/ssh',
    indicators: [],
    explanation: 'This is a legitimate GitHub security notification. It comes from @github.com, links to github.com, and contains no urgency tactics or credential requests.'
  },
  {
    id: 6, type: 'sms', isPhishing: true,
    content: 'Congratulations! You have won ₹50,000 in KBC Lucky Draw 2024. To claim your prize send your bank A/C No, IFSC Code and Aadhaar number to: claim@kbc-lucky.com',
    indicators: ['Lottery/prize you never entered', 'Requests extremely sensitive bank + Aadhaar details', 'Unknown email domain (kbc-lucky.com)', 'KBC never contacts winners via SMS'],
    explanation: 'This is a lottery scam — a classic form of advance fee fraud. No legitimate prize requires you to share Aadhaar + bank account details over SMS.'
  },
  {
    id: 7, type: 'url', isPhishing: true,
    content: 'https://mlcrosoft.com/account/security-alert?verify=true&token=abc123',
    indicators: ['Typosquat: "mlcrosoft" ≠ "microsoft"', 'Suspicious query parameters', 'Security alert via URL is unusual'],
    explanation: 'This is a typosquatting attack — "mlcrosoft" is one letter off from "microsoft". Attackers register these to trick users who mistype.'
  },
  {
    id: 8, type: 'email', isPhishing: false,
    content: 'From: noreply@google.com\nSubject: Security alert — New sign-in on Chrome\n\nYour Google Account was just signed in on Chrome (Windows 11, India).\nIf this was you, you don\'t need to do anything.\nIf not, go to your Google Account → Security → Manage recent security activity.\nhttps://myaccount.google.com/security',
    indicators: [],
    explanation: 'This is a real Google security alert. It comes from @google.com, links only to myaccount.google.com, and doesn\'t ask for any credentials or OTPs.'
  },
];

const BADGES = [
  { score: 0,  label: 'Rookie',   color: 'text-slate-400',   bg: 'bg-slate-700',   emoji: '🎯' },
  { score: 40, label: 'Hunter',   color: 'text-blue-400',    bg: 'bg-blue-900/40',  emoji: '🔍' },
  { score: 60, label: 'Guardian', color: 'text-purple-400',  bg: 'bg-purple-900/40',emoji: '🛡️' },
  { score: 80, label: 'Elite',    color: 'text-yellow-400',  bg: 'bg-yellow-900/40',emoji: '⭐' },
  { score: 100,label: 'PhishPro', color: 'text-emerald-400', bg: 'bg-emerald-900/40',emoji: '🏆' },
];

function getBadge(pct: number) {
  return [...BADGES].reverse().find(b => pct >= b.score) || BADGES[0];
}

const TYPE_LABEL: Record<string, string> = { email: '✉️ Email', url: '🔗 URL', sms: '📱 SMS/Message' };

export default function TrainingMode() {
  const [started, setStarted] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; userAnswer: boolean }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState<boolean | null>(null);

  const q = QUESTIONS[qIdx];
  const score = answers.filter(a => a.correct).length;
  const pct = Math.round((score / QUESTIONS.length) * 100);
  const badge = getBadge(pct);

  function answer(isPhishing: boolean) {
    if (answered !== null) return;
    const correct = isPhishing === q.isPhishing;
    setAnswers(prev => [...prev, { correct, userAnswer: isPhishing }]);
    setAnswered(isPhishing);
  }

  function next() {
    if (qIdx + 1 >= QUESTIONS.length) { setShowResult(true); return; }
    setQIdx(i => i + 1);
    setAnswered(null);
  }

  function restart() { setStarted(false); setQIdx(0); setAnswers([]); setShowResult(false); setAnswered(null); }

  if (!started) return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40">
        <Brain className="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Phishing Training Mode</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">Test your ability to identify phishing attacks. Answer {QUESTIONS.length} questions — real and fake emails, URLs, and SMS messages.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGES.map(b => (
          <div key={b.label} className={`${b.bg} border border-slate-600/30 rounded-xl p-3 text-center`}>
            <p className="text-2xl mb-1">{b.emoji}</p>
            <p className={`text-xs font-bold ${b.color}`}>{b.label}</p>
            <p className="text-xs text-slate-500">{b.score}%+</p>
          </div>
        ))}
      </div>
      <button onClick={() => setStarted(true)} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-900/30 hover:opacity-90">
        🚀 Start Training
      </button>
    </div>
  );

  if (showResult) return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 text-center space-y-6">
      <div className={`w-20 h-20 ${badge.bg} rounded-2xl flex items-center justify-center mx-auto text-4xl border border-slate-600/30`}>{badge.emoji}</div>
      <div>
        <h2 className="text-3xl font-extrabold text-white">{score}/{QUESTIONS.length}</h2>
        <p className={`text-xl font-bold mt-1 ${badge.color}`}>{badge.label} — {pct}%</p>
        <p className="text-slate-400 text-sm mt-2">{pct >= 80 ? 'Excellent! You can spot phishing attacks very well.' : pct >= 60 ? 'Good job! Keep practising to improve.' : 'Keep learning — phishing can trick anyone!'}</p>
      </div>
      <div className="space-y-2">
        {answers.map((a, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${a.correct ? 'bg-emerald-950/30 border border-emerald-500/20' : 'bg-red-950/30 border border-red-500/20'}`}>
            {a.correct ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            <span className="text-sm text-slate-300">Q{i + 1}: {QUESTIONS[i].type.toUpperCase()}</span>
            <span className="text-xs text-slate-500 ml-auto">{a.correct ? 'Correct' : 'Incorrect'}</span>
          </div>
        ))}
      </div>
      <button onClick={restart} className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white font-bold text-sm hover:bg-slate-600">
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-300">Question {qIdx + 1} of {QUESTIONS.length}</span>
          <span className="text-sm font-bold text-purple-400">Score: {score}/{qIdx}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${((qIdx) / QUESTIONS.length) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold bg-slate-700 px-3 py-1 rounded-full text-slate-300">{TYPE_LABEL[q.type]}</span>
          <span className="text-xs text-slate-500">Is this phishing?</span>
        </div>

        {q.id === 1 ? (
          <div className="relative border-4 border-slate-700/50 rounded-xl overflow-hidden bg-white text-slate-900 mx-auto select-none max-w-2xl">
            {/* Mock Header */}
            <div className="bg-slate-100 border-b border-slate-200 p-4">
              <div 
                className="inline-block relative cursor-pointer"
                onClick={() => answer(true)}
              >
                <div className={`p-1 rounded ${answered !== null ? 'bg-red-500/20 ring-2 ring-red-500' : 'hover:bg-slate-200'}`}>
                  <span className="font-bold">From:</span> paypal-security@paypal-secure-login.net
                  {answered !== null && <span className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">1</span>}
                </div>
              </div>
              <div className="mt-2 text-xl font-bold">URGENT: Your PayPal account has been limited!</div>
            </div>
            {/* Mock Body */}
            <div className="p-8 space-y-4 text-base">
              <p>Dear Customer,</p>
              <p>We have detected suspicious activity on your account. 
                <span 
                  className={`inline-block relative cursor-pointer ml-1 ${answered !== null ? 'bg-red-500/20 ring-2 ring-red-500 rounded p-0.5' : 'hover:bg-slate-100 rounded'}`}
                  onClick={() => answer(true)}
                >
                  Click here to verify your identity within 24 hours
                  {answered !== null && <span className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">2</span>}
                </span>
                or your account will be permanently suspended.
              </p>
              <div className="mt-8 text-center pt-8">
                <button 
                  className={`relative cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg ${answered !== null ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-white' : ''}`}
                  onClick={() => answer(true)}
                >
                  VERIFY NOW
                  {answered !== null && <span className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">3</span>}
                </button>
                <div className={`mt-2 text-xs text-slate-400 font-mono ${answered !== null ? 'text-red-500 font-bold' : ''}`}>
                  Links to: http://paypal-verify-account.xyz/confirm
                </div>
              </div>
            </div>
            {answered === null && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 text-white px-6 py-3 rounded-full font-bold backdrop-blur-sm pointer-events-auto shadow-2xl animate-pulse ring-1 ring-white/20">
                  Click the red flags to analyze! 🎯
                </div>
              </div>
            )}
          </div>
        ) : (
          <pre className="text-sm text-slate-300 bg-slate-900/70 rounded-xl p-4 whitespace-pre-wrap font-mono border border-slate-700/50 max-h-56 overflow-y-auto">
            {q.content}
          </pre>
        )}

        {answered === null && q.id !== 1 ? (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => answer(true)}
              className="py-3 bg-red-600/30 border-2 border-red-500/50 text-red-400 font-extrabold rounded-xl text-sm hover:bg-red-600/50 hover:border-red-400 transition-all">
              ⚠️ PHISHING
            </button>
            <button onClick={() => answer(false)}
              className="py-3 bg-emerald-600/30 border-2 border-emerald-500/50 text-emerald-400 font-extrabold rounded-xl text-sm hover:bg-emerald-600/50 hover:border-emerald-400 transition-all">
              ✅ LEGITIMATE
            </button>
          </div>
        ) : answered !== null && (
          <div className={`rounded-xl p-4 border-2 mt-4 shadow-xl ${answered === q.isPhishing ? 'bg-emerald-950/40 border-emerald-500/40 shadow-emerald-500/10' : 'bg-red-950/40 border-red-500/40 shadow-red-500/10'}`}>
            <p className={`font-extrabold text-lg mb-2 flex items-center gap-2 ${answered === q.isPhishing ? 'text-emerald-400' : 'text-red-400'}`}>
              {answered === q.isPhishing ? '🎉 Correct Identify!' : '❌ Missed it!'}
            </p>
            <p className="text-sm text-slate-300 mb-4">{q.explanation}</p>
            {q.indicators.length > 0 && (
              <div className="space-y-2 bg-black/20 p-4 rounded-lg">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Red Flags:</p>
                {q.indicators.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-400 flex-shrink-0 font-bold">{i+1}.</span>{ind}
                  </div>
                ))}
              </div>
            )}
            <button onClick={next} className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-blue-900/40">
              {qIdx + 1 < QUESTIONS.length ? <><ChevronRight className="w-4 h-4" /> Next Simulation Round</> : <><Trophy className="w-4 h-4" /> See Score</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
