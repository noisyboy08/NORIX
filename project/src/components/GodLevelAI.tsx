import { useState } from 'react';
import { 
  Brain, Target, Activity, Network, ShieldAlert, AlertTriangle, 
  TrendingUp, Clock, UserCheck, Flame, Zap, Shield, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 1. Cognitive Attack Intelligence (Mind-Hacking AI)
// ============================================================================
export function CognitiveAttackDetector() {
  const [text, setText] = useState('Your bank account will be PERMANENTLY BLOCKED in 1 hour if you do not complete your KYC verification immediately! Click here to unblock: http://sbi-secure-update.com');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setResult({
        fear: 92,
        urgency: 98,
        authority: 75,
        greed: 10,
        type: 'Fear + Extreme Urgency Manipulation',
        impact: 'High Emotional Pressure',
        verdict: '⚠️ Cognitive Threat Detected - Attempt to bypass logical thinking.'
      });
      setAnalyzing(false);
    }, 1800);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Cognitive Attack Intelligence</h2>
          <p className="text-xs text-slate-400">Mind-Hacking Detection: Analyze psychological manipulation.</p>
        </div>
      </div>

      <textarea 
        value={text} 
        onChange={e => setText(e.target.value)} 
        rows={4} 
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500 mb-3" 
      />
      <button 
        onClick={analyze} disabled={!text || analyzing}
        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20"
      >
        {analyzing ? 'Scanning Human Vulnerability Triggers...' : 'Analyze Cognitive Threat'}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-5 space-y-4">
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl">
              <p className="font-bold text-red-400 text-sm mb-1">{result.verdict}</p>
              <p className="text-xs text-slate-300">Type: <strong className="text-white">{result.type}</strong></p>
              <p className="text-xs text-slate-300">User Impact: <strong className="text-rose-400">{result.impact}</strong></p>
            </div>
            <div className="space-y-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <CognitiveBar label="Fear Pressure" value={result.fear} color="bg-red-500" />
              <CognitiveBar label="Urgency/Time Pressure" value={result.urgency} color="bg-orange-500" />
              <CognitiveBar label="Authority Impersonation" value={result.authority} color="bg-blue-500" />
              <CognitiveBar label="Greed/Reward Trap" value={result.greed} color="bg-emerald-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CognitiveBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div initial={{width:0}} animate={{width:`${value}%`}} transition={{duration:1}} className={`h-full ${color}`} />
      </div>
    </div>
  );
}

// ============================================================================
// 2. Human Vulnerability Prediction Engine
// ============================================================================
export function HumanVulnerabilityEngine() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Vulnerability Prediction</h2>
          <p className="text-xs text-slate-400">Predicts user susceptibility to scams based on behavior.</p>
        </div>
      </div>

      <div className="flex items-center gap-6 p-5 bg-slate-900/60 rounded-xl border border-slate-700/50 mb-5">
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="40" stroke="#f43f5e" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * 76) / 100} className="transition-all duration-1000" />
          </svg>
          <div className="absolute text-xl font-extrabold text-white">76<span className="text-xs">%</span></div>
        </div>
        <div>
          <h3 className="text-rose-500 font-bold text-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> High Risk User</h3>
          <p className="text-xs text-slate-400 mt-1">AI predicts you are highly likely to click urgency-based phishing links due to impulsive click behavior.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><Clock className="w-3 h-3 text-orange-400"/> Avg Response Time</div>
          <p className="text-sm font-bold text-white">2.4 seconds <span className="text-[10px] text-red-400 ml-1">(Too fast)</span></p>
        </div>
        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><Activity className="w-3 h-3 text-emerald-400"/> Past Interactions</div>
          <p className="text-sm font-bold text-white">3 Phishing Clicks <span className="text-[10px] text-slate-500 ml-1">last 30d</span></p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. Pre-Attack Threat Prediction
