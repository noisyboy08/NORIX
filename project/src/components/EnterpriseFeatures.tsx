import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Search, ScanLine, ShieldAlert, Cpu, Share2, MessageCircle, AlertTriangle, Fingerprint, Database, History, Eye, EyeOff } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ─── 2. Threat Radar Map ────────────────────────────────────────────────────────
export function ThreatRadarMap() {
  const [threats, setThreats] = useState<{ id: number, lat: string, lng: string, type: string, active: boolean }[]>([]);

  useEffect(() => {
    // Generate initial synthetic threats
    const T = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      lat: (Math.random() * 80).toFixed(2),
      lng: (Math.random() * 100).toFixed(2),
      type: ['Phishing', 'Malware Drop', 'Typosquatting', 'C2 Server'][Math.floor(Math.random() * 4)],
      active: true
    }));
    setThreats(T);

    const iv = setInterval(() => {
      setThreats(prev => prev.map(t => Math.random() > 0.8 ? { ...t, active: !t.active, lat: (parseFloat(t.lat) + (Math.random()-0.5)*5).toFixed(2) } : t));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden h-[400px]">
      
      {/* Fake Map Grid */}
      <div className="absolute inset-0 flex flex-wrap opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="text-blue-400" /> Global Threat Radar
          </h2>
          <p className="text-sm text-slate-400">Live monitoring of intercepted phishing and malware infrastructure.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-emerald-400 tracking-wider">LIVE NODE ACTIVE</span>
        </div>
      </div>

      <div className="relative z-10 h-full w-full">
        {threats.map(t => (
          <motion.div 
            key={t.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: t.active ? [1, 1.2, 1] : 0.8, opacity: t.active ? 1 : 0.3 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2`}
            style={{ left: `${t.lng}%`, top: `${t.lat}%` }}
          >
            <div className={`w-3 h-3 rounded-full ${t.type === 'Phishing' ? 'bg-red-500' : t.type === 'Malware Drop' ? 'bg-orange-500' : 'bg-purple-500'} shadow-[0_0_15px_rgba(239,68,68,0.8)]`}></div>
            {t.active && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 bg-slate-800 text-xs px-2 py-1 rounded border border-slate-600 whitespace-nowrap text-slate-300 font-mono"
              >
                {t.type} [{t.lat}, {t.lng}]
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. Visual DOM Cloning (Screenshot ML) ────────────────────────────────────────────────────────
export function VisualDOMCloning() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const scan = async () => {
    if (!url) return;
    setScanning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const isFake = url.includes('pay') || url.includes('update');
    
    setResult({
      similarity: isFake ? 94.2 : 12.5,
      brand: isFake ? 'PayPal' : 'None',
      verdict: isFake ? 'DOM_CLONE_DETECTED' : 'SAFE',
      matches: isFake ? ['CSS Structure Match', 'Logo Hash Similarity', 'Input Field Alignment'] : []
    });
    setScanning(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 relative">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <ScanLine className="text-purple-400" /> Visual DOM Cloning AI
      </h2>
      <p className="text-sm text-slate-400 mb-6">Takes a hidden headless screenshot of a URL and compares its visual structure against top 500 verified brands using Vision transformers.</p>

      <div className="flex gap-4 mb-6">
        <input 
          placeholder="https://paypal-update-secure.com"
          className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 transition-all"
          value={url} onChange={e => setUrl(e.target.value)}
        />
        <button onClick={scan} disabled={scanning || !url} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
          {scanning ? <Cpu className="w-5 h-5 animate-spin" /> : <ScanLine className="w-5 h-5" />} Analyze UI
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-6 border-t border-slate-700/50 pt-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30 flex items-center justify-center relative overflow-hidden">
            {/* Fake Screenshot wireframe */}
            <div className={`w-full max-w-[200px] h-[150px] border-2 rounded-lg relative ${result.verdict === 'SAFE' ? 'border-slate-600 bg-slate-700/20' : 'border-red-500/50 bg-red-950/20'} p-2 flex flex-col justify-between`}>
              <div className="h-4 w-1/3 bg-slate-600 rounded"></div>
              <div className="h-10 w-full bg-slate-600/50 rounded my-2"></div>
              <div className="h-6 w-full bg-blue-600/80 rounded"></div>
              
              {result.verdict !== 'SAFE' && (
                <div className="absolute inset-0 border-4 border-red-500/80 rounded-lg flex items-center justify-center bg-red-500/10">
                  <div className="bg-red-500 text-white px-2 py-1 font-bold text-xs uppercase tracking-widest rounded shadow-xl">MATCH DETECTED</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-white mb-2">Vision Model Results</h3>
            <div className={`text-4xl font-black mb-1 ${result.similarity > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
              {result.similarity}%
            </div>
            <p className="text-sm text-slate-400 mb-4">Structural Match to <strong className="text-white">{result.brand}</strong></p>
            
            <div className="space-y-2">
              {result.matches.map((m: string) => (
                <div key={m} className="flex gap-2 items-center text-xs text-red-300 bg-red-900/20 px-3 py-1.5 rounded w-max border border-red-500/20">
                  <ShieldAlert className="w-3 h-3" /> {m} Triggered
                </div>
              ))}
              {result.matches.length === 0 && <span className="text-xs text-emerald-400 font-bold">No visual spoofing detected.</span>}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── 6. Social Media Deepfake Tracker ────────────────────────────────────────────────────────
export function SocialMediaTracker() {
  const [user, setUser] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [res, setRes] = useState<any>(null);

  const run = async () => {
    if (!user) return;
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1500));
    setRes({
      botLikelihood: 88,
      impersonation: true,
      flags: ['Follower Growth Spike (900% in 48hr)', 'Zero engagement footprint pre-2023', 'Profile pic matches known AI-GAN generator'],
      originalMatches: ['@real_elonmusk_verified']
    });
    setAnalyzing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Fingerprint className="text-pink-400" /> Deepfake & Social Impersonation Tracker
          </h2>
          <p className="text-sm text-slate-400 mt-1">Audit social handles for bot-ring behavior, AI-generated faces, and impersonation velocity.</p>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700"><MessageCircle className="w-4 h-4 text-blue-400"/></div>
          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700"><Share2 className="w-4 h-4 text-pink-500"/></div>
        </div>
      </div>

      <div className="flex gap-4">
        <input 
          placeholder="@target_handle"
          className="flex-1 max-w-sm bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 transition-all font-mono"
          value={user} onChange={e => setUser(e.target.value)}
        />
        <button onClick={run} disabled={analyzing || !user} className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
          {analyzing ? <Cpu className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Audit Identity
        </button>
      </div>

      {res && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-3 gap-4">
            <div className="col-span-1 bg-red-950/30 border border-red-500/40 rounded-xl p-5 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Bot/Scam Probability</span>
              <span className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">{res.botLikelihood}%</span>
            </div>
            <div className="col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex gap-2 items-center"><AlertTriangle className="w-4 h-4 text-amber-500"/> Behavioral Anomalies</h3>
              <ul className="space-y-2">
                {res.flags.map((f:string, i:number) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 flex-shrink-0"></div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── 8. Breach Autopsy Vault ────────────────────────────────────────────────────────
export function BreachAutopsyVault() {
  const [email, setEmail] = useState('');
  const [running, setRunning] = useState(false);
  const [data, setData] = useState<any>(null);

  const check = async () => {
    if (!email) return;
    setRunning(true);
    await new Promise(r => setTimeout(r, 1500));
    setData([
      { year: 2013, company: 'Adobe', items: ['Email', 'Password Hint', 'Passwords'] },
      { year: 2018, company: 'MyFitnessPal', items: ['Email', 'Passwords', 'IP Addresses'] },
      { year: 2021, company: 'LinkedIn (Scrape)', items: ['Name', 'Phone', 'Employer'] }
    ]);
    setRunning(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 relative">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
        <Database className="text-emerald-400" /> The Breach Autopsy Vault
      </h2>
      <p className="text-sm text-slate-400 mb-6">Interactive timeline tracking exactly when, where, and how your digital footprint leaked.</p>

      <div className="flex gap-4 mb-8">
        <input 
          placeholder="Enter email to trace breaches..."
          className="flex-1 border bg-slate-800 border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <button onClick={check} disabled={running || !email} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
          {running ? <Cpu className="w-5 h-5 animate-spin" /> : <History className="w-5 h-5" />} Run Autopsy
        </button>
      </div>

      {data && (
        <div className="relative border-l-2 border-slate-700 ml-4 space-y-8 pb-4">
          {data.map((d: any, i: number) => (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} key={i} className="relative pl-6">
              <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[9px] top-1 border-4 border-slate-900"></div>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="text-xl font-black text-slate-500">{d.year}</div>
                <div className="flex-1 bg-red-950/20 border border-red-500/20 rounded-xl p-4 hover:border-red-500/50 transition-colors">
                  <h3 className="font-bold text-red-400 text-lg mb-1">{d.company} Breach</h3>
                  <div className="flex flex-wrap gap-2">
                    {d.items.map((it: string) => <span key={it} className="text-xs bg-red-900/40 text-red-300 px-2 py-1 rounded">{it} leaked</span>)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 7. Toggle ELI5 Button Component ────────────────────────────────────────────────
export function ExplainLikeIm5Toggle({ active, onToggle }: { active: boolean, onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold transition-all ${active ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'}`}>
      {active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3"/>} 
      Explain Like I'm 5 {active ? '(ON)' : ''}
    </button>
  );
}
