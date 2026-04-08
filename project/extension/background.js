// ════════════════════════════════════════════════════════════════
// Norix v3.0 — Background Service Worker
// ════════════════════════════════════════════════════════════════

const SB_URL = 'https://qyjevtuwsuizfyxakobu.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5amV2dHV3c3VpemZ5eGFrb2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjMzNjAsImV4cCI6MjA4OTM5OTM2MH0.DBzPwcBpqlRKiseFxzs0BIsO7WapMtbdlCuuuKEDBqI';
const CACHE  = new Map();
const TTL    = 5 * 60 * 1000; // 5 min cache
const TRUSTED_HOST_SUFFIXES = ['norix.vercel.app', 'norix8.vercel.app', 'localhost', '127.0.0.1'];

function isTrustedHost(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return TRUSTED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
  } catch {
    return false;
  }
}

// ── SW Keep-Alive ─────────────────────────────────────────────
// Uses chrome.alarms to prevent the service worker from sleeping
chrome.alarms.create('pg-keepalive', { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener(a => { if (a.name === 'pg-keepalive') CACHE.size; });

// ── Offline Scoring ───────────────────────────────────────────
function offlineScore(url) {
  if (isTrustedHost(url)) return 0;
  let s = 0;
  if (!url.startsWith('https://'))   s += 20;
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) s += 25;
  if (/\.(xyz|top|club|tk|ml|ga|cf|site|online|zip|icu)\b/.test(url)) s += 15;
  if (/(bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd)/.test(url)) s += 15;
  if (url.length > 75) s += 10;
  if (/(login|verify|account|secure|password|paypal|apple|bank|microsoft|kyc|otp)/i.test(url)) s += 20;
  if (/@/.test(url)) s += 10;
  const brands  = ['paypal','apple','microsoft','google','amazon','netflix','facebook','sbi','hdfc','icici'];
  const official= ['paypal.com','apple.com','microsoft.com','google.com','amazon.com','netflix.com','facebook.com','sbi.co.in','hdfcbank.com','icicibank.com'];
  if (brands.some(b => url.toLowerCase().includes(b)) && !official.some(o => url.includes(o))) s += 25;
  return Math.min(100, s);
}

// Email sender analysis (also needed in background for context-menu)
function analyzeEmailSender(emailStr) {
  const lo = emailStr.toLowerCase().trim();
  const addrMatch = lo.match(/<([^>]+)>/) || lo.match(/([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})/);
  if (!addrMatch) return { score: 0, verdict: 'safe', issues: [] };
  const emailAddr = addrMatch[1];
  const domain = emailAddr.split('@')[1] || '';
  const displayName = emailStr.toLowerCase().replace(/<.*>/, '').trim();
  let score = 0;
  const issues = [];
  const BRAND_MAP = {
    paypal: ['paypal.com'], amazon: ['amazon.com','amazon.in'], apple: ['apple.com'],
    microsoft: ['microsoft.com'], google: ['google.com'], sbi: ['sbi.co.in'],
    hdfc: ['hdfcbank.com'], icici: ['icicibank.com'], rbi: ['rbi.org.in'],
    netflix: ['netflix.com'], flipkart: ['flipkart.com'],
  };
  const free = ['gmail.com','yahoo.com','outlook.com','hotmail.com','rediffmail.com'];
  if (free.includes(domain)) {
    for (const [brand, legit] of Object.entries(BRAND_MAP)) {
      if ((displayName.includes(brand) || emailAddr.split('@')[0].includes(brand)) && !legit.includes(domain)) {
        score += 50; issues.push(`Display-name spoofing: claims to be ${brand.toUpperCase()} but sent from ${domain}`); break;
      }
    }
  }
  for (const [brand, legit] of Object.entries(BRAND_MAP)) {
    if ((emailAddr.includes(brand) || displayName.includes(brand)) && !legit.some(d => domain.endsWith(d))) {
      score += 45; issues.push(`${brand.toUpperCase()} emails should come from ${legit[0]}, not ${domain}`);
    }
  }
  if (/\.(xyz|top|tk|ml|cf|ga|icu)\b/.test(domain)) { score += 25; issues.push(`Suspicious domain TLD`); }
  if (new RegExp('paypal[\\-_.]|sbi[\\-_.]|hdfc[\\-_.]|amazon[\\-_.]').test(domain)) {
    score += 40; issues.push(`Possible typosquat domain: "${domain}"`);
  }
  return { score: Math.min(100, score), verdict: score >= 60 ? 'danger' : score >= 30 ? 'warn' : 'safe', issues };
}

// ── Risk Helpers ──────────────────────────────────────────────
function level(s) { return s>=80?'critical':s>=60?'high':s>=40?'medium':s>=20?'low':'safe'; }
function badgeColor(s) { return s>=80?'#ef4444':s>=60?'#f59e0b':s>=40?'#facc15':'#10b981'; }
function setBadge(tabId, score) {
  const text = score >= 10 ? String(score) : '';
  try { chrome.action.setBadgeBackgroundColor({ color: badgeColor(score), tabId }); } catch(e) {}
  try { if (chrome.action.setBadgeTextColor) chrome.action.setBadgeTextColor({ color: '#ffffff', tabId }); } catch(e) {}
  try { chrome.action.setBadgeText({ text, tabId }); } catch(e) {}
}

// ── Fetch with Timeout ────────────────────────────────────────
async function fetchT(url, ms, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); } finally { clearTimeout(t); }
}

