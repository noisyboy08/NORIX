/**
 * Domain Age Checker using RDAP (free, no API key)
 * Visual Similarity using brand fingerprinting
 * SSL Checker, IP Geolocation
 */

export interface DomainAgeResult {
  registrationDate: string | null;
  ageDays: number;
  isNew: boolean;
  isSuspicious: boolean;
  ageLabel: string;
  registrar: string;
}

export interface GeoIPResult {
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  lat: number;
  lon: number;
  isSuspicious: boolean;
}

export interface VisualSimilarityResult {
  detectedBrand: string | null;
  similarityScore: number;
  domainMatchesBrand: boolean;
  warning: string | null;
}

// ─── Domain Age (RDAP) ───────────────────────────────────────────────
export async function checkDomainAge(domain: string): Promise<DomainAgeResult> {
  try {
    // Clean domain
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    const response = await fetch(`https://rdap.org/domain/${cleanDomain}`, {
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error('RDAP unavailable');
    const data = await response.json();

    const regEvent = data.events?.find((e: any) =>
      e.eventAction?.toLowerCase().includes('registr')
    );

    const registrar = data.entities
      ?.find((e: any) => e.roles?.includes('registrar'))
      ?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || 'Unknown';

    if (!regEvent?.eventDate) throw new Error('No registration date');

    const regDate = new Date(regEvent.eventDate);
    const now = new Date();
    const ageDays = Math.floor((now.getTime() - regDate.getTime()) / 86400000);

    const ageLabel = ageDays < 1    ? '⚠️ Registered TODAY!' :
                     ageDays < 7    ? `⚠️ ${ageDays} days old` :
                     ageDays < 30   ? `${ageDays} days old` :
                     ageDays < 365  ? `${Math.floor(ageDays / 30)} months old` :
                                      `${Math.floor(ageDays / 365)} year(s) old`;

    return {
      registrationDate: regDate.toLocaleDateString('en-IN', { dateStyle: 'medium' }),
      ageDays,
      isNew: ageDays < 30,
      isSuspicious: ageDays < 7,
      ageLabel,
      registrar: registrar || 'Unknown'
    };
  } catch {
    return {
      registrationDate: null,
      ageDays: -1,
      isNew: false,
      isSuspicious: false,
      ageLabel: 'Could not fetch',
      registrar: 'Unknown'
    };
  }
}

// ─── IP Geolocation ───────────────────────────────────────────────────
export async function geolocateDomain(domain: string): Promise<GeoIPResult | null> {
  try {
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    const res = await fetch(`https://ip-api.com/json/${cleanDomain}?fields=country,countryCode,city,isp,lat,lon,hosting`, {
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return null;
    const d = await res.json();
    // Never mark "suspicious" from country alone — causes false positives for legitimate global hosting.
    return {
      country: d.country || 'Unknown',
      countryCode: d.countryCode || '??',
      city: d.city || 'Unknown',
      isp: d.isp || 'Unknown',
      lat: d.lat || 0,
      lon: d.lon || 0,
      isSuspicious: false
    };
  } catch {
    return null;
  }
}

// ─── Visual Similarity (Brand Fingerprinting) ─────────────────────────
const BRAND_PATTERNS: Record<string, { keywords: string[]; officialDomains: string[] }> = {
  'PayPal':    { keywords: ['paypal', 'pay pal', 'paypall'], officialDomains: ['paypal.com'] },
  'Apple':     { keywords: ['apple', 'icloud', 'itunes', 'apple id'], officialDomains: ['apple.com', 'icloud.com', 'mzstatic.com'] },
  'Microsoft': { keywords: ['microsoft', 'outlook', 'hotmail', 'office 365', 'azure'], officialDomains: ['microsoft.com', 'outlook.com', 'live.com', 'hotmail.com', 'azure.com', 'azurewebsites.net'] },
  'Google':    { keywords: ['google', 'gmail', 'youtube'], officialDomains: ['google.com', 'gmail.com', 'youtube.com', 'gstatic.com', 'googleusercontent.com', 'googleapis.com'] },
  'Amazon':    { keywords: ['amazon', 'aws', 'prime'], officialDomains: ['amazon.com', 'amazon.in', 'amazon.co.uk', 'aws.amazon.com', 'amazonaws.com'] },
  'Netflix':   { keywords: ['netflix'], officialDomains: ['netflix.com'] },
  'Facebook':  { keywords: ['facebook', 'meta', 'instagram', 'whatsapp'], officialDomains: ['facebook.com', 'instagram.com', 'meta.com'] },
  'SBI':       { keywords: ['sbi', 'state bank', 'yono'], officialDomains: ['sbi.co.in', 'onlinesbi.sbi'] },
  'HDFC':      { keywords: ['hdfc', 'hdfc bank', 'hdfcbank'], officialDomains: ['hdfcbank.com'] },
  'ICICI':     { keywords: ['icici', 'icici bank'], officialDomains: ['icicibank.com'] },
};

export function detectVisualSimilarity(domain: string, pageTitle: string = ''): VisualSimilarityResult {
  const combined = `${domain} ${pageTitle}`.toLowerCase();
  const cleanDomain = domain.replace(/^www\./, '');

  for (const [brand, pattern] of Object.entries(BRAND_PATTERNS)) {
    const matchedKeyword = pattern.keywords.find(k => combined.includes(k));
    if (!matchedKeyword) continue;

    const isOfficial = pattern.officialDomains.some(od => cleanDomain === od || cleanDomain.endsWith(`.${od}`));
    if (isOfficial) {
      return { detectedBrand: brand, similarityScore: 100, domainMatchesBrand: true, warning: null };
    }

    // Brand mentioned but domain is NOT official → impersonation
    const similarity = 70 + (matchedKeyword.length / 10) * 10;
    return {
      detectedBrand: brand,
      similarityScore: Math.min(99, Math.round(similarity)),
      domainMatchesBrand: false,
      warning: `This page claims to be ${brand} but is hosted on "${cleanDomain}" — not ${brand}'s official domain!`
    };
  }

  return { detectedBrand: null, similarityScore: 0, domainMatchesBrand: true, warning: null };
}
