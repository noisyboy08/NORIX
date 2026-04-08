import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, RefreshCw, ThumbsUp } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveGeminiModels } from '../utils/gemini';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: Date;
  typing?: boolean;
}

type BotMode = 'unknown' | 'online' | 'quota_limited' | 'offline';

// Pre-defined expert responses for common questions (offline fallback)
const OFFLINE_KB: { q: RegExp; a: string }[] = [
  { q: /what is phishing/i, a: "**Phishing** is a cyberattack where criminals impersonate trusted entities (banks, PayPal, tax authorities) to trick you into revealing passwords, OTPs, or financial details.\n\nTypes:\n• **Email phishing** — fake emails with malicious links\n• **Vishing** — fraudulent phone calls\n• **Smishing** — fake SMS messages\n• **Quishing** — malicious QR codes" },
  { q: /otp|one.time.password/i, a: "🚨 **NEVER share your OTP** with anyone.\n\nHere's why:\n• OTPs are personal verification tokens — like a key to your account\n• Banks, PayPal, Amazon, and any legitimate service will **never** ask you to read back an OTP\n• If someone calls asking for your OTP, hang up immediately\n• The moment you share an OTP, attackers can access your account or authorize payments" },
  { q: /kyc|know your customer/i, a: "⚠️ **KYC Scam Alert!**\n\nGenuine KYC updates:\n✅ Are done through the **official bank app or website**\n✅ Never happen via phone calls from strangers\n✅ Never require sharing Aadhaar/PAN via WhatsApp\n\nIf someone calls saying your account is blocked and needs KYC urgently — it's a scam. Visit your bank branch directly." },
  { q: /vishing|voice.phishing|phone.scam/i, a: "**Vishing (Voice Phishing)** is when scammers call pretending to be:\n• Bank officials (\"SBI Fraud Department\")\n• Government authorities (RBI, Income Tax, Police)\n• Tech support (\"Microsoft has detected a virus\")\n\nRed flags:\n🚩 They create urgency or fear\n🚩 Ask for card numbers, OTPs, or remote access\n🚩 Offer unexpected refunds or prizes\n\n*Hang up and call back using the official number from the bank's website.*" },
  { q: /report.*fraud|file.*complaint|certify/i, a: "**How to report cybercrime in India:**\n\n1. **National Cybercrime Helpline:** Call **1930** (24×7)\n2. **Online:** [cybercrime.gov.in](https://cybercrime.gov.in)\n3. **Bank fraud:** Call your bank immediately to freeze the account\n4. **CERT-In:** report@cert-in.org.in\n5. **RBI Ombudsman:** For banking fraud\n\nAlways note: date/time, phone number, transaction ID, and any screenshots as evidence." },
  { q: /lottery|prize|won/i, a: "🎰 **Lottery Scam!**\n\nIf you receive a message saying you've won a prize in a contest you **never entered**, it's 100% a scam.\n\nHow they work:\n1. They say you've won ₹X lakhs or a phone/car\n2. They ask for a small 'processing fee' or your bank details to 'transfer' the prize\n3. They disappear with your money\n\n**Rule:** You cannot win a lottery you didn't buy a ticket for." },
  { q: /safe.*url|check.*link|how.*scan/i, a: "To check if a URL is safe:\n\n1. **Norix** — use the URL Scanner tab above!\n2. Look for **HTTPS** (padlock icon) — HTTP is unsafe\n3. Check the domain carefully — `paypa1.com` ≠ `paypal.com`\n4. Hover before clicking to see the real destination\n5. Never open links from unknown SMS/WhatsApp messages\n6. Use Google Safe Browsing: [transparencyreport.google.com](https://transparencyreport.google.com/safe-browsing)" },
];

function getOfflineResponse(text: string): string | null {
  const match = OFFLINE_KB.find(kb => kb.q.test(text));
  return match ? match.a : null;
}

