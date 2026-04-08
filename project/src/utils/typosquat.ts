/**
 * Light-weight typosquat detection (edit distance), avoids substring false positives
 * (e.g. yahoo.co.jp vs yahoo.com).
 */

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const row = new Uint16Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

const COMMON_BRAND_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'apple.com',
  'paypal.com',
  'amazon.com',
  'microsoft.com',
  'facebook.com',
  'instagram.com',
  'netflix.com',
  'linkedin.com',
];

export interface TyposquatHit {
  target: string;
  distance: number;
}

/** Returns a hit only if edit distance is small and labels are similar length (avoids noise). */
export function detectTyposquatDomain(domain: string): TyposquatHit | null {
  const d = domain.toLowerCase().trim();
  if (!d || d.length < 4) return null;

  for (const target of COMMON_BRAND_DOMAINS) {
    if (d === target) return null;
    const dist = levenshtein(d, target);
    const maxLen = Math.max(d.length, target.length);
    // distance 1–2 only, and domains must be comparable length (no "ya" vs "yahoo.com")
    if (dist >= 1 && dist <= 2 && maxLen <= 24 && Math.abs(d.length - target.length) <= 3) {
      return { target, distance: dist };
    }
  }
  return null;
}