// ── Cloud Scan ────────────────────────────────────────────────
async function cloudScan(url) {
  try {
    const res = await fetchT(`${SB_URL}/functions/v1/detect-phishing`, 8000, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, content: '', type: 'url' })
    });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

// ── Notification Helper ───────────────────────────────────────
function notify(id, title, msg, priority = 1, requireInteraction = false) {
  try {
    chrome.notifications.create(id, {
      type: 'basic', iconUrl: 'icons/icon128.png',
      title, message: msg, priority,
      requireInteraction
    });
  } catch(e) { console.error('Notification error:', e); }
}

// ── Full Page Scan Flow ───────────────────────────────────────
async function scanPage(url, tabId) {
  if (!url?.startsWith('http')) return;
  if (isTrustedHost(url)) {
    CACHE.set(url, { score: 0, level: 'safe', ts: Date.now() });
    setBadge(tabId, 0);
    try { chrome.tabs.sendMessage(tabId, { action: 'RISK_UPDATE', score: 0, level: 'safe', indicators: [] }); } catch(e) {}
    return;
  }

  // Cache check
  const cached = CACHE.get(url);
  if (cached && Date.now() - cached.ts < TTL) { setBadge(tabId, cached.score); return; }

  // 1. ML local
  const local = offlineScore(url);
  CACHE.set(url, { score: local, level: level(local), ts: Date.now() });
  setBadge(tabId, local);
  try { chrome.tabs.sendMessage(tabId, { action: 'RISK_UPDATE', score: local, level: level(local) }); } catch(e) {}

  // 2. Cloud
  const cloud = await cloudScan(url);
  if (!cloud) return;
  const final = Math.max(local, cloud.riskScore || 0);
  CACHE.set(url, { score: final, level: level(final), indicators: cloud.threatIndicators, ts: Date.now() });
  setBadge(tabId, final);
  try { chrome.tabs.sendMessage(tabId, { action: 'RISK_UPDATE', score: final, level: level(final), indicators: cloud.threatIndicators || [] }); } catch(e) {}

  // Get user threshold setting
  chrome.storage.local.get(['set-threshold','set-notif'], res => {
    const threshold = parseInt(res['set-threshold'] || '60');
    const notifOn   = res['set-notif'] !== false;
    if (!notifOn) return;

    if (final >= 95) {
      notify(`phish_${tabId}`, '🚨 PHISHING SITE DETECTED — Norix',
        `CRITICAL RISK (${final}/100): DO NOT enter passwords, OTPs, or card details. Leave this page immediately.`, 2, true);
    } else if (final >= threshold) {
      notify(`warn_${tabId}`, '⚠️ Norix — Suspicious Page Detected',
        `Risk: ${final}/100 — This page has phishing indicators. Verify the domain before entering any information.`, 1);
    }
  });
}

