/**
 * Norix — local heuristic engine (feature weights + normalization).
 * This is not a trained neural network; treat scores as advisory, not proof.
 */

import { isTrustedHost } from './trustedDomains';

export interface MLPrediction {
  score: number;
  confidence: string;
  features: MLFeature[];
  modelVersion: string;
}

export interface MLFeature {
  name: string;
  value: number;
  weight: number;
  triggered: boolean;
}

export interface UrlParts {
  host: string;
  path: string;
  full: string;
  isTrust: boolean;
}

export function parseUrlParts(raw: string): UrlParts {
  const trimmed = raw.trim();
  try {
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = u.hostname.toLowerCase();
    const path = `${u.pathname}${u.search}`.toLowerCase();
    return {
      host,
      path,
      full: trimmed.toLowerCase(),
      isTrust: isTrustedHost(host),
    };
  } catch {
    return { host: '', path: trimmed.toLowerCase(), full: trimmed.toLowerCase(), isTrust: false };
  }
}

/** Count hostname labels (e.g. a.b.c.com → 4) */
function labelCount(host: string): number {
  if (!host) return 0;
  return host.split('.').filter(Boolean).length;
}

function runModel(
  input: string,
  features: { name: string; weight: number; extractor: (parts: UrlParts | null, lower: string) => number }[],
  useUrlParts: boolean
): MLPrediction {
  const lower = input.toLowerCase();
  const parts = useUrlParts ? parseUrlParts(input) : null;

  let rawScore = 0;
  let triggeredWeight = 0;
  const mlFeatures: MLFeature[] = [];

  features.forEach((f) => {
    const val = parts ? f.extractor(parts, lower) : f.extractor(null, lower);
    const w = val * f.weight;
    rawScore += w;
    if (val > 0) triggeredWeight += f.weight;
    mlFeatures.push({ name: f.name, value: val, weight: f.weight, triggered: val > 0 });
  });

  const maxPossible = features.reduce((s, f) => s + f.weight, 0);
  let score = maxPossible > 0 ? Math.round((rawScore / maxPossible) * 100) : 0;
  score = Math.max(0, Math.min(100, score));

  // Require multiple strong signals before very high scores (reduces single-feature panic)
  const triggerCount = mlFeatures.filter((x) => x.triggered).length;
  if (score >= 70 && triggerCount < 2) score = Math.min(score, 62);
  if (score >= 85 && triggerCount < 3) score = Math.min(score, 72);

  const confidence =
    triggeredWeight >= 50 ? 'high' : triggeredWeight >= 25 ? 'medium' : 'low';

  return {
    score,
    confidence,
    features: mlFeatures.filter((f) => f.triggered).slice(0, 12),
    modelVersion: 'Norix-v3-local-heuristic',
  };
}

// ─── URL features (host/path aware; trusted hosts skip noisy signals) ─────
const URL_FEATURES = [
  {
    name: 'No HTTPS',
    weight: 18,
    extractor: (p: UrlParts | null) => {
      if (!p?.host) return 0;
      if (p.isTrust) return 0;
      return p.full.startsWith('http://') && !p.full.startsWith('https://') ? 1 : 0;
    },
  },
  {
    name: 'IP address host',
    weight: 28,
    extractor: (p: UrlParts | null) => {
      if (!p?.host) return /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(p.full) ? 1 : 0;
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(p.host) ? 1 : 0;
    },
  },
  {
    name: 'Very long URL',
    weight: 8,
    extractor: (p: UrlParts | null, lower: string) => (p?.isTrust ? 0 : lower.length > 120 ? 1 : 0),
  },
  {
    name: 'Many hostname labels',
    weight: 12,
    extractor: (p: UrlParts | null) => {
      if (!p?.host || p.isTrust) return 0;
      const n = labelCount(p.host);
      return n >= 6 ? 1 : 0;
    },
  },
  {
    name: 'High-risk TLD',
    weight: 14,
    extractor: (p: UrlParts | null) => {
      if (!p?.host || p.isTrust) return 0;
      return /\.(xyz|top|club|work|site|online|zip|mov|tk|ml|ga|cf|gq|cc|buzz)\b/i.test(p.host) ? 1 : 0;
    },
  },
  {
    name: 'Credential path on unknown host',
    weight: 16,
    extractor: (p: UrlParts | null) => {
      if (!p || p.isTrust || !p.path) return 0;
      return /(\/signin|\/login|\/auth|\/verify|\/confirm|\/update|\/password|\/secure)/i.test(p.path) ? 1 : 0;
    },
  },
  {
    name: 'Brand-like host without official domain',
    weight: 26,
    extractor: (p: UrlParts | null) => {
      if (!p?.host || p.isTrust) return 0;
      const brands = ['paypal', 'apple', 'microsoft', 'google', 'amazon', 'netflix', 'facebook', 'instagram', 'whatsapp', 'sbi', 'hdfc', 'icici'];
      const official = [
        'paypal.com',
        'apple.com',
        'microsoft.com',
        'google.com',
        'amazon.com',
        'netflix.com',
        'facebook.com',
        'instagram.com',
        'whatsapp.com',
        'sbi.co.in',
        'hdfcbank.com',
        'icicibank.com',
      ];
      const host = p.host.replace(/^www\./, '');
      const mentionsBrand = brands.some((b) => host.includes(b));
      const isOfficial = official.some((od) => host === od || host.endsWith(`.${od}`));
      return mentionsBrand && !isOfficial ? 1 : 0;
    },
  },
  {
    name: 'URL shortener',
    weight: 14,
    extractor: (p: UrlParts | null) =>
      /(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|rb\.gy|cutt\.ly)\b/i.test(p?.full || '') ? 1 : 0,
  },
  {
    name: '@-in authority (credential trick)',
    weight: 22,
    extractor: (p: UrlParts | null, lower: string) => {
      try {
        const u = new URL(lower.startsWith('http') ? lower : `https://${lower}`);
        return u.username.includes('@') || /@[^/]+\//.test(lower) ? 1 : 0;
      } catch {
        return /@/.test(lower.split('?')[0]) ? 1 : 0;
      }
    },
  },
  {
    name: 'Excessive hyphens in host',
    weight: 10,
    extractor: (p: UrlParts | null) => {
      if (!p?.host || p.isTrust) return 0;
      return (p.host.match(/-/g) || []).length >= 4 ? 1 : 0;
    },
  },
  {
    name: 'Non-standard high port',
    weight: 8,
    extractor: (p: UrlParts | null) => {
      if (!p?.full) return 0;
      return /:(8080|8443|4444|8000|3000|5000|9000)\b/.test(p.full) ? 1 : 0;
    },
  },
];

