import { GoogleGenerativeAI } from '@google/generative-ai';

const PREFERRED = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

const modelCache = new Map<string, string[]>();

function normalizeModelName(name: string): string {
  return name.replace(/^models\//, '').trim();
}

/**
 * Discover available text generation models for this API key.
 * Falls back to a preferred static list if model listing is unavailable.
 */
export async function resolveGeminiModels(apiKey: string): Promise<string[]> {
  if (!apiKey) return [...PREFERRED];
  if (modelCache.has(apiKey)) return modelCache.get(apiKey)!;

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const listed = await genAI.listModels();
    const names = (listed?.models || [])
      .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m: any) => normalizeModelName(String(m.name || '')))
      .filter(Boolean);

    // Preserve preference order for known stable models, then include any other listed models.
    const preferred = PREFERRED.filter((p) => names.includes(p));
    const extra = names.filter((n) => !preferred.includes(n));
    const resolved = [...preferred, ...extra];
    if (resolved.length > 0) {
      modelCache.set(apiKey, resolved);
      return resolved;
    }
  } catch {
    // ignore and use static preference fallback
  }

  modelCache.set(apiKey, [...PREFERRED]);
  return [...PREFERRED];
}