// ── Context Menus ─────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  const menus = [
    { id:'pg-scan-link',  title:'🛡️ Analyze Link (Norix Universal)',   contexts:['link']      },
    { id:'pg-scan-text',  title:'🛡️ Analyze Selected Text',                  contexts:['selection'] },
    { id:'pg-scan-email', title:'📧 Extract & Analyze Email Sender',          contexts:['selection'] },
    { id:'pg-scan-phone', title:'📞 TrueScan Phone Intelligence',             contexts:['selection'] },
    { id:'pg-scan-voice', title:'🎙️ Analyze Voice/Transcript',                contexts:['selection'] },
    { id:'pg-scan-page',  title:'🛡️ Re-scan this page',                      contexts:['page']      },
    { id:'sep1', type:'separator', contexts:['all'] },
    { id:'pg-tools', title: '⚙️ Enterprise Suite Tools', contexts:['all'] },
    { id:'pg-dash', parentId:'pg-tools', title:'📊 Security Dashboard',      contexts:['all'] },
    { id:'pg-email', parentId:'pg-tools', title:'✉️ Email Intelligence',      contexts:['all'] },
    { id:'pg-adbox', parentId:'pg-tools', title:'🚫 Active Ad Blocker',      contexts:['all'] },
    { id:'pg-sandbox', parentId:'pg-tools', title:'📦 Open Sandbox Browser', contexts:['all'] },
    { id:'pg-bdr', parentId:'pg-tools', title:'🔒 Enterprise BDR Security',  contexts:['all'] },
    { id:'pg-fairness', parentId:'pg-tools', title:'⚖️ AI Fairness Audit',     contexts:['all'] },
  ];
  menus.forEach(m => {
    try { chrome.contextMenus.create(m); } catch(e) { console.error('Menu error:', e); }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pg-scan-link' && info.linkUrl) {
    const score = offlineScore(info.linkUrl);
    const emoji  = score >= 60 ? '⚠️' : score >= 40 ? '⚡' : '✅';
    notify(`link_${Date.now()}`, `${emoji} Norix — Link Scan`,
      `${info.linkUrl.slice(0, 80)}\nRisk Score: ${score}/100 (${level(score).toUpperCase()})`, score >= 60 ? 2 : 1);
    cloudScan(info.linkUrl).then(r => {
      if (r && r.riskScore > score) notify(`link_upd_${Date.now()}`, '🔍 Norix — Cloud Result',
        `Updated: ${r.riskScore}/100 — ${(r.riskLevel||'').toUpperCase()}`, r.riskScore >= 60 ? 2 : 0);
    });
  }

  if (info.menuItemId === 'pg-scan-email' && info.selectionText) {
    const analysis = analyzeEmailSender(info.selectionText);
    const icon = analysis.verdict === 'danger' ? '🚨' : analysis.verdict === 'warn' ? '⚡' : '✅';
    const msg = analysis.issues.length ? analysis.issues[0] : 'Sender appears legitimate.';
    notify(`email_${Date.now()}`, `${icon} Norix — Email Sender Analysis`,
      `Score: ${analysis.score}/100 — ${msg}`, analysis.score >= 60 ? 2 : 1);
  }

  if (info.menuItemId === 'pg-scan-text' && info.selectionText) {
    chrome.tabs.create({ url: `http://localhost:5173?text=${encodeURIComponent(info.selectionText.slice(0, 500))}` });
  }

  if (info.menuItemId === 'pg-scan-phone' && info.selectionText) {
    chrome.tabs.create({ url: `http://localhost:5173?page=phone_intel&phone=${encodeURIComponent(info.selectionText)}` });
  }

  if (info.menuItemId === 'pg-scan-voice' && info.selectionText) {
    chrome.tabs.create({ url: `http://localhost:5173?page=voice_scan&transcript=${encodeURIComponent(info.selectionText)}` });
  }

  if (info.menuItemId === 'pg-scan-page' && tab?.url) {
    CACHE.delete(tab.url); // force re-scan
    scanPage(tab.url, tab.id);
  }

  if (info.menuItemId === 'pg-dash') chrome.tabs.create({ url: 'http://localhost:5173?page=universal' });
  if (info.menuItemId === 'pg-sandbox') chrome.tabs.create({ url: 'http://localhost:5173?page=sandbox' });
  if (info.menuItemId === 'pg-adbox') chrome.tabs.create({ url: 'http://localhost:5173?page=ad_blocker' });
  if (info.menuItemId === 'pg-email') chrome.tabs.create({ url: 'http://localhost:5173?page=email_intel' });
  if (info.menuItemId === 'pg-bdr') chrome.tabs.create({ url: 'http://localhost:5173?page=enterprise' });
  if (info.menuItemId === 'pg-fairness') chrome.tabs.create({ url: 'http://localhost:5173?page=fairness' });
});

