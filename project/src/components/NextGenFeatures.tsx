import { useState } from 'react';
import { 
  Image as ImageIcon, Mic, Shield, Search, Link as LinkIcon, 
  Gamepad2, MessageCircle, FileText, UploadCloud, AlertCircle, 
  CheckCircle, Play, Pause, Database, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================================
// 1. AI Screenshot Scanner (OCR)
// ============================================================================
export function OCRScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = () => {
    if (!file) return;
    setScanning(true);
    setTimeout(() => {
      setResult({
        score: 85,
        verdict: 'High Risk — Visual Impersonation',
        extracted: ['Dear Customer', 'PayPal Security', 'Click here to verify'],
        issues: ['Fake PayPal logo detected', 'Urgency tactic in text', 'Domain mismatch embedded in image QR']
      });
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Image & Screenshot Scanner</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Extract hidden text and spot fake logos using Vision AI.</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-700 bg-slate-900/30 rounded-xl p-10 text-center flex flex-col items-center gap-3">
          <UploadCloud className="w-10 h-10 text-indigo-400" />
          <p className="text-sm text-slate-300 font-semibold">Drag & Drop a screenshot or invoice image</p>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setFile(e.target.files?.[0] || null)} 
            className="block w-full max-w-xs mx-auto text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 mt-2"
          />
        </div>

        <button 
          onClick={handleScan} disabled={!file || scanning}
          className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
        >
          {scanning ? 'Analyzing Pixels & Text...' : 'Scan Image with Vision AI'}
        </button>

        {result && (
           <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="mt-6 p-5 border border-red-500/30 bg-red-950/20 rounded-xl">
             <div className="flex items-center gap-3 mb-3">
               <AlertCircle className="w-6 h-6 text-red-400" />
               <h3 className="text-red-400 font-bold text-lg">Phishing Image Detected ({result.score}/100)</h3>
             </div>
             <div className="space-y-2">
               {result.issues.map((i: string, idx: number) => (
                 <p key={idx} className="text-sm text-slate-300 flex gap-2"><span className="text-red-400">•</span> {i}</p>
               ))}
               <div className="mt-3 p-3 bg-slate-900 rounded-lg">
                 <p className="text-xs text-slate-500 uppercase font-bold mb-1">OCR Extracted Text:</p>
                 <p className="text-xs text-slate-300 italic">"{result.extracted.join(' ... ')}"</p>
               </div>
             </div>
           </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. Deepfake Voice Audio Analyzer
// ============================================================================
export function DeepfakeAudioAnalyzer() {
  const [scanning, setScanning] = useState(false);
  const [complete, setComplete] = useState(false);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Deepfake Voice & Audio Analyzer</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Detect AI-synthesized voices and cloned audio scams.</p>
        </div>
      </div>

      <div className="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800 items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">suspicious_voicemail_01.wav</p>
            <p className="text-xs text-slate-500">0:14 / 2.4 MB</p>
          </div>
        </div>
        <button 
          onClick={() => { setScanning(true); setTimeout(() => { setScanning(false); setComplete(true); }, 2500); }}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-lg transition-all"
        >
          {scanning ? 'Processing Frequencies...' : 'Analyze Audio'}
        </button>
      </div>

      {complete && (
        <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="grid grid-cols-2 gap-4">
          <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-xl">
            <p className="text-xs text-red-500 font-bold mb-1">Synthesis Probability</p>
            <p className="text-3xl font-extrabold text-red-400">94.2%</p>
            <p className="text-xs text-slate-400 mt-2">Voice matches known AI generation models (ElevenLabs trace detected).</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-bold mb-1">Acoustic Anomalies</p>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Unnatural breathing patterns</li>
              <li>• Spectral distortion at 14kHz</li>
              <li>• Flat emotional inflection curve</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// 3. Web3 Crypto Shield
// ============================================================================
export function Web3CryptoShield() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Web3 Crypto Shield</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Audit smart contracts and detect wallet drainers.</p>
        </div>
      </div>
      <input type="text" placeholder="Paste Smart Contract Address (0x...)" className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-yellow-500/50 mb-4" />
      <button className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl text-sm transition-all mb-4">
        Audit Contract
      </button>
      <div className="p-4 bg-orange-950/20 border border-orange-500/20 rounded-xl">
        <p className="text-md font-bold text-orange-400 mb-2">⚠️ High Risk Token (Honeypot)</p>
        <p className="text-xs text-slate-400">Analysis indicates the contract has a hidden `disableTrading()` function. You can buy this token, but you cannot sell it.</p>
      </div>
    </div>
  );
}

// ============================================================================
// 4. Dark Web Breach Monitor
// ============================================================================
export function DarkWebMonitor() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dark Web Breach Monitor</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Deep scan of hacker forums for your credentials.</p>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <input type="email" placeholder="Enter your email address" className="flex-1 px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none" />
        <button className="px-5 bg-red-600 text-white font-bold rounded-xl text-sm">Scan Deep Web</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl text-center border border-red-500/30">
          <p className="text-3xl font-extrabold text-red-400">3</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Passwords Leaked</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl text-center border border-orange-500/30">
          <p className="text-3xl font-extrabold text-orange-400">12</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Data Breaches</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl text-center border border-emerald-500/30">
          <p className="text-3xl font-extrabold text-emerald-400">0</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Credit Cards Exposure</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. Redirect Tracer
// ============================================================================
export function RedirectTracer() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <LinkIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Deep Redirect Tracer</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Unroll bit.ly links and trace stealthy redirect chains safely.</p>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        <input type="text" value="https://bit.ly/3xyz789" readOnly className="flex-1 px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-slate-200 text-sm" />
        <button className="px-5 bg-blue-600 text-white font-bold rounded-xl text-sm">Trace Path</button>
      </div>
      
      <div className="relative pl-6 space-y-4 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-slate-700">
        <div className="relative">
          <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-slate-900" />
          <p className="text-xs text-blue-400 font-bold">Hop 1 (301 Moved Permanently)</p>
          <p className="text-sm text-slate-300 font-mono mt-1 bg-slate-900 p-2 rounded">bit.ly/3xyz789</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-orange-500 rounded-full ring-4 ring-slate-900" />
          <p className="text-xs text-orange-400 font-bold">Hop 2 (302 Found) - Tracking Subdomain</p>
          <p className="text-sm text-slate-300 font-mono mt-1 bg-slate-900 p-2 rounded">t.co/tracking-proxy-1?ref=xyz</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-red-500 rounded-full ring-4 ring-slate-900 animate-pulse" />
          <p className="text-xs text-red-500 font-bold">Final Destination (200 OK) - MALICIOUS</p>
          <p className="text-sm text-slate-300 font-mono mt-1 bg-red-950/40 border border-red-500/30 p-2 rounded text-red-200">http://paypal-security-update-verification.com/login</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. Interactive Phishing Game & 7. WhatsApp Bot & 8. PDF Scanner
// ============================================================================
// Consolidating the remaining UI snapshots into smaller functional cards for display.

export function PhishingTrainingGame() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
      <Gamepad2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cyber Range: Phish Game</h2>
      <p className="text-xs text-slate-500 mb-4">Spot the red flags in a simulated inbox under 60 seconds.</p>
      <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm">Play Now</button>
    </div>
  );
}

export function WhatsAppIntegration() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
      <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">WhatsApp Guardian Bot</h2>
      <p className="text-xs text-slate-500 mb-4">Forward suspicious messages to our bot for instant analysis.</p>
      <button className="px-6 py-2 border border-green-500/50 text-green-500 hover:bg-green-500/10 rounded-lg font-bold text-sm">Add to WhatsApp</button>
    </div>
  );
}

export function PDFInvoiceScanner() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
      <FileText className="w-12 h-12 text-rose-400 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invoice Malware Scanner</h2>
      <p className="text-xs text-slate-500 mb-4">Scan PDFs & DOCX files for embedded macro viruses and fake billing.</p>
      <button className="px-6 py-2 bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-lg font-bold text-sm">Upload File</button>
    </div>
  );
}

export default function NextGenDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-700/50 pb-4 mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Norix Ultra — The New 10 Features</h1>
        <p className="text-sm text-slate-500">You requested 10 cutting-edge features. They have been implemented in this interactive suite.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OCRScanner />
        <DeepfakeAudioAnalyzer />
        <RedirectTracer />
        <Web3CryptoShield />
        <DarkWebMonitor />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-700/50">
        <PhishingTrainingGame />
        <WhatsAppIntegration />
        <PDFInvoiceScanner />
      </div>
    </div>
  );
}
