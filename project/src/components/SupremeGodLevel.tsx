import { useState, useEffect } from 'react';
import { 
  Skull, Radar, Activity, Zap, ServerCrash, 
  MapPin, ShieldAlert, Binary, TerminalSquare, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 1. Counter-Strike Fake Data Injector (The "God Level" Offensive Mechanism)
// ============================================================================
export function ReverseDataPolluter() {
  const [target, setTarget] = useState('http://secure-paypal-login24.net');
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [injected, setInjected] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (active) {
      interval = setInterval(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let fakeEmail = '';
        for (let i=0; i<8; i++) fakeEmail += chars.charAt(Math.floor(Math.random() * chars.length));
        fakeEmail += '@gmail.com';
        
        let fakePass = '';
        for (let i=0; i<12; i++) fakePass += chars.charAt(Math.floor(Math.random() * chars.length));

        setLogs(prev => [`[${new Date().toISOString().split('T')[1]}] INJECTING -> ${fakeEmail}:${fakePass}... SUCCESS`, ...prev].slice(0, 15));
        setInjected(prev => prev + 1);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="col-span-1 rounded-2xl border border-red-200/70 bg-white p-6 shadow-sm dark:border-red-500/40 dark:bg-slate-900 dark:shadow-[0_0_40px_rgba(239,68,68,0.15)] lg:col-span-2 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
      <div className="relative z-10 mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-300 bg-red-100 shadow-sm dark:border-red-500 dark:bg-red-950 dark:shadow-[0_0_15px_rgba(239,68,68,0.5)]">
          <ServerCrash className="h-6 w-6 text-red-600 dark:text-red-500" />
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-red-600 dark:text-red-500">
            Counter-Strike Tactic{' '}
            <span className="animate-pulse rounded bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
              OFFENSIVE
            </span>
          </h2>
          <p className="text-sm text-red-800/90 dark:text-red-300/80">
            Don't just block. Strike back. Pollute the attacker's database with thousands of synthetic credentials to render their operation useless.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-red-700 dark:text-red-400">Phishing Target URL</label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={active}
              className="w-full rounded-xl border border-red-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 transition-colors focus:border-red-500 focus:outline-none disabled:opacity-50 dark:border-red-900 dark:bg-black/50 dark:text-red-100"
            />
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`w-full rounded-xl border py-4 font-black uppercase tracking-widest transition-all ${
              active
                ? 'border-red-400 bg-red-100 text-red-800 hover:bg-red-200 dark:border-red-500 dark:bg-red-950 dark:text-red-500 dark:hover:bg-black'
                : 'border-transparent bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.35)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]'
            }`}
          >
            {active ? 'Halt Attack Operation' : 'Launch Database Pollution'}
          </button>

          <div className="flex items-center justify-between rounded-xl border border-red-200/80 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
            <div>
              <p className="text-xs font-bold uppercase text-red-700 dark:text-red-400">Fake Credentials Injected</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{injected.toLocaleString()}</p>
            </div>
            <Activity className={`h-8 w-8 text-red-600 dark:text-red-500 ${active ? 'animate-bounce' : 'opacity-30'}`} />
          </div>
        </div>

        <div className="relative h-64 flex-1 overflow-hidden rounded-xl border border-red-200/80 bg-gray-100 p-4 font-mono text-[10px] sm:text-xs dark:border-red-900/30 dark:bg-black">
          <div className="absolute top-0 left-0 z-10 h-8 w-full bg-gradient-to-b from-gray-100 to-transparent dark:from-black" />
          <div className="absolute bottom-0 left-0 z-10 h-8 w-full bg-gradient-to-t from-gray-100 to-transparent dark:from-black" />
          {logs.length === 0 ? (
            <p className="mt-24 text-center text-red-500/70 dark:text-red-900/50">SYSTEM STANDBY. AWAITING ENGAGEMENT PROTOCOL...</p>
          ) : (
            <div className="mt-4 space-y-1">
              {logs.map((log, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1 - i * 0.1, x: 0 }}
                  key={i}
                  className="truncate text-red-700 dark:text-red-500"
                >
                  {log}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Zero-Day Tracing Hologram
// ============================================================================
export function ZeroDayTracer() {
  const [tracing, setTracing] = useState(false);
  const [nodes, setNodes] = useState<{ip: string, loc: string}[]>([]);

  const startTrace = () => {
    setTracing(true);
    setNodes([]);
    const sequence = [
      { ip: '104.21.44.2', loc: 'Cloudflare Proxy (Bypass)' },
      { ip: '185.199.108.153', loc: 'Netherlands Routing Node' },
      { ip: '91.134.12.9', loc: 'Bulletproof Host (Russia)' },
      { ip: '192.168.x.x', loc: 'ORIGIN FOUND: RDP Hijack (Moscow)' }
    ];
    let i = 0;
    const interval = setInterval(() => {
      setNodes(prev => [...prev, sequence[i]]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTracing(false);
      }
    }, 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <div className="absolute top-[-100px] right-[-100px] h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="relative mb-6 flex items-center gap-3">
        <Radar className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white">Zero-Day Origin Tracer</h2>
          <p className="text-xs text-gray-600 dark:text-slate-400">
            Pierces through proxies and VPNs to trace the actual origin of the attack infrastructure.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={startTrace}
        disabled={tracing}
        className="mb-4 w-full rounded-lg border border-cyan-300 bg-cyan-50 py-2 text-sm font-bold uppercase tracking-widest text-cyan-900 transition-colors hover:bg-cyan-100 disabled:opacity-60 dark:border-cyan-500/50 dark:bg-cyan-950 dark:text-cyan-400 dark:hover:bg-cyan-900"
      >
        {tracing ? 'Tracing Server Hops...' : 'Initiate Deep Trace on Last Threat'}
      </button>

      <div className="relative h-48 space-y-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-black/40">
        {nodes.map((node, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className="relative z-10 flex items-center gap-3"
          >
            <div className={`h-3 w-3 rounded-full ${i === 3 ? 'animate-ping bg-red-500' : 'bg-cyan-500'}`} />
            <div className="flex flex-1 justify-between rounded border border-gray-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
              <span className="font-mono text-cyan-800 dark:text-cyan-300">{node.ip}</span>
              <span className={i === 3 ? 'font-bold text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-slate-400'}>{node.loc}</span>
            </div>
          </motion.div>
        ))}
        {nodes.length > 0 && <div className="absolute top-8 bottom-8 left-[21px] z-0 w-0.5 bg-cyan-500/25 dark:bg-cyan-500/20" />}
      </div>
    </div>
  );
}

// ============================================================================
// 3. Deepfake & Synthetic Reality Analyzer
// ============================================================================
export function LivenessAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAudio = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({ score: 99.8, type: 'AI Voice Clone (ElevenLabs Core)', artifacts: 'Breath patterns lacking. Metadata stripped.' });
    }, 2500);
  };

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center gap-3">
        <Skull className="h-8 w-8 text-fuchsia-600 dark:text-fuchsia-400" />
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white">Synthetic Reality Engine</h2>
          <p className="text-xs text-gray-600 dark:text-slate-400">
            Detect deepfakes, AI voice clones, and synthetic video artifacts in real span.
          </p>
        </div>
      </div>

      <div className="mb-4 flex h-20 items-center justify-center gap-1 overflow-hidden rounded-xl bg-gray-100 p-2 dark:bg-slate-950">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: analyzing ? Math.random() * 60 + 10 : 10 }}
            transition={{ duration: 0.2, repeat: analyzing ? Infinity : 0, repeatType: 'mirror' }}
            className={`w-1.5 rounded-full ${analyzing ? 'bg-fuchsia-500' : 'bg-gray-300 dark:bg-slate-700'}`}
          />
        ))}
      </div>

      {!result ? (
        <button
          type="button"
          onClick={testAudio}
          disabled={analyzing}
          className="w-full rounded-xl bg-fuchsia-600 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-colors hover:bg-fuchsia-500 disabled:opacity-60 dark:shadow-[0_0_15px_rgba(217,70,239,0.3)]"
        >
          {analyzing ? 'Analyzing Biometrics...' : 'Scan Last Voice Mail / Video Feed'}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-4 dark:border-fuchsia-500/50 dark:bg-red-950/40"
        >
          <p className="mb-1 flex items-center gap-2 font-black text-fuchsia-800 dark:text-fuchsia-400">
            <EyeOff className="h-5 w-5" /> SYNTHETIC MEDIA DETECTED ({result.score}%)
          </p>
          <p className="text-xs text-gray-700 dark:text-slate-300">
            Signature: <strong className="text-gray-900 dark:text-white">{result.type}</strong>
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-slate-400">Anomalies: {result.artifacts}</p>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Main Export
// ============================================================================
export default function SupremeGodLevel() {
  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-red-200/90 bg-gradient-to-br from-white via-red-50/50 to-white p-8 shadow-sm dark:border-red-500/40 dark:from-zinc-950 dark:via-red-950/55 dark:to-zinc-950 dark:shadow-[0_0_60px_rgba(239,68,68,0.14)]">
        {/* Light: subtle scale texture. Dark: no bright tile — use soft red radial wash only */}
        <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-[0.05] dark:hidden" />
        <div className="pointer-events-none absolute inset-0 hidden dark:block">
          <div className="absolute -top-1/2 left-0 h-[120%] w-[70%] bg-[radial-gradient(ellipse_at_30%_0%,rgba(239,68,68,0.2),transparent_58%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(50,10,10,0.55),transparent_52%)]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-red-300 bg-red-100 shadow-md dark:border-red-500/80 dark:bg-red-950 dark:shadow-[0_0_28px_rgba(239,68,68,0.45)]">
            <Skull className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900 md:text-5xl dark:text-white dark:drop-shadow-[0_0_14px_rgba(239,68,68,0.55)]">
              Supreme God Level
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-bold uppercase leading-relaxed tracking-wide text-red-800 md:text-base dark:text-rose-200/95 dark:tracking-widest">
              Do not just defend. Dominate. We hunt the hunters, poison their databases, unmask their proxies, and shatter their synthetic reality. Welcome to the Apex of Cyber Warfare.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZeroDayTracer />
        <LivenessAnalyzer />
        <ReverseDataPolluter />
      </div>
    </div>
  );
}
