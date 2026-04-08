// ════════════════════════════════════════════════════════════════════════
// Norix v3.0 — Smart Content Script (BuyHatke-style)
// Works like BuyHatke: detects which site you're on and injects
// the RIGHT tool automatically — no user action needed.
//
// Site-Aware Modules:
//   📧 Gmail / Outlook   → Email Sender Trust Badges injected inline
//   💬 WhatsApp Web      → Auto-scan every link in chat bubbles
//   🏦 Banking Sites     → "Verified Bank" badge or instant warning
//   🛒 Shopping Sites    → Fake store detector
//   🔐 Login Pages       → Warn before entering creds on risky domains
//   🌐 Any Page          → Floating risk badge + clipboard scanner
//   🚫 Ads               → Remove injected ad elements + report counter
// ════════════════════════════════════════════════════════════════════════

// ─── Config ──────────────────────────────────────────────────────────────
const PG_STYLE_ID  = 'norix-v3-styles';
const PG_OBSERVER_ROOT = document.documentElement;
const VERIFIED_BANKS = [
  'onlinesbi.sbi','hdfcbank.com','icicibank.com','axisbank.com','kotak.com',
  'indusind.com','bankofbaroda.in','canarabank.com','unionbankofindia.co.in',
  'pnbindia.in','rbi.org.in','paytmbank.com','yesbank.in','idfcfirstbank.com'
];
const OFFICIAL_BRANDS = {
  paypal:'paypal.com', apple:'apple.com', microsoft:'microsoft.com',
  google:'google.com', amazon:'amazon.in', netflix:'netflix.com',
  facebook:'meta.com', instagram:'instagram.com', flipkart:'flipkart.com',
  sbi:'sbi.co.in', hdfc:'hdfcbank.com', icici:'icicibank.com',
  paytm:'paytm.com', phonepe:'phonepe.com', razorpay:'razorpay.com'
};
const SCAM_DOMAINS  = /\.(xyz|top|club|tk|ml|ga|cf|site|online|zip|icu|pw)\b/;
const TRUSTED_HOST_SUFFIXES = ['norix.vercel.app', 'norix8.vercel.app', 'localhost', '127.0.0.1'];

function isTrustedHostUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return TRUSTED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
  } catch {
    return false;
  }
}

function clearRiskWarningsUi() {
  document.querySelectorAll('.pg-banner,.pg-field-warning').forEach((el) => el.remove());
  const panic = document.getElementById('pg-panic-overlay');
  if (panic) panic.remove();
}
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com','guerrillamail.com','tempmail.com','throwaway.email',
  'fakeinbox.com','sharklasers.com','guerrillamailblock.com','spam4.me',
  'yopmail.com','dispostable.com','trashmail.com','maildrop.cc'
];
// Known legit email domains for big brands (display-name spoofing check)
const BRAND_EMAIL_MAP = {
  paypal:    ['paypal.com'],
  amazon:    ['amazon.com','amazon.in'],
  apple:     ['apple.com','id.apple.com'],
  microsoft: ['microsoft.com','live.com','hotmail.com'],
  google:    ['google.com','accounts.google.com'],
  netflix:   ['netflix.com'],
  flipkart:  ['flipkart.com'],
  sbi:       ['sbi.co.in','onlinesbi.sbi'],
  hdfc:      ['hdfcbank.com'],
  icici:     ['icicibank.com'],
  axis:      ['axisbank.com'],
  rbi:       ['rbi.org.in'],
  irctc:     ['irctc.co.in'],
  income:    ['incometaxindia.gov.in'],
};