// ── Tab Navigation Events ─────────────────────────────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    chrome.storage.local.get('set-auto', res => {
      if (res['set-auto'] !== false) scanPage(tab.url, tabId);
    });
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, tab => {
    if (!tab?.url?.startsWith('http')) return;
    const cached = CACHE.get(tab.url);
    if (cached && Date.now() - cached.ts < TTL) { setBadge(tabId, cached.score); return; }
    scanPage(tab.url, tabId);
  });
});

// ── Keyboard Commands ─────────────────────────────────────────
chrome.commands?.onCommand?.addListener(cmd => {
  if (cmd === 'scan-page') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.url) { CACHE.delete(tab.url); scanPage(tab.url, tab.id); }
    });
  }
  if (cmd === 'toggle-adblocker') {
    chrome.storage.local.get('set-adblocker', res => {
      const next = res['set-adblocker'] === false;
      chrome.storage.local.set({ 'set-adblocker': next });
      notify('adblock_toggle', `Norix — Ad Blocker ${next ? 'Enabled' : 'Disabled'}`,
        next ? 'Ad blocker is now ON. Ads will be removed automatically.' : 'Ad blocker turned off.', 0);
      // Toggle DNR rule sets
      const enabledIds  = next ? ['ad_blocker_rules'] : [];
      const disabledIds = next ? [] : ['ad_blocker_rules'];
      try { chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: enabledIds, disableRulesetIds: disabledIds }); } catch(e) {}
    });
  }
});

// ── Messages ──────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  // Cached result
  if (msg.action === 'GET_CACHED') {
    const c = CACHE.get(msg.url);
    reply(c && Date.now() - c.ts < TTL ? c : null);
    return true;
  }

  // Text scam scan
  if (msg.action === 'SCAN_TEXT') {
    fetchT(`${SB_URL}/functions/v1/detect-phishing`, 8000, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '', content: msg.text, type: 'message' })
    }).then(r => r.json()).then(d => reply(d)).catch(() => reply(null));
    return true;
  }

  // Email sender analysis from content script
  if (msg.action === 'ANALYZE_SENDER') {
    const result = analyzeEmailSender(msg.email);
    reply(result);
    return true;
  }

  // Content script DOM findings
  if (msg.action === 'CONTENT_FINDINGS') {
    const tabId = sender.tab?.id;
    if (!tabId) return true;
    const extra = msg.findings.reduce((acc, f) => acc + (f.weight || 0), 0);
    const current = CACHE.get(sender.tab.url)?.score || 0;
    const updated = Math.min(100, current + extra);
    if (updated > current + 5) {
      setBadge(tabId, updated);
      CACHE.set(sender.tab.url, { score: updated, level: level(updated), ts: Date.now() });
      try { chrome.tabs.sendMessage(tabId, { action: 'RISK_UPDATE', score: updated, level: level(updated) }); } catch(e) {}
    }
    return true;
  }

  // Notification request from popup
  if (msg.action === 'SHOW_NOTIFICATION') {
    notify(`popup_${Date.now()}`, '⚠️ Norix — High Risk Detected',
      `${msg.url?.slice(0,60)}\nRisk: ${msg.score}/100`, msg.score >= 80 ? 2 : 1);
    return true;
  }

  return true;
});
