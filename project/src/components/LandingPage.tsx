import { useState, useEffect, useRef, type ComponentType } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Shield, Zap, Lock, Eye, Globe, ArrowRight,
  CheckCircle, Star, ChevronDown, Menu, X, Download,
  MessageSquare, Mail, Phone, Smartphone, Puzzle,
  BarChart3, Users, Flag, Brain, Bell, Cpu,
  Sun, Moon, Plus, Minus, Bot, Search, Database, Activity
} from 'lucide-react';

// ── Typed colours helper
function useC(isDark: boolean) {
  return {
    bg:        isDark ? 'bg-[#0a0a0b]'          : 'bg-[#f8f7f4]',
    text:      isDark ? 'text-white'        : 'text-gray-900',
    muted:     isDark ? 'text-gray-400'     : 'text-gray-500',
    border:    isDark ? 'border-white/10'   : 'border-gray-200',
    card:      isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200',
    inputBg:   isDark ? 'bg-black/50'       : 'bg-gray-50',
    sectionBg: isDark ? 'bg-white/[0.03]'  : 'bg-white',
  };
}

// ── AnimatedCounter
function Counter({ n, suf = '' }: { n: number; suf?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let s = 0; const step = n / 120;
    const t = setInterval(() => { s += step; if (s >= n) { setV(n); clearInterval(t); } else setV(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [inView, n]);
  return <span ref={ref}>{v.toLocaleString()}{suf}</span>;
}

// ── FAQ Row
function FaqRow({ q, a, open, toggle, isDark }: { q: string; a: string; open: boolean; toggle: () => void; isDark: boolean }) {
  return (
    <div className={`border-b py-5 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
      <button className="flex w-full items-center justify-between gap-4 text-left" onClick={toggle}>
        <span className="font-medium text-[15px]">{q}</span>
        {open ? <Minus className="w-4 h-4 flex-shrink-0 opacity-50" /> : <Plus className="w-4 h-4 flex-shrink-0 opacity-50" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className={`overflow-hidden pt-3 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Dashboard Mockup (hero)
import { useMotionValue, useTransform } from 'framer-motion';

function DashMockup({ isDark }: { isDark: boolean }) {
  const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [4, -4]);
  const rotateY = useTransform(x, [-300, 300], [-4, 4]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0); y.set(0);
  }

  // AI Typing Effect
  const [typedText, setTypedText] = useState('');
  useEffect(() => {
    const text = "OTP scam — banks never ask for OTP via SMS.";
    let i = 0;
    let timer: any;
    
    const typeWriter = () => {
      if (i <= text.length) {
        setTypedText(text.substring(0, i));
        i++;
        timer = setTimeout(typeWriter, 50);
      } else {
        timer = setTimeout(() => { i = 0; typeWriter(); }, 3000); // Wait 3s then loop
      }
    };
    
    timer = setTimeout(typeWriter, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "rounded-[0.75rem] border overflow-hidden shadow-2xl transition-all duration-200 ease-out",
        isDark ? "bg-[#09090b] border-white/10 shadow-black/80" : "bg-white border-zinc-200 shadow-zinc-200/50"
      )}
    >
      {/* Search Header */}
      <div className={cn(
        "flex items-center gap-4 px-4 py-3 border-b text-sm transition-colors",
        isDark ? "border-white/10" : "border-zinc-200"
      )}>
        <div className="flex gap-1.5 shadow-sm rounded-full bg-zinc-100 dark:bg-zinc-800 p-0.5">
           <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
           <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
           <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className={cn(
          "flex-1 font-mono text-xs flex items-center justify-center py-1.5 rounded-md",
          isDark ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"
        )}>
          app.norix.ai
        </div>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* App Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 min-h-[360px] pointer-events-none">
        
        {/* Sidebar */}
        <div className={cn(
          "col-span-2 border-r p-4 hidden md:block",
          isDark ? "border-white/10" : "border-zinc-200"
        )}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className={cn("font-bold text-sm tracking-tight", isDark ? "text-zinc-100" : "text-zinc-900")}>Norix</span>
          </div>
          <div className="space-y-1">
            {['Universal','URL Scan','Email','SMS/OTP','Dashboard','Extension'].map((item, i) => (
              <div key={item} className={cn(
                "text-[11px] font-medium py-2 px-3 rounded-md cursor-pointer transition-colors",
                i === 0 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : isDark 
                    ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" 
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              )}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div className="col-span-12 md:col-span-7 p-6 space-y-5">
          {/* Main Card */}
          <div className={cn(
            "rounded-xl border p-5 transition-colors",
            isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-zinc-50/50"
          )}>
            <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-3", isDark ? "text-blue-400" : "text-blue-600")}>
              Universal Scanner
            </h3>
            <div className={cn(
              "rounded-md border px-4 py-2.5 font-mono text-xs mb-4 w-full truncate",
              isDark ? "border-zinc-800 bg-[#09090b] text-zinc-400" : "border-zinc-200 bg-white text-zinc-500 shadow-sm"
            )}>
              https://paypal-secure-update.xyz/login
            </div>
            
            {/* Risk Indicator */}
            <div className={cn(
              "rounded-lg border p-4 shadow-sm",
              isDark ? "border-red-900/50 bg-red-950/20" : "border-red-100 bg-red-50/50"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Phishing Detected</span>
                </div>
                <div className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">
                  87<span className="text-sm font-medium opacity-50">/100</span>
                </div>
              </div>
              <div className="h-2 w-full bg-red-200 dark:bg-red-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: '87%' }} />
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '1,247', label: 'Threats Today', color: 'text-red-600 dark:text-red-400' },
              { value: '99.4%', label: 'Accuracy', color: 'text-emerald-600 dark:text-emerald-400' },
              { value: '891', label: 'Blocked', color: 'text-blue-600 dark:text-blue-400' }
            ].map((stat, i) => (
              <div key={i} className={cn(
                "rounded-xl border p-4 flex flex-col justify-center items-center h-[90px] shadow-sm transition-colors",
                isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-white"
              )}>
                <div className={cn("text-xl font-black tracking-tight", stat.color)}>{stat.value}</div>
                <div className={cn("text-[10px] font-medium mt-1 uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 md:col-span-3 p-4 border-l border-white/5 dark:border-white/10 hidden lg:block">
          
          <div className={cn(
            "rounded-xl border p-4 mb-4 shadow-sm transition-colors",
            isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-white"
          )}>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Feed</div>
            </div>
            <div className="space-y-3">
              {[
                { domain: 'paypal-secure.xyz', score: 94 },
                { domain: 'sbi-kyc-update.in', score: 88 },
                { domain: 'amazon-prize.club', score: 96 }
              ].map((site) => (
                <div key={site.domain} className="flex justify-between items-center text-[10px]">
                  <span className={cn("font-medium truncate pr-2", isDark ? "text-zinc-400" : "text-zinc-600")}>{site.domain}</span>
                  <span className="font-bold text-red-500">{site.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "rounded-xl border p-4 shadow-sm transition-colors",
            isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-white"
          )}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
              Phishbot AI
            </div>
            <div className="space-y-2">
              <div className={cn(
                "text-[10px] p-2.5 rounded-lg leading-relaxed",
                isDark ? "bg-indigo-500/10 text-indigo-300" : "bg-indigo-50 text-indigo-700"
              )}>
                Is this SBI SMS real?
              </div>
              <div className={cn(
                "text-[10px] p-2.5 rounded-lg leading-relaxed flex items-start gap-1.5 min-h-[44px]",
                isDark ? "bg-zinc-800/80 text-zinc-300" : "bg-zinc-100 text-zinc-700"
              )}>
                <span className="text-amber-500 mt-0.5">⚠</span> 
                {typedText}
                <span className="w-1 h-3 bg-indigo-500 animate-pulse inline-block ml-0.5 align-middle" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

interface LandingFeature {
  badge: string;
  icon: ComponentType<{ className?: string }>;
  serif: string;
  sans: string;
  desc: string;
  cta: string;
  cta2?: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  flip: boolean;
}

function FeatureSectionRow({
  feature,
  idx,
  sectionId,
  isDark,
  onEnterApp,
}: {
  feature: LandingFeature;
  idx: number;
  sectionId?: string;
  isDark: boolean;
  onEnterApp: () => void;
}) {
  const { badge, icon: Icon, serif, sans, desc, cta, quote, author, role, company, flip } = feature;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section id={sectionId} ref={ref} className={`py-20 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <motion.div initial={{ opacity:0, x: flip ? 40 : -40 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ duration:0.7 }} className={flip ? 'lg:order-2' : 'lg:order-1'}>
          <div className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest mb-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            <Icon className="w-3.5 h-3.5" />{badge}
          </div>
          <h2 className={`text-3xl sm:text-4xl leading-tight mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="serif-italic">{serif}</span><br />
            <span className="font-extrabold">{sans}</span>
          </h2>
          <p className={`text-lg leading-relaxed mb-7 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
          <button onClick={onEnterApp} className={`inline-flex items-center gap-2 text-sm font-semibold border px-5 py-2.5 rounded-lg transition-all hover:gap-3 ${isDark ? 'border-white/20 text-white hover:bg-white/5' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}>
            {cta} <ArrowRight className="w-4 h-4" />
          </button>
          <div className={`mt-9 pl-5 border-l-2 border-blue-500`}>
            <p className={`text-sm italic leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>"{quote}"</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">{author.split(' ').map(w=>w[0]).join('')}</div>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{author}</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{role} · {company}</span>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity:0, x: flip ? -40 : 40 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ duration:0.7, delay:0.1 }} className={flip ? 'lg:order-1' : 'lg:order-2'}>
          <div className={`rounded-2xl border overflow-hidden shadow-xl ${isDark ? 'border-white/10 bg-gray-950 shadow-black/40' : 'border-gray-200 bg-white shadow-gray-200/40'}`}>
            <div className={`px-4 py-2.5 border-b flex items-center gap-2 ${isDark ? 'border-white/10 bg-black/60' : 'border-gray-100 bg-gray-50'}`}>
              <span className="w-2 h-2 rounded-full bg-red-400" /><span className="w-2 h-2 rounded-full bg-yellow-400" /><span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className={`text-[10px] font-semibold ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{badge}</span>
            </div>
            <div className="p-5 space-y-3 min-h-[200px]">
              <div className={`rounded-xl border p-3 ${isDark ? 'border-white/10 bg-black/40' : 'border-gray-100 bg-gray-50'}`}>
                <div className={`text-[9px] font-bold mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{badge.toUpperCase()}</div>
                <div className={`font-mono text-[11px] ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Feature #{idx + 1} — {sans}</div>
              </div>
              <div className={`rounded-xl border p-4 ${isDark ? 'border-red-500/20 bg-red-950/20' : 'border-red-100 bg-red-50'}`}>
                <div className="text-[10px] font-bold text-red-500 mb-2">⚠ THREAT INTELLIGENCE ACTIVE</div>
                <div className="flex gap-2">
                  {['ML Check','Domain','GeoIP','Cloud AI'].map((s,i) => (
                    <div key={s} className="flex-1 text-center">
                      <div className={`text-[9px] rounded px-1 py-1 mb-1 font-bold ${i < 3 ? 'bg-red-500 text-white' : isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>✓</div>
                      <div className={`text-[8px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-2`}>
                {[['Score','87/100','text-red-400'],['Status','BLOCKED','text-red-400']].map(([l,v,c]) => (
                  <div key={l} className={`rounded-lg border p-2 text-center ${isDark ? 'border-white/10 bg-black/30' : 'border-gray-100'}`}>
                    <div className={`text-sm font-black ${c}`}>{v}</div>
                    <div className={`text-[8px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Main
export default function LandingPage({ activeTab = 'landing', navigate, onEnterApp }: { activeTab?: string, navigate?: (v: string) => void, onEnterApp: () => void }) {
  const [theme, setTheme] = useState<'dark'|'light'>(() => (localStorage.getItem('pg-landing-theme') as any) || 'light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number|null>(null);
  const isDark = theme === 'dark';
  const C = useC(isDark);

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 30); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);
  const toggle = () => { const n = isDark ? 'light' : 'dark'; setTheme(n); localStorage.setItem('pg-landing-theme', n); };

  const navLinks = [['Features','features'],['Extension','extension'],['Pricing','pricing'],['About','about']];

  // Visibility logic for separate pages
  const showHome = activeTab === 'landing';
  const showFeatures = showHome || activeTab === 'features';
  const showExtension = activeTab === 'extension';
  const showPricing = showHome || activeTab === 'pricing';
  const showAbout = showHome || activeTab === 'about';

  const features: LandingFeature[] = [
    { badge:'AI Detection', icon: Search,  serif:'Intelligent scanning,',       sans:'for your most critical threats.',    desc:'URL, email, SMS, phone, and voice — scanned by offline ML + cloud AI fusion with 99.4% accuracy.',  cta:'Explore scanner',        quote:'Norix caught a spear-phishing email that passed our enterprise gateway.',              author:'Aditya Kumar',     role:'Cybersecurity Analyst', company:'Infosys', flip:false },
    { badge:'Conversational AI', icon: Bot, serif:'Conversational security,',    sans:'for daily questions from your team.',desc:'Ask PhishBot anything in plain language — paste suspicious content and get expert analysis instantly powered by Gemini AI.', cta:'Try PhishBot',cta2:'', quote:'I pasted a fake SBI SMS and PhishBot flagged it 98/100 with full breakdown. My colleagues were amazed.',  author:'Priya Sharma',     role:'Banking Professional',  company:'HDFC',    flip:true  },
    { badge:'Chrome Extension', icon: Puzzle, serif:'Real-time protection,',    sans:'always watching silently.',          desc:'Auto-scans every page, highlights risky links in-line, blocks 80+ ad networks, and shows a floating risk score badge — no clicks needed.', cta:'Install extension',quote:'The extension caught a pixel-perfect fake PayPal page. The red badge saved me from a major attack.',   author:'Mark Thompson',    role:'IT Administrator',      company:'TechCorp',flip:false },
    { badge:'Analytics & Intelligence', icon: BarChart3, serif:'Beautiful analytics,', sans:'for complete threat visibility.', desc:'Six live charts, global threat origin maps, top attack vectors, daily trends — your security posture at a glance.', cta:'Open dashboard', quote:"The bulk scanner processed 500 URLs in 60 seconds and exported a CSV. We use it daily for threat hunting.", author:'Ravi Verma', role:'SOC Lead', company:'SecureNet',flip:true  },
  ];

  const faqs = [
    ['What is Norix?', 'Norix is a 25-feature cognitive phishing defense platform detecting threats across URLs, emails, SMS, phone calls, and voice — powered by offline ML and cloud AI fusion.'],
    ['How accurate is the detection?','Our ensemble model achieves 99.4% accuracy, combining local ML, RDAP domain intelligence, IP geolocation, and optional Gemini cloud AI.'],
    ['Does it work without internet?','Yes. An offline-first ML engine runs entirely in your browser. Cloud AI is optional enhancement, not a requirement.'],
    ['What threats can it detect?','URL phishing, email impersonation, OTP scams, vishing, SMS fraud, fake websites, brand cloning, deepfake voices, and crypto wallet drainers.'],
    ['How does the Chrome Extension work?','It auto-scans every page, highlights suspicious links, blocks 80+ ad networks, and shows a floating risk score — all in real-time.'],
    ['Is my data private?','Your content never leaves your device in offline mode. In cloud mode only hashed URL representations are sent. We are k-anonymity compliant.'],
    ["What makes Norix different?",'We are the only tool with a Fairness & Ethics Audit, Supreme God Level counter-offensive database pollution, campaign fingerprinting, and deepfake voice detection.'],
    ['Is there a free version?','Yes! All 25 features are free forever. Pro adds bulk scanning, team dashboards, real-time threat feeds, and CSV/PDF exports.'],
  ];

  const integrations = [
    { title:'Chrome Extension', desc:'Auto-scan every page you visit with in-line threat badges.', icon: Puzzle, color:'bg-yellow-500' },
    { title:'Gmail Intelligence', desc:'Analyze sender trust, typosquatting, and header anomalies.', icon: Mail, color:'bg-red-500' },
    { title:'Supabase Database', desc:'Store threat history, user stats, and real-time breach feeds.', icon: Database, color:'bg-emerald-500' },
    { title:'Norix API', desc:'Integrate phishing detection into any app via REST API.', icon: Globe, color:'bg-blue-500' },
    { title:'WhatsApp Bot', desc:'Forward suspicious messages to our bot for instant analysis.', icon: MessageSquare, color:'bg-green-500' },
    { title:'Webhooks & SIEM', desc:'Push real-time threat events to your existing security stack.', icon: Activity, color:'bg-purple-500' },
  ];

  const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

  return (
    <div className={`${C.bg} ${C.text} min-h-screen overflow-x-hidden relative`} style={{ fontFamily:"'Inter',system-ui,sans-serif", transition:'background 0.3s, color 0.3s' }}>
      
      {/* Background Dot Grid */}
      <div className={cn(
        "fixed inset-0 z-0 pointer-events-none bg-[length:24px_24px] transition-opacity",
        isDark 
          ? "bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.03]" 
          : "bg-[radial-gradient(#000000_1px,transparent_1px)] opacity-[0.05]"
      )} />

      {/* ── Marquee bar ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        .serif-italic { font-family:'Instrument Serif',Georgia,serif; font-style:italic; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .marquee { animation:marquee 30s linear infinite; display:flex; width:max-content; }
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="bg-blue-600 text-white text-[11px] font-semibold py-2 overflow-hidden relative z-10">
        <div className="marquee gap-16">
          {[...Array(4)].map((_,i) => (
            <span key={i} className="flex items-center gap-10 pr-10">
              <span>🛡️ Norix v3.0 — Supreme God Level Counter-Offensive AI</span>
              <span>🚀 50,000+ security professionals protected</span>
              <span>🏆 SDG 9 &amp; SDG 16 aligned initiative</span>
              <span>🔐 99.4% phishing detection accuracy</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? (isDark ? 'bg-black/95 backdrop-blur-xl border-b border-white/10' : 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm') : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-[15px]">Norix</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(([l,h]) => (
              <button key={l} onClick={() => navigate?.(h)} className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${activeTab === h ? (isDark ? 'text-white bg-white/10' : 'text-gray-900 bg-gray-200') : (isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}`}>{l}</button>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggle} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate?.('auth')} className={`text-[13px] font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Log in</button>
            <button onClick={() => navigate?.('auth')} className={`text-[13px] font-semibold px-4 py-1.5 rounded-lg border transition-all ${isDark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'}`}>
              Get started
            </button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggle} className={`p-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className={isDark ? 'text-gray-400' : 'text-gray-600'}>{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              className={`md:hidden border-t overflow-hidden ${isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(([l,h]) => <button key={l} onClick={() => { setMobileOpen(false); navigate?.(h); }} className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'}`}>{l}</button>)}
                <div className="pt-2 space-y-2">
                  <button onClick={() => { setMobileOpen(false); navigate?.('auth'); }} className={`w-full text-sm py-2.5 rounded-lg border text-center font-semibold ${isDark ? 'border-white text-white' : 'border-gray-900 bg-gray-900 text-white'}`}>Log in / Get started</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ── */}
      {showHome && (
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="inline-flex items-center gap-1.5 mb-8">
            <span className={`text-[12px] font-medium px-3 py-1.5 rounded-full border ${isDark ? 'border-white/20 text-gray-300 bg-white/5' : 'border-gray-300 text-gray-600 bg-white shadow-sm'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
              World's First Cognitive Phishing Defense
            </span>
          </motion.div>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <h1 className={`serif-italic text-5xl sm:text-6xl lg:text-[72px] leading-[1.05] tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              The AI Phishing Defense
            </h1>
            <h1 className={`text-5xl sm:text-6xl lg:text-[72px] font-black leading-[1.05] tracking-tight mt-1 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              for your whole team.
            </h1>
          </motion.div>

          <motion.p initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className={`text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Finally — anyone in your team can stay safe from phishing across URLs, emails, SMS, and voice calls in one integrated platform.
          </motion.p>

          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button onClick={onEnterApp} className={`px-7 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${isDark ? 'border-white bg-white text-black hover:bg-gray-100' : 'border-gray-900 bg-gray-900 text-white hover:bg-gray-700'}`}>
              Get started for free
            </button>
            <button onClick={onEnterApp} className={`px-7 py-3 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 ${isDark ? 'border-white/20 text-white hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              Try Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.4 }} className="max-w-5xl mx-auto relative">
          <DashMockup isDark={isDark} />
          <motion.div animate={{ y:[-6,6,-6] }} transition={{ duration:3, repeat:Infinity }} className="absolute -left-6 top-1/3 hidden lg:block">
            <div className={`rounded-xl border p-3 shadow-xl ${isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200 shadow-gray-200'}`}>
              <div className="text-red-500 font-black text-lg">87</div><div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Risk Score</div>
            </div>
          </motion.div>
          <motion.div animate={{ y:[6,-6,6] }} transition={{ duration:3.5, repeat:Infinity }} className="absolute -right-6 top-1/4 hidden lg:block">
            <div className={`rounded-xl border p-3 shadow-xl ${isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200 shadow-gray-200'}`}>
              <div className="text-emerald-500 text-[10px] font-bold">✅ SAFE</div><div className={`text-[8px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Extension active</div>
            </div>
          </motion.div>
        </motion.div>
      </section>
      )}

      {/* ── Trusted by ── */}
      {showHome && (
      <section className={`py-14 border-t border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <p className={`text-center text-[11px] font-bold uppercase tracking-widest mb-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>✦ Trusted by security professionals worldwide ✦</p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
            {['Cybersecurity Teams','Banking Sector','IT Administrators','CERT Teams','Fintech Security','Healthcare IT','Government Agencies','NGO Defenders'].map(o => (
              <span key={o} className={`text-sm font-bold tracking-tight ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{o}</span>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Feature Sections ── */}
      {(showFeatures || showExtension) && features.filter((_,i) => showExtension ? i === 2 : true).map((feature, idx) => (
        <FeatureSectionRow
          key={feature.badge}
          feature={feature}
          idx={idx}
          sectionId={idx === 1 ? 'extension' : undefined}
          isDark={isDark}
          onEnterApp={onEnterApp}
        />
      ))}

      {/* ── Stats ── */}
      {showHome && (
      <section id="stats" className={`py-20 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="max-w-5xl mx-auto px-4 text-center mb-12">
          <h2 className={`text-3xl sm:text-4xl leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="serif-italic">Loved by</span> <span className="font-extrabold">the best security teams</span>
          </h2>
          <p className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Norix helps teams of all sizes secure their digital lives.</p>
        </div>
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[[50000,'+','Users Protected','text-blue-500'],[2400000,'+','Threats Detected','text-red-500'],[99,'%','Detection Accuracy','text-emerald-500'],[25,'+','AI Features','text-purple-500']].map(([n,s,l,c]) => (
            <div key={l as string}>
              <div className={`text-4xl font-black ${c}`}><Counter n={n as number} suf={s as string} /></div>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{l as string}</p>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* ── Integration Grid ── */}
      {showFeatures && (
      <section id="features" className={`py-20 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={`text-3xl sm:text-4xl leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="serif-italic">Instant integration</span><br />
              <span className="font-extrabold">with the whole stack</span>
            </h2>
            <p className={`mt-4 text-lg max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Out-of-the-box connections and flexible APIs make setup a breeze.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map(({ title, desc, icon: Icon, color }) => (
              <motion.div key={title} whileHover={{ y: -4 }} className={`rounded-2xl border p-5 transition-all ${isDark ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]' : 'border-gray-200 bg-white hover:shadow-md'}`}>
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}><Icon className="w-5 h-5 text-white" /></div>
                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                <div className={`mt-4 text-[11px] font-semibold flex items-center gap-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Explore <ArrowRight className="w-3 h-3" /></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── CTA Band ── */}
      {showPricing && (
      <section id="pricing" className={`py-20 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} px-4`}>
        <div className={`max-w-4xl mx-auto rounded-3xl border p-12 grid md:grid-cols-2 gap-8 items-center ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white shadow-sm'}`}>
          <div>
            <h2 className={`text-2xl sm:text-3xl leading-tight font-extrabold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Getting started is easy.</h2>
            <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Connect Norix to your workflow and do more with it immediately.</p>
            <div className="flex gap-3">
              <button onClick={onEnterApp} className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${isDark ? 'border-white bg-white text-black hover:bg-gray-100' : 'border-gray-900 bg-gray-900 text-white hover:bg-gray-700'}`}>Get started for free</button>
              <button onClick={onEnterApp} className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all ${isDark ? 'border-white/20 text-white hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Try live demo</button>
            </div>
          </div>
          <div>
            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Check out all of our plans to fit your team or organization.</p>
            <button onClick={onEnterApp} className={`inline-flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>See our plans <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>
      )}

      {/* ── FAQ ── */}
      {showAbout && (
      <section className={`py-20 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} px-4`}>
        <div className="max-w-2xl mx-auto">
          <h2 className={`text-3xl font-extrabold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>FAQ</h2>
          {faqs.map(([q, a], i) => (
            <FaqRow key={i} q={q} a={a} open={faqOpen === i} toggle={() => setFaqOpen(faqOpen === i ? null : i)} isDark={isDark} />
          ))}
          <p className={`text-center text-sm mt-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Can't find your answer? <button onClick={onEnterApp} className={`underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Get in touch</button>
          </p>
        </div>
      </section>
      )}

      {/* ── Footer (Norix industrial redesign) ── */}
      <footer id="about" className={`relative overflow-hidden border-t px-4 pt-10 ${isDark ? 'border-white/10 bg-[#111214]' : 'border-gray-200 bg-[#f4f0e8]'}`}>
        <div className={`pointer-events-none absolute inset-0 ${isDark ? 'opacity-100' : 'opacity-75'}`} style={{
          backgroundImage: isDark
            ? 'linear-gradient(rgba(224,210,176,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(224,210,176,0.06) 1px, transparent 1px)'
            : 'linear-gradient(rgba(20,20,20,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,20,0.06) 1px, transparent 1px)',
          backgroundSize: '104px 104px'
        }} />

        <div className={`relative mx-auto max-w-7xl border ${isDark ? 'border-[#2a2a2a]' : 'border-black/20 bg-[#faf7f0]'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <aside className={`border-b px-4 py-5 lg:col-span-2 lg:border-b-0 lg:border-r ${isDark ? 'border-[#2a2a2a]' : 'border-black/15'}`}>
              {['Intro', 'Capabilities', 'Performance', 'Features', 'Integrations', 'Pricing', 'Testimonials', 'Resources'].map((item, i) => (
                <button
                  key={item}
                  onClick={onEnterApp}
                  className={`mb-2 flex w-full items-center gap-2 text-left text-[11px] uppercase tracking-wide ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span className="opacity-70">{String(i + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </button>
              ))}
            </aside>

            <div className="grid grid-cols-1 lg:col-span-10 lg:grid-cols-12">
              <section className={`border-b px-6 py-7 lg:col-span-7 lg:border-r ${isDark ? 'border-[#2a2a2a]' : 'border-black/15'}`}>
                <p className={`mb-4 text-[11px] uppercase tracking-[0.26em] ${isDark ? 'text-blue-300/80' : 'text-blue-700/80'}`}>
                  Norix security command
                </p>
                <h3 className={`max-w-xl text-4xl font-bold leading-[1.05] sm:text-5xl ${isDark ? 'text-blue-100' : 'text-gray-900'}`}>
                  Resolve threats.
                  <br />
                  Trigger actions.
                </h3>
                <p className={`mt-5 max-w-md text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Protect URLs, emails, SMS, calls, and social deepfakes from one workspace. Norix combines local intelligence and cloud-assisted analysis for faster incident decisions.
                </p>
                <button
                  onClick={onEnterApp}
                  className={`mt-8 h-12 w-full max-w-[320px] text-sm font-bold uppercase tracking-wide ${isDark ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
                >
                  Enter Norix Dashboard
                </button>
              </section>

              <section className={`grid grid-cols-2 gap-8 border-b px-6 py-7 lg:col-span-5 ${isDark ? 'border-[#2a2a2a]' : 'border-black/15'}`}>
                <div>
                  <p className={`mb-3 text-xs uppercase tracking-wider ${isDark ? 'text-blue-300/80' : 'text-blue-700/80'}`}>Pages</p>
                  {['Homepage', 'Universal Scanner', 'Threat Feed', 'Pricing', 'Docs', 'Changelog'].map((l) => (
                    <button key={l} onClick={onEnterApp} className={`mb-2 block text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>{l}</button>
                  ))}
                </div>
                <div>
                  <p className={`mb-3 text-xs uppercase tracking-wider ${isDark ? 'text-blue-300/80' : 'text-blue-700/80'}`}>Connect</p>
                  {['LinkedIn', 'Discord', 'GitHub', 'X / Twitter', 'Support', 'Contact'].map((l) => (
                    <button key={l} onClick={onEnterApp} className={`mb-2 block text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>{l}</button>
                  ))}
                </div>
              </section>

              <section className={`grid grid-cols-1 border-b lg:col-span-12 lg:grid-cols-12 ${isDark ? 'border-[#2a2a2a]' : 'border-black/15'}`}>
                <div className={`border-b px-6 py-4 lg:col-span-2 lg:border-b-0 lg:border-r ${isDark ? 'border-[#2a2a2a]' : 'border-black/15'}`}>
                  <p className={`text-3xl font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>◆</p>
                </div>
                <div className={`border-b px-6 py-4 lg:col-span-2 lg:border-b-0 lg:border-r ${isDark ? 'border-[#2a2a2a]' : 'border-black/15'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Active</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Protection status</p>
                </div>
                <div className={`border-b px-6 py-4 lg:col-span-3 lg:border-b-0 lg:border-r ${isDark ? 'border-[#2a2a2a]' : 'border-black/15'}`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>25+</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Integrated features</p>
                </div>
                <div className="px-6 py-4 lg:col-span-5">
                  <p className={`max-w-2xl text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Norix is an AI-powered cyber defense workspace for individuals, teams, and enterprises. Scan suspicious links, messages, and call scripts, then act with confidence.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className={`relative mx-auto mt-0 max-w-7xl border-x border-b px-3 py-2 ${isDark ? 'border-[#2a2a2a] bg-blue-500 text-[#06152c]' : 'border-black/20 bg-blue-600 text-[#eaf2ff]'}`}>
          <p className="select-none truncate text-center font-serif text-[clamp(56px,18vw,176px)] leading-[0.95] tracking-tight">
            NORIX
          </p>
        </div>

        <div className={`relative mx-auto mb-6 flex max-w-7xl items-center justify-between border-x border-b px-4 py-3 text-[11px] ${isDark ? 'border-[#2a2a2a] bg-[#111214] text-gray-500' : 'border-black/20 bg-[#f4f0e8] text-gray-600'}`}>
          <span>© Norix AI, 2026</span>
          <div className="flex items-center gap-5">
            {['All rights reserved', 'Terms of use', 'Privacy policy'].map((x) => (
              <button key={x} onClick={onEnterApp} className="hover:underline">{x}</button>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