// ─── Style Injection ─────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById(PG_STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = PG_STYLE_ID;
  s.textContent = `
    /* ── 3D Shield Floating Widget ── */
    #pg-float-badge {
      position:fixed;bottom:22px;right:22px;z-index:2147483646;
      width:64px;height:74px;
      clip-path: polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      cursor:pointer;font-family:system-ui,sans-serif;color:#fff;
      box-shadow: inset 0 0 15px rgba(255,255,255,0.3);
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      transition:transform .3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter .3s;
    }
    #pg-float-badge:hover{transform:scale(1.15) translateY(-5px); filter: brightness(1.2);}
    #pg-float-badge .pg-bs{font-size:18px;font-weight:900;line-height:1;margin-top:2px;text-shadow:0 2px 4px rgba(0,0,0,0.5);}
    #pg-float-badge .pg-bl{font-size:8px;font-weight:800;opacity:.9;letter-spacing:.05em;text-shadow:0 1px 2px rgba(0,0,0,0.5);margin-top:2px;}
    .pg-shield-danger { background: linear-gradient(135deg, #ef4444, #7f1d1d); box-shadow: 0 0 30px rgba(239, 68, 68, 0.6) !important; animation: breathe-red 2s infinite; }
    .pg-shield-warn { background: linear-gradient(135deg, #f59e0b, #78350f); box-shadow: 0 0 20px rgba(245, 158, 11, 0.5) !important; }
    .pg-shield-safe { background: linear-gradient(135deg, #10b981, #064e3b); box-shadow: 0 0 15px rgba(16, 185, 129, 0.4) !important; }
    @keyframes breathe-red { 0%,100%{filter:drop-shadow(0 0 10px #ef4444)} 50%{filter:drop-shadow(0 0 25px #ef4444)} }

    /* ── Mini Popup ── */
    #pg-mini-popup {
      position:fixed;bottom:88px;right:22px;z-index:2147483646;
      background:#0f172a;border:1px solid rgba(99,102,241,.4);
      border-radius:14px;padding:14px;width:260px;
      font-family:system-ui,sans-serif;
      box-shadow:0 8px 32px rgba(0,0,0,.7);
      display:none;
    }
    #pg-mini-popup.pg-show{display:block;animation:pgFadeUp .2s ease}
    @keyframes pgFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    #pg-mini-popup h4{color:#f1f5f9;font-size:13px;font-weight:800;margin:0 0 4px}
    #pg-mini-popup p{color:#94a3b8;font-size:11px;margin:0 0 10px;line-height:1.4}
    #pg-mini-popup a{display:block;text-align:center;padding:7px;background:linear-gradient(135deg,#1d4ed8,#6366f1);color:#fff;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none}
    .pg-close-popup{position:absolute;top:8px;right:10px;background:none;border:none;color:#475569;cursor:pointer;font-size:14px}

    /* ── Warning Banner ── */
    .pg-banner{
      position:fixed;top:0;left:0;right:0;z-index:2147483645;
      padding:10px 16px;display:flex;align-items:center;gap:10px;
      font-family:system-ui,sans-serif;font-size:13px;font-weight:700;color:#fff;
      box-shadow:0 2px 16px rgba(0,0,0,.4);
    }
    .pg-banner-critical{background:linear-gradient(90deg,#7f1d1d,#dc2626)}
    .pg-banner-high{background:linear-gradient(90deg,#78350f,#d97706)}
    .pg-banner-medium{background:linear-gradient(90deg,#713f12,#ca8a04)}
    .pg-banner .pg-bx{margin-left:auto;cursor:pointer;background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:6px;padding:2px 10px;font-size:12px;font-weight:700}

    /* ── Panic Overlay ── */
    #pg-panic-overlay{
      position:fixed;inset:0;z-index:2147483647;
      background:rgba(15,0,0,.97);backdrop-filter:blur(8px);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:system-ui,sans-serif;color:#fff;text-align:center;padding:40px;
    }
    #pg-panic-overlay h1{font-size:42px;font-weight:900;color:#ef4444;margin-bottom:12px}
    #pg-panic-overlay p{font-size:16px;color:#fca5a5;max-width:480px;line-height:1.6}
    #pg-panic-overlay .pg-panic-acts{display:flex;gap:14px;margin-top:28px;flex-wrap:wrap;justify-content:center}
    .pg-panic-btn-leave{background:#ef4444;color:#fff;border:none;border-radius:12px;padding:12px 26px;font-size:15px;font-weight:800;cursor:pointer}
    .pg-panic-btn-stay{background:rgba(255,255,255,.1);color:#94a3b8;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:12px 26px;font-size:14px;font-weight:700;cursor:pointer}

    /* ── Gmail/Email Sender Badge ── */
    .pg-sender-badge{
      display:inline-flex;align-items:center;gap:3px;
      font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;
      margin-left:5px;cursor:pointer;vertical-align:middle;
      border:1px solid;transition:opacity .15s;
    }
    .pg-sender-badge:hover{opacity:.8}
    .pg-sender-safe{background:rgba(16,185,129,.15);color:#10b981;border-color:rgba(16,185,129,.3)}
    .pg-sender-warn{background:rgba(245,158,11,.15);color:#f59e0b;border-color:rgba(245,158,11,.3)}
    .pg-sender-danger{background:rgba(239,68,68,.15);color:#ef4444;border-color:rgba(239,68,68,.3)}

    /* ── Email Detail Warning ── */
    .pg-email-bar{
      display:flex;align-items:center;gap:10px;
      padding:10px 14px;margin:8px;border-radius:12px;
      font-family:system-ui,sans-serif;font-size:12px;font-weight:600;
      border:1px solid;
    }
    .pg-email-bar-safe{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.25);color:#a7f3d0}
    .pg-email-bar-warn{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);color:#fde68a}
    .pg-email-bar-danger{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.3);color:#fca5a5}
    .pg-email-bar strong{margin-right:4px}

    /* ── WhatsApp Link Badge ── */
    .pg-wa-link-badge{
      display:inline-block;font-size:9.5px;font-weight:800;
      padding:2px 6px;border-radius:999px;margin-left:4px;cursor:pointer;
      vertical-align:middle;
    }
    .pg-wa-safe  {background:#10b981;color:#fff}
    .pg-wa-warn  {background:#f59e0b;color:#000}
    .pg-wa-danger{background:#ef4444;color:#fff;animation:pgPulse 1.5s infinite}

    /* ── Verified Bank Badge ── */
    .pg-bank-badge{
      display:flex;align-items:center;gap:8px;
      padding:8px 14px;background:rgba(16,185,129,.1);
      border:1px solid rgba(16,185,129,.3);border-radius:12px;
      position:fixed;top:70px;right:14px;z-index:2147483644;
      font-family:system-ui,sans-serif;font-size:11px;font-weight:700;color:#a7f3d0;
      box-shadow:0 4px 16px rgba(0,0,0,.3);cursor:pointer;
      transition:transform .2s;
    }
    .pg-bank-badge:hover{transform:translateY(-1px)}

    /* ── Ads Blocked Counter ── */
    #pg-ads-counter{
      position:fixed;bottom:88px;left:14px;z-index:2147483644;
      background:#0f172a;border:1px solid rgba(239,68,68,.3);
      border-radius:10px;padding:6px 12px;
      font-family:system-ui,sans-serif;font-size:11px;font-weight:700;color:#f87171;
      display:flex;align-items:center;gap:5px;
      box-shadow:0 4px 16px rgba(0,0,0,.4);
      transition:all .3s;
    }
    #pg-ads-counter .pg-ad-n{font-size:16px;font-weight:900;color:#ef4444}

    /* ── Link Badges ── */
    .pg-link-badge{
      display:inline-flex;align-items:center;justify-content:center;
      font-size:10px;font-weight:900;
      vertical-align:middle;margin-left:6px;padding:2px 6px;
      border-radius:6px;cursor:pointer;letter-spacing:.02em;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .pg-l-danger .pg-link-badge{background:#ef4444;color:#fff;border:1px solid #7f1d1d;}
    .pg-l-warn .pg-link-badge{background:#f59e0b;color:#000;border:1px solid #78350f;}

    /* ── Clipboard Toast ── */
    .pg-clip-toast{
      position:fixed;bottom:96px;right:22px;z-index:2147483646;
      background:#450a0a;border:2px solid #ef4444;color:#fca5a5;
      padding:10px 14px;border-radius:12px;font-family:system-ui,sans-serif;
      font-size:12px;font-weight:700;max-width:280px;
      box-shadow:0 4px 20px rgba(239,68,68,.4);
      animation:pgFadeUp .3s ease;
    }

    /* ── Context Tooltip ── */
    .pg-tooltip{
      position:absolute;z-index:2147483646;
      background:#0f172a;border:1px solid rgba(99,102,241,.4);
      border-radius:10px;padding:10px 13px;min-width:200px;max-width:300px;
      font-family:system-ui,sans-serif;font-size:11px;
      box-shadow:0 4px 20px rgba(0,0,0,.5);pointer-events:none;
    }
    .pg-tooltip h5{color:#f1f5f9;font-size:12px;font-weight:800;margin:0 0 4px}
    .pg-tooltip p{color:#94a3b8;margin:0;line-height:1.4}
    .pg-tooltip .pg-tt-score{font-size:22px;font-weight:900;float:right}

    @keyframes pgPulse{0%,100%{opacity:1}50%{opacity:.5}}
  `;
  document.head.appendChild(s);
}

