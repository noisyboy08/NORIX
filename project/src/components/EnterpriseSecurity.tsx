import { useState } from 'react';
import { Shield, Fingerprint, Lock, Activity, EyeOff, Radio, Server, CheckCircle } from 'lucide-react';

export default function EnterpriseSecurity() {
  const [bdrEnabled, setBdrEnabled] = useState(true);
  const [dlpEnabled, setDlpEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <Shield className="text-teal-400" /> Enterprise Security Dashboard
        </h2>
        <p className="text-sm text-slate-400 mb-6">Advanced configurations for Browser Detection & Response (BDR), Data Loss Prevention (DLP), and Private Access.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* BDR - Browser Detection & Response */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-teal-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Activity className="text-teal-400 w-5 h-5"/> BDR (Browser Detection)
              </h3>
              <button 
                onClick={() => setBdrEnabled(!bdrEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${bdrEnabled ? 'bg-teal-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${bdrEnabled ? 'left-5' : 'left-0.5'}`}/>
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4 h-10">Actively hunt for malicious extensions, phishing scripts, and browser-level attacks.</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded-lg text-sm">
                <span className="text-slate-300">Extensions Scanned</span>
                <span className="font-bold text-teal-400">12</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded-lg text-sm">
                <span className="text-slate-300">Malicious Behavior Blocks</span>
                <span className="font-bold text-red-400">0</span>
              </div>
            </div>
          </div>

          {/* DLP - Data Loss Prevention */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <EyeOff className="text-purple-400 w-5 h-5"/> Data Loss Prevention (DLP)
              </h3>
              <button 
                onClick={() => setDlpEnabled(!dlpEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${dlpEnabled ? 'bg-purple-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${dlpEnabled ? 'left-5' : 'left-0.5'}`}/>
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4 h-10">Automatically prevent the sharing of Passwords, OTPs, and Credit Card numbers to untrusted domains.</p>
            <div className="flex gap-2 mb-3">
              {['Passwords', 'OTP', 'Credit Cards'].map((tag) => (
                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Real-time clipboard interception active.
            </div>
          </div>

          {/* Extension Analysis */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 transition-colors">
            <h3 className="font-bold text-white flex items-center gap-2 mb-3">
              <Fingerprint className="text-indigo-400 w-5 h-5"/> Extension Analysis Framework
            </h3>
            <p className="text-sm text-slate-400 mb-4 h-10">Run static & dynamic analysis on installed Chrome extensions for spyware patterns.</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
              Run Forensic Scan
            </button>
            <div className="mt-3 text-xs text-center text-slate-500">
              Last scan: 3 hours ago. All safe.
            </div>
          </div>

          {/* Secure Private Access (ZTNA) */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-orange-500/50 transition-colors">
            <h3 className="font-bold text-white flex items-center gap-2 mb-3">
              <Lock className="text-orange-400 w-5 h-5"/> Secure Private Access
            </h3>
            <p className="text-sm text-slate-400 mb-4 h-10">Zero Trust Network Access (ZTNA) to internal enterprise apps without a VPN.</p>
            
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase">Gateway Status</p>
                <p className="text-sm font-semibold text-orange-400 flex items-center gap-1 mt-0.5">
                  <Radio className="w-3 h-3 animate-pulse" /> Connecting...
                </p>
              </div>
              <Server className="w-6 h-6 text-slate-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