// ============================================================================
export function PreAttackPrediction() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Pre-Attack Prediction System</h2>
          <p className="text-xs text-slate-400">Forecasting cyber attacks before they reach your inbox.</p>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-r from-orange-950/40 to-red-950/40 border border-orange-500/30 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold bg-orange-600 text-white px-2 py-0.5 rounded flex items-center gap-1 opacity-90">
            <Flame className="w-3 h-3" /> REGIONAL THREAT ALERT
          </span>
          <span className="text-[10px] text-orange-300 font-bold">Prediction Confidence: 94%</span>
        </div>
        <h3 className="text-base font-bold text-white mb-2">Surge in fake "Income Tax Refund" & "KYC Updates" expected.</h3>
        <p className="text-xs text-orange-200/70 mb-4">
          Global attack data indicates a 340% spike in SMS smishing attacks targeting users in your region within the next 48 hours. Ensure your auto-blocker is enabled.
        </p>
        
        <div className="h-24 flex items-end gap-1.5 opacity-80 mt-2">
          {[12, 18, 24, 39, 42, 65, 85, 95, 120, 150].map((h, i) => (
            <motion.div key={i} initial={{height:0}} animate={{height:`${(h/150)*100}%`}} transition={{delay: i*0.05}} className="flex-1 bg-orange-500 rounded-t-sm" />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-orange-400 font-bold mt-1 uppercase">
          <span>7 Days Ago</span>
          <span>Predicted Tomorrow</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. Digital Identity Twin
// ============================================================================
export function DigitalIdentityTwin() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Digital Identity Twin Shield</h2>
          <p className="text-xs text-slate-400">Behavioral AI model of your digital fingerprint.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 p-4 bg-slate-900 border border-slate-700 rounded-xl">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Established Baseline</p>
          <ul className="text-xs space-y-2 text-slate-300">
            <li className="flex justify-between">Amazon & Flipkart <span className="text-blue-400">92%</span></li>
            <li className="flex justify-between">HDFC Netbanking <span className="text-blue-400">Normal</span></li>
            <li className="flex justify-between">Login Time <span className="text-blue-400">9AM-10PM</span></li>
          </ul>
        </div>
        
        <div className="flex-1 p-4 bg-red-950/20 border border-red-500/30 rounded-xl relative">
          <ShieldAlert className="absolute top-2 right-2 w-4 h-4 text-red-500 opacity-50" />
          <p className="text-[10px] text-red-400 font-bold uppercase mb-2">Live Anomaly</p>
          <ul className="text-xs space-y-2 text-slate-300">
            <li className="flex justify-between">Crypto DEX Site <span className="text-red-400 font-bold">New</span></li>
            <li className="flex justify-between">Login Time <span className="text-red-400 font-bold">3:14 AM</span></li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg">
        <p className="font-bold text-red-400 text-sm">⚠️ Identity Behavior Mismatch</p>
        <p className="text-xs text-slate-300">This action strongly deviates from your digital twin signature. Transaction blocked pending manual 2FA verification.</p>
      </div>
    </div>
  );
}

// ============================================================================
// 5. Trust Graph AI
// ============================================================================
export function TrustGraphAI() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 lg:col-span-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Trust Graph AI Engine</h2>
              <p className="text-xs text-slate-400">Global network-based reputation tracking matrix.</p>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/connected-points.png')]" />
            <div className="relative z-10 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full border-4 border-red-500/30 flex items-center justify-center bg-slate-800 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <span className="text-xl font-black text-red-400">28<span className="text-[10px]">%</span></span>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">support@paypal-secure-server.net</p>
                <div className="flex gap-2 mb-2">
                  <span className="text-[9px] bg-red-950 text-red-400 px-2 py-0.5 rounded uppercase font-bold border border-red-500/20">Low Trust Sender</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold border border-slate-700">Level 4 Threat</span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-red-400" /> Flagged by 4,392 users in the Trust Graph network.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between items-center text-xs p-2 bg-slate-800/80 rounded block">
            <span className="text-slate-400">Community Reports</span>
            <span className="font-bold text-red-400">🔥 Very High</span>
          </div>
          <div className="flex justify-between items-center text-xs p-2 bg-slate-800/80 rounded block">
            <span className="text-slate-400">Sender IPs Linked</span>
            <span className="font-bold text-amber-400">14 Blacklisted</span>
          </div>
          <div className="flex justify-between items-center text-xs p-2 bg-slate-800/80 rounded block">
            <span className="text-slate-400">Domain Age Trust</span>
            <span className="font-bold text-red-400">2 Days (Zero)</span>
          </div>
          <div className="flex justify-between items-center text-xs p-2 bg-slate-800/80 rounded block">
            <span className="text-slate-400">Interaction Patterns</span>
            <span className="font-bold text-slate-300">Spike Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Dashboard Export
// ============================================================================
export default function GodLevelAI() {
  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 p-6 shadow-2xl mb-6">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg flex-shrink-0">
            <Zap className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">God-Level Intelligence Suite</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
              Analyzing human brain targeting, predicting vulnerabilities, and tracking identity twins. 
              This is not just detecting text—this is understanding human psychology.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CognitiveAttackDetector />
        <HumanVulnerabilityEngine />
        <PreAttackPrediction />
        <DigitalIdentityTwin />
        <TrustGraphAI />
      </div>
    </div>
  );
}