// ════════════════════════════════════════════════════════════════════════
// EMAIL SENDER ANALYZER — Works on Gmail, Outlook, Yahoo Mail
// ════════════════════════════════════════════════════════════════════════
function analyzeEmailSender(rawEmail) {
  const result = { score: 0, issues: [], verdict: 'safe' };
  if (!rawEmail) return result;
  const lo = rawEmail.toLowerCase().trim();

  // 1. Extract email address from "Name <email@domain.com>" format
  const addrMatch = lo.match(/<([^>]+)>/) || lo.match(/([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})/);
  const emailAddr = addrMatch ? addrMatch[1] : lo;
  const parts = emailAddr.split('@');
  if (parts.length < 2) return result;
  const domain = parts[1].trim();
  const displayName = rawEmail.toLowerCase().replace(/<.*>/, '').trim();

  // 2. Disposable email domain
  if (DISPOSABLE_EMAIL_DOMAINS.some(d => domain === d)) {
    result.score += 40;
    result.issues.push({ icon: '🗑️', text: 'Disposable email domain — temporary address' });
  }

  // 3. Free email impersonating a brand
  const freeDomains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','rediffmail.com','protonmail.com'];
  if (freeDomains.includes(domain)) {
    // Check if display name or local part claims to be a brand
    for (const [brand, legit] of Object.entries(BRAND_EMAIL_MAP)) {
      const hasBrandInName = displayName.includes(brand) || emailAddr.split('@')[0].includes(brand);
      if (hasBrandInName && !legit.includes(domain)) {
        result.score += 50;
        result.issues.push({ icon: '🎭', text: `Display-name spoofing: claims to be ${brand.toUpperCase()} but sent from ${domain}` });
        break;
      }
    }
  }

  // 4. Brand domain mismatch — brand mentioned but wrong official domain
  for (const [brand, legitDomains] of Object.entries(BRAND_EMAIL_MAP)) {
    const inAddr = emailAddr.includes(brand) || displayName.includes(brand);
    if (inAddr && !legitDomains.some(d => domain.endsWith(d))) {
      result.score += 45;
      result.issues.push({ icon: '⚠️', text: `${brand.toUpperCase()} emails should come from ${legitDomains[0]}, not ${domain}` });
    }
  }

  // 5. Suspicious domain pattern
  if (SCAM_DOMAINS.test(domain)) { result.score += 25; result.issues.push({ icon: '🌐', text: `Suspicious top-level domain: .${domain.split('.').pop()}` }); }
  if (/\d{3,}/.test(domain))     { result.score += 15; result.issues.push({ icon: '🔢', text: 'Domain contains suspicious numeric sequence' }); }
  if (/(secure|alert|verify|update|support|account|help)/i.test(emailAddr.split('@')[0])) {
    result.score += 15; result.issues.push({ icon: '🎣', text: 'Phishing keyword in sender local-part' });
  }

  // 6. Hyphenated fake domain (paypal-support.com instead of paypal.com)
  for (const brand of Object.keys(BRAND_EMAIL_MAP)) {
    if (new RegExp(`${brand}[\\-_.]`).test(domain) && !domain.startsWith(brand + '.')) {
      result.score += 40;
      result.issues.push({ icon: '🔗', text: `Possible typosquat: "${domain}" looks like ${brand}'s domain` });
    }
  }

  result.score = Math.min(100, result.score);
  result.verdict = result.score >= 60 ? 'danger' : result.score >= 30 ? 'warn' : 'safe';
  return result;
}