async function callGemini(history: { role: string; text: string }[], message: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('No Gemini API key defined in .env! Add VITE_GEMINI_API_KEY to your env variables.');
  }

  const models = await resolveGeminiModels(GEMINI_API_KEY);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  let lastError: unknown = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction:
          'You are PhishBot, an expert cybersecurity AI assistant for Norix. Help users understand phishing, scams, and cybersecurity. Be concise, friendly and use emojis. Focus on protecting Indian users from common scams like KYC fraud, OTP scams, banking phishing, and lottery scams.',
      });
      const chat = model.startChat({
        history: history.map((h) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
      });
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (e: any) {
      lastError = e;
      const msg = String(e?.message || e);
      const shouldTryNext =
        msg.includes('404') ||
        msg.includes('429') ||
        msg.toLowerCase().includes('quota') ||
        msg.toLowerCase().includes('rate limit') ||
        msg.includes('not found') ||
        msg.includes('not supported') ||
        msg.includes('unsupported');
      if (!shouldTryNext) break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini request failed.');
}

function userFriendlyGeminiError(raw: unknown): string {
  const msg = String((raw as any)?.message || raw || '').toLowerCase();
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
    return 'Gemini quota/rate limit reached for this API key. Please wait a bit, switch key/project in Settings, or enable billing in Google AI Studio.';
  }
  if (msg.includes('401') || msg.includes('403') || msg.includes('api key')) {
    return 'Gemini key is invalid or lacks permission for this project.';
  }
  if (msg.includes('404') || msg.includes('not found') || msg.includes('not supported')) {
    return 'This key/project does not support the tried Gemini models on the current endpoint.';
  }
  return 'Could not reach Gemini right now.';
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

const SUGGESTED = [
  'What is phishing?',
  'Should I share my OTP?',
  'How do I report cybercrime?',
  'What is a KYC scam?',
  'How to check if a URL is safe?',
];

export default function PhishBot() {
  const [apiKey, setApiKey] = useState(GEMINI_API_KEY || localStorage.getItem('pg-gemini-key') || '');
  const [showConfig, setShowConfig] = useState(!GEMINI_API_KEY && !localStorage.getItem('pg-gemini-key'));
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'bot',
    text: "👋 Hi! I'm **PhishBot** — your AI cybersecurity assistant.\n\nI can help you:\n• Understand phishing & scams\n• Identify suspicious messages\n• Learn how to stay safe online\n• Guide you to report fraud\n\nWhat would you like to know?",
    time: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [botMode, setBotMode] = useState<BotMode>('unknown');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: msg, time: new Date() };
    const typingMsg: Message = { id: 'typing', role: 'bot', text: '…', time: new Date(), typing: true };
    setMessages(prev => [...prev, userMsg, typingMsg]);
    setLoading(true);

    let response = getOfflineResponse(msg);
    if (response) setBotMode('offline');
    if (!response) {
      if (!apiKey) {
        setBotMode('offline');
        response = `⚠️ **No Gemini API Key found.**\n\nPlease click the Settings icon ⚙️ above to enter your Google Gemini API key to enable AI responses.`;
      } else {
        try {
          const prevHistory = messages
            .filter((m) => !m.typing && m.id !== 'welcome')
            .map((h) => ({ role: h.role, text: h.text }));
          // Keep local setting in sync for helper path that also reads env/localStorage.
          localStorage.setItem('pg-gemini-key', apiKey);
          response = await callGemini(prevHistory, msg);
          setBotMode('online');
        } catch (e: any) {
          console.error(e);
          const emsg = String(e?.message || e || '').toLowerCase();
          if (emsg.includes('429') || emsg.includes('quota') || emsg.includes('rate limit')) {
            setBotMode('quota_limited');
          } else {
            setBotMode('offline');
          }
          response = `⚠️ API Error: ${userFriendlyGeminiError(e)}\n\nFalling back to offline rules for known scams.`;
        }
      }
    }

    setMessages(prev => [...prev.filter(m => m.id !== 'typing'), {
      id: Date.now().toString(), role: 'bot', text: response!, time: new Date()
    }]);
    setLoading(false);
  }

  function saveKey(key: string) {
    setApiKey(key);
    localStorage.setItem('pg-gemini-key', key);
    setBotMode('unknown');
    setShowConfig(false);
  }

  function clear() { setMessages(m => [m[0]]); }

  return (
    <div className="flex flex-col h-[600px] bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/40 to-indigo-900/40">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-white text-sm">PhishBot</p>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                botMode === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : botMode === 'quota_limited'
                    ? 'bg-amber-400'
                    : botMode === 'offline'
                      ? 'bg-slate-500'
                      : 'bg-blue-400'
              }`}
            />
            <p className="text-xs text-slate-400">
              {botMode === 'online'
                ? 'Online (Gemini)'
                : botMode === 'quota_limited'
                  ? 'Quota limited — fallback active'
                  : botMode === 'offline'
                    ? 'Offline fallback'
                    : 'AI Cybersecurity Assistant'}
            </p>
          </div>
        </div>
        <button onClick={() => setShowConfig(!showConfig)} className="text-slate-500 hover:text-slate-300 p-1 mr-1" title="Configure API Key">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </button>
        <button onClick={clear} className="text-slate-500 hover:text-slate-300 p-1" title="Clear Chat"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* API Key Config */}
      {showConfig && (
        <div className="bg-slate-900 border-b border-slate-700/50 p-4">
          <p className="text-xs text-slate-400 mb-2 font-bold">Configure Google Gemini API Key</p>
          <div className="flex gap-2">
            <input 
              type="password"
              placeholder="AIzaSy..."
              defaultValue={apiKey}
              onBlur={(e) => saveKey(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
            />
            <button onClick={() => setShowConfig(false)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">Save</button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 hover:underline">Google AI Studio</a>. Key is securely stored in your browser's LocalStorage.</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}>
              {msg.role === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-3 ${msg.role === 'bot' ? 'bg-slate-900/70 border border-slate-700/50' : 'bg-blue-600 text-white'} ${msg.typing ? 'animate-pulse' : ''}`}>
              <p className={`text-sm leading-relaxed ${msg.role === 'bot' ? 'text-slate-200' : ''}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
              <p className={`text-xs mt-1 ${msg.role === 'bot' ? 'text-slate-500' : 'text-blue-200'}`}>
                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-xs px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-full hover:bg-slate-700 hover:text-white transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 p-4 border-t border-slate-700/50">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask PhishBot anything about scams…"
          className="flex-1 px-4 py-2.5 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm" />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
