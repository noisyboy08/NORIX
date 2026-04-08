/**
 * Local heuristic analysis when Supabase Edge Functions are unavailable.
 */
import type { AnalysisResult, ThreatIndicator } from '../types';
import type { MLPrediction } from './mlDetection';
import { mlScanURL, mlScanText, mlScanPhone } from './mlDetection';
import { detectTyposquatDomain } from './typosquat';
import { isTrustedHost } from './trustedDomains';

function riskLevel(score: number): string {
  if (score >= 75) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 35) return 'medium';
  if (score >= 18) return 'low';
  return 'safe';
}

function mlFeaturesToIndicators(features: { name: string; weight: number; triggered: boolean }[]): ThreatIndicator[] {
  return features
    .filter((f) => f.triggered)
    .map((f) => ({
      rule: f.name,
      matched: true,
      weight: f.weight,
      description: `Heuristic signal: “${f.name}” contributed to the risk estimate. Verify independently before acting.`,
    }));
}

function parseHostFromUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`);
    return u.hostname.toLowerCase() || null;
  } catch {
    return null;
  }
}

export type AnalyzePhishingType = 'url' | 'email' | 'website' | 'message' | 'phone';

/** Single ML pass for a request type — reuse everywhere to avoid duplicate scoring. */
export function computeMlForType(url: string, content: string, type: AnalyzePhishingType): MLPrediction {
  if (type === 'url' || type === 'website') {
    const raw = (url || content).trim();
    return mlScanURL(raw);
  }
  if (type === 'phone') return mlScanPhone(content.trim());
  return mlScanText(content.trim());
}

export function buildLocalAnalysisResult(
  url: string,
  content: string,
  type: AnalyzePhishingType,
  ml: MLPrediction
): AnalysisResult {
  const indicators: ThreatIndicator[] = [...mlFeaturesToIndicators(ml.features)];
  let baseScore = ml.score;

  if (type === 'url' || type === 'website') {
    const raw = url.trim() || content.trim();
    const host = parseHostFromUrl(raw);
    if (host && isTrustedHost(host)) {
      indicators.push({
        rule: 'Known reputable host',
        matched: true,
        weight: 0,
        description:
          'Domain matches a widely used legitimate provider. Score is damped — still verify the full URL and context.',
      });
      baseScore = Math.min(baseScore, Math.round(baseScore * 0.35 + 8));
    }
  } else {
    const text = content.trim();
    const emailMatch = text.match(/\b[\w.+-]+@([\w.-]+\.[a-z]{2,})\b/i);
    const senderDomain = emailMatch?.[1]?.toLowerCase() || '';
    if (senderDomain) {
      const squat = detectTyposquatDomain(senderDomain);
      if (squat) {
        baseScore = Math.min(100, baseScore + 28);
        indicators.push({
          rule: 'Possible typosquat domain',
          matched: true,
          weight: 28,
          description: `Sender domain “${senderDomain}” is very close (edit distance ${squat.distance}) to “${squat.target}”. Confirm the sender through another channel.`,
        });
      }
    }
  }

  const riskScore = Math.max(0, Math.min(100, Math.round(baseScore)));
  const level = riskLevel(riskScore);

  indicators.push({
    rule: 'Analysis source',
    matched: true,
    weight: 0,
    description: `Local ${ml.modelVersion} — advisory only. Configure Supabase + detect-phishing Edge Function for enriched server-side checks.`,
  });

  return {
    riskScore,
    riskLevel: level,
    isPhishing: riskScore >= 55,
    detectionId: `local-${Date.now()}`,
    threatIndicators: indicators,
    analysisDetails: {
      urlAnalysis: type === 'url' || type === 'website' ? { engine: 'local', note: 'Heuristic + URL structure' } : undefined,
      contentAnalysis: type !== 'url' && type !== 'website' ? { engine: 'local', note: 'Heuristic text / script signals' } : undefined,
      knownThreatMatch: false,
      communityReports: { matched: false, reportCount: 0 },
    },
  };
}
