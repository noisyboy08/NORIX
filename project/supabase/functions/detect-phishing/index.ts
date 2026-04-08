import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PhishingAnalysisRequest {
  url?: string;
  content?: string;
  type: 'url' | 'email' | 'website' | 'message';
}

interface ThreatIndicator {
  rule: string;
  matched: boolean;
  weight: number;
  description: string;
}

interface AnalysisResult {
  riskScore: number;
  riskLevel: string;
  isPhishing: boolean;
  detectionId?: string;
  threatIndicators: ThreatIndicator[];
  analysisDetails: {
    urlAnalysis?: any;
    contentAnalysis?: any;
    knownThreatMatch?: boolean;
    communityReports?: {
      matched: boolean;
      reportCount: number;
      category?: string;
    };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { url, content, type }: PhishingAnalysisRequest = await req.json();

    if (!url && !content) {
      return new Response(
        JSON.stringify({ error: "URL or content is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: rules } = await supabase
      .from("detection_rules")
      .select("*")
      .eq("is_enabled", true);

    const { data: knownThreats } = await supabase
      .from("known_threats")
      .select("*")
      .eq("is_active", true);

    const { data: scamPatterns } = await supabase
      .from("scam_patterns")
      .select("*")
      .eq("is_active", true);

    let riskScore = 0;
    const threatIndicators: ThreatIndicator[] = [];
    const analysisDetails: any = {};

    if (url) {
      const urlAnalysis = analyzeURL(url, rules || [], knownThreats || []);
      riskScore += urlAnalysis.score;
      threatIndicators.push(...urlAnalysis.indicators);
      analysisDetails.urlAnalysis = urlAnalysis.details;
    }

    if (content) {
      const contentAnalysis = analyzeContent(content, rules || [], knownThreats || [], scamPatterns || []);
      riskScore += contentAnalysis.score;
      threatIndicators.push(...contentAnalysis.indicators);
      analysisDetails.contentAnalysis = contentAnalysis.details;
    }

    const communitySignal = await getCommunityReportSignal(supabase, url || "", content || "");
    if (communitySignal.matched) {
      const weight = Math.min(30, 10 + (communitySignal.reportCount - 1) * 5);
      riskScore += weight;
      threatIndicators.push({
        rule: "Community Reported Threat",
        matched: true,
        weight,
        description:
          communitySignal.category
            ? `Reported by community (${communitySignal.reportCount} reports) as ${communitySignal.category}`
            : `Reported by community (${communitySignal.reportCount} reports)`,
      });
      analysisDetails.communityReports = {
        matched: true,
        reportCount: communitySignal.reportCount,
        category: communitySignal.category,
      };
    } else {
      analysisDetails.communityReports = { matched: false, reportCount: 0 };
    }

    const knownThreatMatch = checkKnownThreats(url || '', content || '', knownThreats || []);
    if (knownThreatMatch.isMatch) {
      riskScore += 50;
      threatIndicators.push({
        rule: "Known Threat Database Match",
        matched: true,
        weight: 50,
        description: knownThreatMatch.description,
      });
      analysisDetails.knownThreatMatch = true;
    }

    riskScore = Math.min(100, riskScore);

    const riskLevel = getRiskLevel(riskScore);
    const isPhishing = riskScore >= 60;

    const result: AnalysisResult = {
      riskScore,
      riskLevel,
      isPhishing,
      threatIndicators: threatIndicators.filter(i => i.matched),
      analysisDetails,
    };

    const insertPayloadBase = {
      detection_type: type,
      risk_score: riskScore,
      risk_level: riskLevel,
      threat_indicators: threatIndicators.filter(i => i.matched),
      analysis_details: analysisDetails,
      is_phishing: isPhishing,
    };

    // Backward-compatible DB schema support:
    // - Old schema: `url`
    // - New schema: `url_or_content`
    const primaryValue = url || content?.substring(0, 500);

    let inserted: any = null;
    let insertError: any = null;

    ({ data: inserted, error: insertError } = await supabase
      .from("threat_detections")
      .insert({ ...insertPayloadBase, url_or_content: primaryValue })
      .select("id")
      .single());

    if (insertError) {
      const fallback = await supabase
        .from("threat_detections")
        .insert({ ...insertPayloadBase, url: primaryValue })
        .select("id")
        .single();

      inserted = fallback.data;
      insertError = fallback.error;
    }

    if (!insertError && inserted?.id) result.detectionId = inserted.id;

    if (knownThreatMatch.threatId) {
      await supabase
        .from("known_threats")
        .update({
          times_detected: knownThreats?.find(t => t.id === knownThreatMatch.threatId)?.times_detected + 1 || 1,
          last_seen: new Date().toISOString(),
        })
        .eq("id", knownThreatMatch.threatId);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function analyzeURL(url: string, rules: any[], knownThreats: any[]) {
  let score = 0;
  const indicators: ThreatIndicator[] = [];
  const details: any = {};

  try {
    const urlObj = new URL(url);
    details.protocol = urlObj.protocol;
    details.hostname = urlObj.hostname;
    details.length = url.length;

    if (!url.startsWith('https://')) {
      const rule = rules.find(r => r.rule_name === 'No HTTPS');
      const weight = rule?.weight || 20;
      score += weight;
      indicators.push({
        rule: "No HTTPS",
        matched: true,
        weight,
        description: "Insecure connection - not using HTTPS",
      });
    }

    if (url.length > 75) {
      const rule = rules.find(r => r.rule_name === 'Long URL');
      const weight = rule?.weight || 10;
      score += weight;
      indicators.push({
        rule: "Long URL",
        matched: true,
        weight,
        description: `URL is ${url.length} characters (suspicious)`,
      });
    }

    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
      const rule = rules.find(r => r.rule_name === 'IP Address in URL');
      const weight = rule?.weight || 25;
      score += weight;
      indicators.push({
        rule: "IP Address in URL",
        matched: true,
        weight,
        description: "Using IP address instead of domain name",
      });
    }

    const suspiciousTLDs = ['.xyz', '.top', '.club', '.work', '.site', '.online', '.info'];
    if (suspiciousTLDs.some(tld => url.includes(tld))) {
      const rule = rules.find(r => r.rule_name === 'Suspicious TLD');
      const weight = rule?.weight || 15;
      score += weight;
      indicators.push({
        rule: "Suspicious TLD",
        matched: true,
        weight,
        description: "Using domain extension commonly associated with phishing",
      });
    }

    const subdomainCount = (urlObj.hostname.match(/\./g) || []).length;
    if (subdomainCount > 3) {
      const rule = rules.find(r => r.rule_name === 'Multiple Subdomains');
      const weight = rule?.weight || 15;
      score += weight;
      indicators.push({
        rule: "Multiple Subdomains",
        matched: true,
        weight,
        description: `${subdomainCount} subdomains detected (obfuscation tactic)`,
      });
    }

    if (/@/.test(url) || url.match(/\/\//g)?.length > 1) {
      const rule = rules.find(r => r.rule_name === 'Suspicious Characters');
      const weight = rule?.weight || 10;
      score += weight;
      indicators.push({
        rule: "Suspicious Characters",
        matched: true,
        weight,
        description: "Contains URL obfuscation characters",
      });
    }

    const shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 't.co'];
    if (shorteners.some(s => url.includes(s))) {
      const rule = rules.find(r => r.rule_name === 'Shortened URL');
      const weight = rule?.weight || 15;
      score += weight;
      indicators.push({
        rule: "Shortened URL",
        matched: true,
        weight,
        description: "URL shortener hides actual destination",
      });
    }

    details.subdomains = subdomainCount;
  } catch (e) {
    score += 30;
    indicators.push({
      rule: "Invalid URL",
      matched: true,
      weight: 30,
      description: "Malformed or invalid URL structure",
    });
  }

  return { score, indicators, details };
}

function analyzeContent(content: string, rules: any[], knownThreats: any[], scamPatterns: any[]) {
  let score = 0;
  const indicators: ThreatIndicator[] = [];
  const details: any = {};

  const contentLower = content.toLowerCase();

  const urgencyKeywords = ['urgent', 'suspended', 'verify', 'confirm', 'update', 'expire', 'immediately', 'action required', 'limited time'];
  const urgencyMatches = urgencyKeywords.filter(k => contentLower.includes(k));
  if (urgencyMatches.length > 0) {
    const rule = rules.find(r => r.rule_name === 'Urgency Keywords');
    const weight = (rule?.weight || 20) * Math.min(urgencyMatches.length, 2);
    score += weight;
    indicators.push({
      rule: "Urgency Keywords",
      matched: true,
      weight,
      description: `Urgency tactics detected: ${urgencyMatches.join(', ')}`,
    });
  }

  const credentialKeywords = ['password', 'login', 'credential', 'account', 'ssn', 'social security', 'pin', 'otp'];
  const credentialMatches = credentialKeywords.filter(k => contentLower.includes(k));
  if (credentialMatches.length > 0) {
    const rule = rules.find(r => r.rule_name === 'Credential Request');
    const weight = (rule?.weight || 15) * Math.min(credentialMatches.length, 2);
    score += weight;
    indicators.push({
      rule: "Credential Request",
      matched: true,
      weight,
      description: `Requesting sensitive information: ${credentialMatches.join(', ')}`,
    });
  }

  const brands = ['paypal', 'apple', 'microsoft', 'google', 'amazon', 'bank', 'netflix', 'facebook', 'instagram'];
  const brandMatches = brands.filter(b => contentLower.includes(b));
  if (brandMatches.length > 0) {
    const rule = rules.find(r => r.rule_name === 'Brand Impersonation');
    const weight = rule?.weight || 25;
    score += weight;
    indicators.push({
      rule: "Brand Impersonation",
      matched: true,
      weight,
      description: `Possible impersonation of: ${brandMatches.join(', ')}`,
    });
  }

  const detectedPatterns: string[] = [];
  for (const pattern of scamPatterns) {
    for (const keyword of pattern.keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        detectedPatterns.push(pattern.pattern_type);
        score += pattern.risk_weight;
        break;
      }
    }
  }

  if (detectedPatterns.length > 0) {
    const uniquePatterns = [...new Set(detectedPatterns)];
    indicators.push({
      rule: "Scam Pattern Detected",
      matched: true,
      weight: 20,
      description: `Common scam patterns identified: ${uniquePatterns.join(', ')}`,
    });
    details.scamPatterns = uniquePatterns;
  }

  details.urgencyKeywords = urgencyMatches;
  details.credentialKeywords = credentialMatches;
  details.brandMentions = brandMatches;
  details.contentLength = content.length;

  return { score, indicators, details };
}

function checkKnownThreats(url: string, content: string, knownThreats: any[]) {
  for (const threat of knownThreats) {
    if (threat.threat_type === 'domain' && url.includes(threat.threat_value)) {
      return {
        isMatch: true,
        description: threat.description || 'Matches known phishing domain',
        threatId: threat.id,
      };
    }
    if (threat.threat_type === 'keyword' && (url.toLowerCase().includes(threat.threat_value.toLowerCase()) || content.toLowerCase().includes(threat.threat_value.toLowerCase()))) {
      return {
        isMatch: true,
        description: threat.description || 'Matches known phishing pattern',
        threatId: threat.id,
      };
    }
  }
  return { isMatch: false, description: '', threatId: null };
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'safe';
}

async function getCommunityReportSignal(
  supabase: any,
  url: string,
  content: string
): Promise<{ matched: boolean; reportCount: number; category?: string }> {
  const candidates: string[] = [];

  if (url) {
    candidates.push(url);
    try {
      const u = new URL(url);
      candidates.push(u.hostname);
    } catch {
      // ignore
    }
  }

  if (content) {
    candidates.push(content.substring(0, 200));
  }

  for (const candidate of candidates) {
    if (!candidate) continue;

    const { data } = await supabase
      .from("user_reports")
      .select("report_count, threat_category")
      .eq("url_or_content", candidate)
      .order("report_count", { ascending: false })
      .limit(1);

    const top = data?.[0];
    if (top?.report_count && top.report_count >= 1) {
      return {
        matched: true,
        reportCount: top.report_count,
        category: top.threat_category,
      };
    }
  }

  return { matched: false, reportCount: 0 };
}