const TEXT_FEATURES = [
  {
    name: 'Urgency + credential combo',
    weight: 28,
    extractor: (_: UrlParts | null, t: string) =>
      /(urgent|suspended|blocked|immediately|24 hours|act now)/i.test(t) &&
      /(otp|one[- ]time password|password|pin|cvv|card|aadhaar|kyc)/i.test(t)
        ? 1
        : 0,
  },
  { name: 'Urgency language', weight: 18, extractor: (_: UrlParts | null, t: string) => /(urgent|immediately|within 24 hours|act now|last chance|account (will be )?suspended|permanently (locked|closed))/i.test(t) ? 1 : 0 },
  { name: 'Credential / OTP request', weight: 22, extractor: (_: UrlParts | null, t: string) => /(share (your )?otp|send otp|one[- ]time password|cvv|card number|atm pin|net banking password|full card details)/i.test(t) ? 1 : 0 },
  { name: 'Brand + action combo', weight: 16, extractor: (_: UrlParts | null, t: string) => /(paypal|amazon|apple|microsoft|google|netflix|sbi|hdfc|icici).{0,40}(verify|confirm|update|unlock|restore)/i.test(t) ? 1 : 0 },
  { name: 'Financial scam phrasing', weight: 14, extractor: (_: UrlParts | null, t: string) => /(guaranteed returns|double your (money|btc)|send (us )?crypto|investment opportunity|recover your funds)/i.test(t) ? 1 : 0 },
  { name: 'KYC / bank pressure', weight: 16, extractor: (_: UrlParts | null, t: string) => /(complete kyc|kyc pending|pan linked|aadhaar link|bank will block|rbi has flagged)/i.test(t) ? 1 : 0 },
  { name: 'Prize / lottery', weight: 12, extractor: (_: UrlParts | null, t: string) => /(you('ve| have) won|lottery winner|claim (your )?prize|selected as winner)/i.test(t) ? 1 : 0 },
  { name: 'Threat / legal fear', weight: 12, extractor: (_: UrlParts | null, t: string) => /(arrest warrant|legal action|case filed|cyber crime notice|income tax raid)/i.test(t) ? 1 : 0 },
  { name: 'Generic link bait', weight: 8, extractor: (_: UrlParts | null, t: string) => /(click (this |the )?link|tap here to (verify|continue)|open (the )?attachment)/i.test(t) ? 1 : 0 },
];

const PHONE_FEATURES = [
  { name: 'OTP / card request in script', weight: 24, extractor: (_: UrlParts | null, t: string) => /(otp|one[- ]time password|cvv|card number|debit card|credit card|atm pin)/i.test(t) ? 1 : 0 },
  { name: 'ID / KYC exfiltration', weight: 20, extractor: (_: UrlParts | null, t: string) => /(aadhaar|pan card|passport|photo id|kyc details)/i.test(t) ? 1 : 0 },
  { name: 'Impersonated authority', weight: 18, extractor: (_: UrlParts | null, t: string) => /(calling from rbi|income tax department|cyber cell|police station|bank fraud department|amazon security)/i.test(t) ? 1 : 0 },
  { name: 'Urgency in call script', weight: 14, extractor: (_: UrlParts | null, t: string) => /(immediately|right now|don'?t tell anyone|keep this confidential|line will be disconnected)/i.test(t) ? 1 : 0 },
  { name: 'Payment / refund lure', weight: 14, extractor: (_: UrlParts | null, t: string) => /(refund processed|overpayment|install teamviewer|anydesk|remote access)/i.test(t) ? 1 : 0 },
];

export function mlScanURL(url: string): MLPrediction {
  return runModel(url, URL_FEATURES, true);
}

export function mlScanText(text: string): MLPrediction {
  return runModel(text, TEXT_FEATURES, false);
}

export function mlScanPhone(text: string): MLPrediction {
  return runModel(text, PHONE_FEATURES, false);
}