// Gmail sender badge injector
let gmailObserver = null;
function injectGmailBadges() {
  // Gmail sender elements — multiple selector fallbacks
  const GMAIL_SELECTORS = [
    '[data-hovercard-id*="@"]',        // sender hover cards
    '.gD',                              // sender name in email list
    '[email]',                          // elements with email attr
    '.go',                              // sender in compose
  ];

  const processed = new Set();
  GMAIL_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      const email = el.getAttribute('data-hovercard-id') || el.getAttribute('email') || el.textContent;
      if (!email || !email.includes('@') || processed.has(el)) return;
      processed.add(el);

      const analysis = analyzeEmailSender(email);
      const badge = document.createElement('span');
      badge.className = `pg-sender-badge pg-sender-${analysis.verdict}`;
      badge.dataset.pgDone = '1';

      const icon  = analysis.verdict === 'danger' ? '⚠️ SCAM SENDER' : analysis.verdict === 'warn' ? '⚡ Suspicious' : '✅ Legit';
      badge.textContent = icon;
      badge.title = analysis.issues.length ? analysis.issues.map(i => i.text).join(' | ') : 'Sender appears legitimate';

      // Show tooltip on hover
      badge.addEventListener('mouseenter', (e) => showSenderTooltip(e, email, analysis));
      badge.addEventListener('mouseleave', () => document.getElementById('pg-tt')?.remove());

      el.parentNode?.insertBefore(badge, el.nextSibling);
    });
  });
}

// Inject analysis bar inside open email
function injectGmailDetailBar(emailEl) {
  if (emailEl.querySelector('.pg-email-bar')) return;

  // Find From: header
  const fromEl = emailEl.querySelector('[data-hovercard-id*="@"]') || emailEl.querySelector('[email]');
  if (!fromEl) return;

  const email    = fromEl.getAttribute('data-hovercard-id') || fromEl.getAttribute('email') || '';
  const analysis = analyzeEmailSender(email);

  const bar  = document.createElement('div');
  const cls  = analysis.verdict  === 'danger' ? 'pg-email-bar-danger' : analysis.verdict === 'warn' ? 'pg-email-bar-warn' : 'pg-email-bar-safe';
  const icon = analysis.verdict === 'danger' ? '🚨' : analysis.verdict === 'warn' ? '⚡' : '🛡️';
  const msg  = analysis.verdict === 'danger'
    ? `<strong>Norix:</strong> Sender email looks like a SCAM! ${analysis.issues[0]?.text || ''}`
    : analysis.verdict === 'warn'
    ? `<strong>Norix:</strong> Sender is suspicious. ${analysis.issues[0]?.text || ''}`
    : `<strong>Norix:</strong> Sender appears legitimate. Score: ${analysis.score}/100`;

  bar.className = `pg-email-bar ${cls}`;
  bar.innerHTML = `<span style="font-size:16px">${icon}</span><span>${msg}</span><span style="margin-left:auto;font-size:10px;opacity:.6;font-weight:700">${analysis.score}/100</span>`;
  emailEl.insertBefore(bar, emailEl.firstChild);
}

function showSenderTooltip(e, email, analysis) {
  document.getElementById('pg-tt')?.remove();
  const tt = document.createElement('div');
  tt.id = 'pg-tt';
  tt.className = 'pg-tooltip';
  const score = analysis.score;
  const color = score >= 60 ? '#ef4444' : score >= 30 ? '#f59e0b' : '#10b981';
  tt.innerHTML = `
    <h5>Email Sender Analysis <span class="pg-tt-score" style="color:${color}">${score}</span></h5>
    <p style="margin-bottom:6px;word-break:break-all">${email}</p>
    ${analysis.issues.length ? analysis.issues.map(i => `<p style="margin:2px 0">${i.icon} ${i.text}</p>`).join('') : '<p>✅ No suspicious indicators found</p>'}
  `;
  document.body.appendChild(tt);
  tt.style.left = `${Math.min(e.clientX + window.scrollX, window.innerWidth - 310)}px`;
  tt.style.top  = `${e.clientY + window.scrollY - tt.offsetHeight - 8}px`;
}

