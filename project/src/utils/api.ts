import { AnalysisResult, Stats, ThreatDetection, Explanation } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildLocalAnalysisResult, computeMlForType, type AnalyzePhishingType } from './localAnalysis';
import type { MLPrediction } from './mlDetection';
import { resolveGeminiModels } from './gemini';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when Edge Functions can be called with a valid anon JWT. */
export function isSupabaseAnalysisConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      SUPABASE_ANON_KEY.startsWith('eyJ')
  );
}

function getAuthHeaders() {
  if (!SUPABASE_URL) {
    throw new Error("Missing VITE_SUPABASE_URL in .env");
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error("Missing VITE_SUPABASE_ANON_KEY in .env");
  }

  // Supabase anon key is a JWT (usually starts with 'eyJ').
  // If you paste an 'sb_publishable_*' key here, Edge Functions will return 401 invalid JWT.
  if (!SUPABASE_ANON_KEY.startsWith("eyJ")) {
    throw new Error(
      "Invalid Supabase anon key in .env. Use the 'anon public' JWT from Supabase Dashboard → Project Settings → API (it starts with 'eyJ...')."
    );
  }

  return {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  } as Record<string, string>;
}

export type { AnalyzePhishingType };

export async function analyzePhishing(
  url: string,
  content: string,
  type: AnalyzePhishingType
): Promise<AnalysisResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/detect-phishing`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, content, type }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Analysis failed (${response.status})`);
  }

  return await response.json();
}

export type PhishingAnalysisBundle = {
  result: AnalysisResult;
  ml: MLPrediction;
  source: 'cloud' | 'local';
};

/**
 * One ML pass + either Supabase Edge Function or the same-shaped local heuristic result.
 */
export async function analyzePhishingWithFallback(
  url: string,
  content: string,
  type: AnalyzePhishingType
): Promise<PhishingAnalysisBundle> {
  const ml = computeMlForType(url, content, type);
  if (!isSupabaseAnalysisConfigured()) {
    return { result: buildLocalAnalysisResult(url, content, type, ml), ml, source: 'local' };
  }
  try {
    const result = await analyzePhishing(url, content, type);
    return { result, ml, source: 'cloud' };
  } catch (e) {
    console.warn('[Norix] Cloud analysis failed, using local heuristics:', e);
    return { result: buildLocalAnalysisResult(url, content, type, ml), ml, source: 'local' };
  }
}

export async function getExplanation(
  detectionId: string,
  threatIndicators: any[],
  riskScore: number,
  content: string
): Promise<Explanation> {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('pg-gemini-key');
  
  if (!GEMINI_API_KEY) {
    throw new Error('No Gemini API Key found. Please add it in the PhishBot settings tab.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const models = await resolveGeminiModels(GEMINI_API_KEY);
  const systemInstruction =
    'You are a strict JSON cybersecurity analyzer. You MUST return ONLY a valid JSON object with {"summary": string, "keyFactors": string[], "recommendation": string}. No markdown code blocks, just pure JSON.';

  const prompt = `
    Analyze this threat:
    Risk Score: ${riskScore}/100
    Content: ${content}
    Indicators: ${JSON.stringify(threatIndicators)}
    
    Provide a brief simple summary, 3 key factors, and 1 direct recommendation. return RAW JSON.
  `;

  let lastError: unknown = null;
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text) as Explanation;
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
  const message = lastError instanceof Error ? lastError.message : String(lastError || 'unknown error');
  throw new Error(`Failed to get explanation from Gemini: ${message}`);
}

export async function submitReport(
  urlOrContent: string,
  reportType: string,
  threatCategory: string,
  description: string
): Promise<any> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/community-reports?action=submit`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urlOrContent, reportType, threatCategory, description }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to submit report (${response.status})`);
  }

  return await response.json();
}

export async function getStats(): Promise<Stats> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/threat-stats?action=stats`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch stats (${response.status})`);
  }

  return await response.json();
}

export async function getRecentDetections(limit: number = 10): Promise<ThreatDetection[]> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/threat-stats?action=recent&limit=${limit}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch recent detections (${response.status})`);
  }

  return await response.json();
}
