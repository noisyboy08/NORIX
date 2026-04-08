import { useState } from 'react';
import { Box, FileLock, Mail, CloudOff, Globe, Timer, DownloadCloud } from 'lucide-react';

export default function SandboxSuite() {
  const [activeTab, setActiveTab] = useState('browser');

  const tabs = [
    { id: 'browser', label: 'Isolated Browser', icon: Globe },
    { id: 'file', label: 'File Viewer', icon: FileLock },
    { id: 'email', label: 'Disposable Email', icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-500/20 flex rounded-xl items-center justify-center">
            <Box className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">SquareX-Style Sandbox</h2>
            <p className="text-sm text-slate-400">Open links, files, and emails in a secure, isolated cloud environment.</p>
          </div>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6 max-w-xl border border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'browser' && <IsolatedBrowser />}
        {activeTab === 'file' && <DisposableFile />}
        {activeTab === 'email' && <DisposableEmail />}
      </div>
    </div>
  );
}

// ─── Browser Component ───────────────────────────────────────
function IsolatedBrowser() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
      <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
        <Globe className="text-blue-400" /> Start Isolated Cloud Session
      </h3>
      <p className="text-sm text-slate-400 mb-6">Open suspicious URLs safely. No cookies, no storage, real IP hidden.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Region</label>
          <select className="w-full bg-slate-800 border-none text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500">
            <option>US East (N. Virginia)</option>
            <option>UK (London)</option>
            <option>Singapore</option>
            <option>Brazil (São Paulo)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Session Time</label>
          <select className="w-full bg-slate-800 border-none text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500">
            <option>10 Minutes (Default)</option>
            <option>30 Minutes</option>
            <option>60 Minutes (Max)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <input 
          placeholder="https://suspicious-link.com"
          className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
          <CloudOff className="w-5 h-5" /> Open Sandbox
        </button>
      </div>
    </div>
  );
}

// ─── File Component ──────────────────────────────────────────
function DisposableFile() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
      <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
        <FileLock className="text-emerald-400" /> Disposable File Viewer
      </h3>
      <p className="text-sm text-slate-400 mb-6">Safely view and interact with PDFs, DOCX, or media without infecting your PC. Macros and malware are neutralized.</p>

      <div className="border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-8 text-center bg-slate-800/30 transition-colors">
        <DownloadCloud className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-white font-bold mb-1">Drag & Drop suspicious file here</p>
        <p className="text-xs text-slate-400 mb-4">Supports PDF, DOCX, XLSX, MP4, EXE (Analysis)</p>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-lg">
          Browse Files
        </button>
      </div>
    </div>
  );
}

// ─── Email Component ─────────────────────────────────────────
function DisposableEmail() {
  const [email] = useState(`user-${Math.floor(Math.random() * 90000) + 10000}@norix-temp.net`);
  
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
      <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
        <Mail className="text-pink-400" /> Burner Email Inbox
      </h3>
      <p className="text-sm text-slate-400 mb-6">Generate a temporary inbox to avoid spam and track phishing attempts safely.</p>
      
      <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl mb-6 border border-slate-700">
        <input 
          readOnly 
          value={email}
          className="flex-1 bg-transparent px-3 py-2 text-white font-mono text-sm focus:outline-none"
        />
        <button className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-pink-500/20">
          Copy
        </button>
      </div>

      <div className="bg-slate-800/80 rounded-xl h-48 flex flex-col items-center justify-center border border-slate-700 border-dashed">
        <Timer className="w-8 h-8 text-slate-500 mb-2 animate-pulse" />
        <p className="text-sm text-slate-400 font-medium">Waiting for incoming emails...</p>
        <p className="text-xs text-slate-500 mt-1">Inbox automatically shreds after 10 minutes</p>
      </div>
    </div>
  );
}