// Outlook selectors
function injectOutlookBadges() {
  document.querySelectorAll('[title*="@"]:not([data-pg]),[aria-label*="From:"],[class*="sender"]').forEach(el => {
    const text = el.getAttribute('title') || el.textContent || '';
    if (!text.includes('@') || el.dataset.pg) return;
    el.dataset.pg = '1';
    const analysis = analyzeEmailSender(text);
    if (analysis.score >= 20) {
      const badge = document.createElement('span');
      badge.className = `pg-sender-badge pg-sender-${analysis.verdict}`;
      badge.textContent = analysis.verdict === 'danger' ? '⚠️ SCAM' : '⚡ Check';
      el.appendChild(badge);
    }
  });
}

// ════════════════════════════════════════════════════════════════════════
// WHATSAPP WEB SCANNER
// ════════════════════════════════════════════════════════════════════════
function scoreURL(url) {
  if (isTrustedHostUrl(url)) return 0;
  let s = 0;
  if (!url.startsWith('https://')) s += 20;
  if (/\d{1,3}\.\d{1,3}/.test(url)) s += 25;
  if (SCAM_DOMAINS.test(url)) s += 15;
  if (/(bit\.ly|tinyurl|t\.co|is\.gd)/.test(url)) s += 15;
  if (url.length > 75) s += 10;
  if (/(login|verify|secure|account|paypal|bank|kyc|otp)/i.test(url)) s += 20;
  for (const [brand, domain] of Object.entries(OFFICIAL_BRANDS)) {
    if (url.toLowerCase().includes(brand) && !url.includes(domain)) { s += 25; break; }
  }
  return Math.min(100, s);
}

function injectWhatsAppBadges() {
  document.querySelectorAll('a[href]:not([data-pg-wa])').forEach(link => {
    const href = link.href;
    if (!href?.startsWith('http') || href.includes('whatsapp.com')) return;
    link.dataset.pgWa = '1';
    const score = scoreURL(href);
    if (score < 15) return;

    const badge = document.createElement('span');
    const cls   = score >= 60 ? 'pg-wa-danger' : 'pg-wa-warn';
    badge.className = `pg-wa-link-badge ${cls}`;
    badge.textContent= score >= 60 ? `⚠️ ${score}` : `⚡ ${score}`;
    badge.title = `Norix: Risk ${score}/100 — ${score >= 60 ? 'PHISHING LINK!' : 'Suspicious Link'}`;
    badge.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.open(`http://localhost:5173?url=${encodeURIComponent(href)}`, '_blank'); };
    link.parentNode?.insertBefore(badge, link.nextSibling);
  });
}

// ════════════════════════════════════════════════════════════════════════
// ADS BLOCKER — Element-level injection removal
// (Network-level blocking is done via declarativeNetRequest in manifest)
// ════════════════════════════════════════════════════════════════════════
const AD_PATTERNS = [
  'googlesyndication','doubleclick','googleadservices','adnxs','ads.yahoo',
  'amazon-adsystem','criteo','taboola','outbrain','pubmatic','rubiconproject',
  'openx','casalemedia','spotxchange','media.net','adroll','bidswitch',
  'adsrvr','advertising.com','adsystem','trackers.trade','popads.net',
  'adsterra','propellerads','exoclick','trafficjunky','juicyads'
];
const AD_SELECTORS = [
  'ins.adsbygoogle',
  '[id*="google_ads"]','[id*="ad-container"]','[id*="ad_container"]',
  '[class*="ads-banner"]','[class*="ad-wrapper"]','[class*="advertisement"]',
  '[class*="sponsored-content"]','[class*="sponsored_content"]',
  'iframe[src*="doubleclick"]','iframe[src*="googlesyndication"]',
  'div[data-ad]','div[data-google-query-id]',
  '[aria-label="Advertisements"]','[id*="dfp-ads"]',
];

let adsBlockedCount = 0;

function removeAdElements() {
  AD_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.dataset.pgAdRemoved && el.offsetHeight > 0) {
        el.style.display = 'none';
        el.dataset.pgAdRemoved = '1';
        adsBlockedCount++;
        updateAdCounter();
      }
    });
  });

  // Block iframes from ad domains
  document.querySelectorAll('iframe').forEach(fr => {
    if (!fr.dataset.pgAdRemoved && fr.src && AD_PATTERNS.some(p => fr.src.includes(p))) {
      fr.style.display = 'none';
      fr.dataset.pgAdRemoved = '1';
      adsBlockedCount++;
      updateAdCounter();
    }
  });

  // Remove injected ad scripts
  document.querySelectorAll('script[src]').forEach(s => {
    if (AD_PATTERNS.some(p => s.src?.includes(p))) {
      s.remove();
    }
  });
}

function updateAdCounter() {
  let counter = document.getElementById('pg-ads-counter');
  if (!counter) {
    counter = document.createElement('div');
    counter.id = 'pg-ads-counter';
    counter.title = 'Norix — Ads Blocked';
    document.body.appendChild(counter);
  }
  counter.innerHTML = `🚫 <span class="pg-ad-n">${adsBlockedCount}</span> ads blocked`;
}

// ════════════════════════════════════════════════════════════════════════
// FLOATING BADGE
// ════════════════════════════════════════════════════════════════════════
let currentScore = 0;
function createFloatingBadge(score) {
  document.getElementById('pg-float-badge')?.remove();
  document.getElementById('pg-mini-popup')?.remove();

  const cls = score >= 80 ? 'pg-shield-danger' : score >= 60 ? 'pg-shield-warn' : score >= 40 ? 'pg-shield-warn' : 'pg-shield-safe';
  const lbl = score >= 80 ? 'PHISH' : score >= 60 ? 'HIGH' : score >= 40 ? 'WARN' : score >= 20 ? 'LOW' : 'SAFE';

  const badge = document.createElement('div');
  badge.id = 'pg-float-badge';
  badge.className = cls;
  badge.innerHTML = `<div class="pg-bs">${score}</div><div class="pg-bl">${lbl}</div>`;

  const popup = document.createElement('div');
  popup.id = 'pg-mini-popup';
  popup.innerHTML = `
    <button class="pg-close-popup">✕</button>
    <h4>Norix — ${score}/100</h4>
    <p>${score >= 60 ? '⚠️ This page has phishing indicators. Do NOT enter passwords, OTPs, or card details.' : score >= 40 ? '⚡ This page looks suspicious. Verify before entering any information.' : '✅ This page appears safe. Stay vigilant.'}</p>
    <a href="http://localhost:5173?url=${encodeURIComponent(location.href)}" target="_blank">🔍 Open Full Analysis</a>
  `;

  badge.addEventListener('click', () => popup.classList.toggle('pg-show'));
  popup.querySelector('.pg-close-popup').addEventListener('click', () => popup.classList.remove('pg-show'));

  document.body.appendChild(badge);
  document.body.appendChild(popup);
}

// ════════════════════════════════════════════════════════════════════════
// WARNING BANNER
// ════════════════════════════════════════════════════════════════════════
function showBanner(score) {
  if (isTrustedHostUrl(location.href)) return;
  if (document.querySelector('.pg-banner')) return;
  const cls = score >= 80 ? 'pg-banner-critical' : score >= 60 ? 'pg-banner-high' : 'pg-banner-medium';
  const icon = score >= 80 ? '🚨' : '⚠️';
  const text = score >= 80
    ? 'PHISHING SITE DETECTED! DO NOT enter passwords, OTPs, or card details.'
    : 'Suspicious page detected. Verify the domain before entering any information.';
  const div = document.createElement('div');
  div.className = `pg-banner ${cls}`;
  div.innerHTML = `<span style="font-size:18px">${icon}</span><span><strong>Norix (${score}/100)</strong> — ${text}</span><button class="pg-bx" onclick="this.parentElement.remove()">✕</button>`;
  document.body.insertAdjacentElement('afterbegin', div);
  if (score < 60) setTimeout(() => div?.remove(), 10000);
}

// ════════════════════════════════════════════════════════════════════════
// PANIC MODE — Full-screen block for score 100
// ════════════════════════════════════════════════════════════════════════
function showPanicMode(score) {
  if (isTrustedHostUrl(location.href)) return;
  if (document.getElementById('pg-panic-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'pg-panic-overlay';
  overlay.innerHTML = `
    <div style="font-size:72px;margin-bottom:16px">⛔</div>
    <h1>PHISHING SITE DETECTED</h1>
    <p>Norix has identified this page as a <strong style="color:#ef4444">confirmed phishing site</strong> (Risk: ${score}/100).<br><br>
    This website is likely trying to steal your passwords, OTPs, bank details, or Aadhaar information.<br><br>
    <strong>DO NOT enter any information.</strong></p>
    <div class="pg-panic-acts">
      <button class="pg-panic-btn-leave" onclick="window.history.back();document.getElementById('pg-panic-overlay').remove()">← Go Back (Safe)</button>
      <button class="pg-panic-btn-stay" onclick="document.getElementById('pg-panic-overlay').remove()">I understand the risk — stay</button>
    </div>
    <p style="margin-top:20px;font-size:12px;color:#64748b">🇮🇳 Call 1930 to report cybercrime | cybercrime.gov.in</p>
  `;
  document.body.appendChild(overlay);
}

// ════════════════════════════════════════════════════════════════════════
// LINK ANALYSIS FOR REGULAR PAGES
// ════════════════════════════════════════════════════════════════════════
function analyzeLinks() {
  chrome.storage.local.get('set-links', s => {
    if (s['set-links'] === false) {
      clearLinkBadges();
      return;
    }
    
    document.querySelectorAll('a[href]:not([data-pg-scanned])').forEach(link => {
      link.dataset.pgScanned = '1';
      const href = link.href;
      if (!href?.startsWith('http') || href.startsWith('javascript:')) return;
      
      const score = scoreURL(href);
      // Increased threshold from 20 to 40 so normal Google results don't get flagged with yellow tags.
      if (score < 40) return;
      
      const cls = score >= 60 ? 'pg-l-danger' : 'pg-l-warn';
      link.classList.add(cls);
      const badge = document.createElement('span');
      badge.className = 'pg-link-badge pg-injected-badge';
      badge.title = `Norix: ${score}/100`;
      badge.textContent = score >= 60 ? `⚠️${score}` : `⚡${score}`;
      badge.onclick = e => { e.preventDefault(); e.stopPropagation(); window.open(`http://localhost:5173?url=${encodeURIComponent(href)}`, '_blank'); };
      link.appendChild(badge);
    });
  });
}

function clearLinkBadges() {
  document.querySelectorAll('.pg-injected-badge').forEach(b => b.remove());
  document.querySelectorAll('.pg-l-warn, .pg-l-danger').forEach(el => {
    el.classList.remove('pg-l-warn', 'pg-l-danger');
    el.removeAttribute('data-pg-scanned');
  });
}

// Ensure toggling the setting immediately updates the current page
chrome.storage.onChanged.addListener((changes) => {
  if (changes['set-links']) {
    if (changes['set-links'].newValue === false) {
      clearLinkBadges();
    } else {
      analyzeLinks();
    }
  }
});

// ════════════════════════════════════════════════════════════════════════
// CLIPBOARD SCAM DETECTOR
// ════════════════════════════════════════════════════════════════════════
const CLIP_KW = ['otp','card number','cvv','aadhaar','pan number','kyc','lottery','won prize','account blocked','wire transfer','remote access','anydesk','teamviewer'];
document.addEventListener('paste', e => {
  const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
  if (!text || text.length < 10) return;
  const lo = text.toLowerCase();
  const hits = CLIP_KW.filter(k => lo.includes(k));
  if (hits.length >= 2) {
    const toast = document.createElement('div');
    toast.className = 'pg-clip-toast';
    toast.innerHTML = `⚠️ <strong>Norix:</strong> Pasted content may be scam material (${hits.slice(0,3).join(', ')}). Never paste banking or OTP content!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }
});

// ════════════════════════════════════════════════════════════════════════
// AUTO-FILL WARNING
// ════════════════════════════════════════════════════════════════════════
function setupAutoFillWarnings(pageScore) {
  if (pageScore < 40) return;
  const warned = new Set();
  document.querySelectorAll('input[type="password"],input[name*="card"],input[name*="otp"],input[name*="pin"]').forEach(field => {
    if (warned.has(field)) return;
    warned.add(field);
    field.addEventListener('focus', () => {
      if (document.querySelector('.pg-field-warning')) return;
      const w = document.createElement('div');
      w.style.cssText = `position:fixed;z-index:2147483646;background:#0f172a;border:2px solid #ef4444;border-radius:10px;padding:12px 15px;min-width:230px;max-width:300px;box-shadow:0 4px 20px rgba(239,68,68,.25);font-family:system-ui,sans-serif;top:${field.getBoundingClientRect().bottom+6}px;left:${Math.min(field.getBoundingClientRect().left,window.innerWidth-310)}px`;
      w.className = 'pg-field-warning';
      w.innerHTML = `<p style="color:#f87171;font-size:12px;font-weight:800;margin:0 0 5px">⚠️ Norix Warning</p><p style="color:#94a3b8;font-size:11px;margin:0 0 8px">This page has a risk score of <strong style="color:#f87171">${pageScore}/100</strong>. Are you sure you trust this site?</p><button onclick="this.parentElement.remove()" style="width:100%;background:#ef4444;color:#fff;border:none;border-radius:7px;padding:6px;font-size:11px;font-weight:700;cursor:pointer">I understand — dismiss</button>`;
      document.body.appendChild(w);
      setTimeout(() => w.remove(), 7000);
    }, { once: true });
  });
}

// ════════════════════════════════════════════════════════════════════════
// VERIFIED BANK BADGE
// ════════════════════════════════════════════════════════════════════════
function showVerifiedBankBadge() {
  const host = location.hostname.replace('www.','');
  if (VERIFIED_BANKS.includes(host)) {
    const badge = document.createElement('div');
    badge.className = 'pg-bank-badge';
    badge.innerHTML = `<span style="font-size:18px">🏦</span><div><strong style="color:#34d399">✅ Verified Bank</strong><br><span style="font-size:9px;opacity:.7">${host} — Confirmed legitimate</span></div>`;
    document.body.appendChild(badge);
    badge.addEventListener('click', () => badge.remove());
    setTimeout(() => { badge.style.opacity='0'; badge.style.transition='opacity .5s'; setTimeout(()=>badge.remove(),500); }, 6000);
  }
}

// ════════════════════════════════════════════════════════════════════════
// SITE DETECTION — BuyHatke-style contextual routing
// ════════════════════════════════════════════════════════════════════════
const HOST = location.hostname.toLowerCase();

function isGmail()      { return HOST.includes('mail.google.com'); }
function isOutlook()    { return HOST.includes('outlook.') || HOST.includes('office.com'); }
function isYahooMail()  { return HOST.includes('mail.yahoo.com'); }
function isWhatsApp()   { return HOST.includes('web.whatsapp.com'); }
function isBankingSite(){ return VERIFIED_BANKS.some(b => HOST.includes(b.split('.')[0])); }
function isLoginPage()  { return document.querySelectorAll('input[type="password"]').length > 0; }
function isShoppingSite(){
  const shopping = ['flipkart.com','amazon.in','myntra.com','ajio.com','snapdeal.com','meesho.com','nykaa.com'];
  return shopping.some(s => HOST.includes(s.split('.')[0]));
}

// ════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLER
// ════════════════════════════════════════════════════════════════════════
chrome.runtime.onMessage.addListener(msg => {
  if (msg.action === 'RISK_UPDATE') {
    currentScore = msg.score;
    injectStyles();
    if (isTrustedHostUrl(location.href) || msg.score < 40) clearRiskWarningsUi();

    // Universal
    createFloatingBadge(msg.score);
    if (msg.score >= 40) analyzeLinks();
    if (msg.score >= 40) setupAutoFillWarnings(msg.score);
    if (msg.score >= 60) showBanner(msg.score);
    if (msg.score >= 95) showPanicMode(msg.score);

    // Read settings
    chrome.storage.local.get(['set-adblocker'], s => {
      if (s['set-adblocker'] !== false) { removeAdElements(); startAdObserver(); }
    });

  }
});

// ════════════════════════════════════════════════════════════════════════
// AD OBSERVER — continuously block newly injected ads
// ════════════════════════════════════════════════════════════════════════
let adObserver = null;
function startAdObserver() {
  if (adObserver) return;
  adObserver = new MutationObserver(() => removeAdElements());
  adObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });
}

// ════════════════════════════════════════════════════════════════════════
// SPA NAVIGATION RE-SCAN
// ════════════════════════════════════════════════════════════════════════
let lastHref = location.href;
new MutationObserver(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    setTimeout(() => { domAnalysis(); routeContextualModules(); analyzeLinks(); }, 1200);
  }
}).observe(document.documentElement, { childList: true, subtree: false });

// ════════════════════════════════════════════════════════════════════════
// DOM ANALYSIS — Send findings to background
// ════════════════════════════════════════════════════════════════════════
function domAnalysis() {
  if (isTrustedHostUrl(location.href)) return;
  const findings = [];
  if (document.querySelectorAll('input[type="password"]').length > 0) findings.push({ rule:'Login Form', weight:20 });
  if (location.protocol !== 'https:') findings.push({ rule:'No HTTPS', weight:30 });
  const brands = ['PayPal','SBI','HDFC','ICICI','Amazon','Microsoft','Apple','Netflix'];
  const official = { PayPal:'paypal.com', SBI:'sbi.co.in', HDFC:'hdfcbank.com', ICICI:'icicibank.com', Amazon:'amazon', Microsoft:'microsoft.com', Apple:'apple.com', Netflix:'netflix.com' };
  brands.filter(b => (document.body?.innerText||'').includes(b) && !HOST.includes(official[b])).forEach(b => findings.push({ rule:`Brand Impersonation: ${b}`, weight:30 }));
  if (findings.length) chrome.runtime.sendMessage({ action:'CONTENT_FINDINGS', hostname:HOST, findings }).catch(()=>{});
}

// ════════════════════════════════════════════════════════════════════════
// CONTEXTUAL MODULE ROUTER — BuyHatke's core idea applied to security
// ════════════════════════════════════════════════════════════════════════
function routeContextualModules() {
  // 📧 Email platforms — inject sender badges
  if (isGmail()) {
    injectGmailBadges();
    // Observe for new emails loading
    if (!gmailObserver) {
      gmailObserver = new MutationObserver(() => {
        injectGmailBadges();
        // Inject detail bar in opened emails
        document.querySelectorAll('[role="main"] [role="dialog"],[data-message-id]').forEach(injectGmailDetailBar);
      });
      gmailObserver.observe(document.body, { childList: true, subtree: true });
    }
  }
  if (isOutlook()) injectOutlookBadges();
  if (isYahooMail()) injectOutlookBadges(); // same logic works

  // 💬 WhatsApp Web — scan all chat links
  if (isWhatsApp()) {
    injectWhatsAppBadges();
    new MutationObserver(() => injectWhatsAppBadges()).observe(document.body, { childList:true, subtree:true });
  }

  // 🏦 Banking sites — show verified badge
  if (isBankingSite()) showVerifiedBankBadge();

  // 🔐 Login pages on suspicious domains
  if (isLoginPage() && !isBankingSite()) {
    const score = scoreURL(location.href);
    if (score >= 40) setupAutoFillWarnings(score);
  }

  // 🛒 Shopping sites — check domain legitimacy
  if (isShoppingSite()) {
    const score = scoreURL(location.href);
    createFloatingBadge(score);
  }
}

// ════════════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════════════
function init() {
  injectStyles();
  if (isTrustedHostUrl(location.href)) clearRiskWarningsUi();

  // Read ad blocker setting
  chrome.storage.local.get('set-adblocker', s => {
    if (s['set-adblocker'] !== false) { removeAdElements(); startAdObserver(); }
  });

  // Context-aware injection
  routeContextualModules();
  domAnalysis();
  analyzeLinks();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else setTimeout(init, 600);
