export interface ThreatIndicator {
  rule: string;
  matched: boolean;
  weight: number;
  description: string;
}

export interface AnalysisResult {
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

export interface ThreatDetection {
  id: string;
  url_or_content: string;
  url?: string;
  detection_type: string;
  risk_score: number;
  risk_level: string;
  threat_indicators: ThreatIndicator[];
  analysis_details: any;
  is_phishing: boolean;
  created_at: string;
}

export interface Stats {
  totalScans: number;
  threatsDetected: number;
  safeResults: number;
  scansToday: number;
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    safe: number;
  };
  detectionRate: string;
}

export interface Explanation {
  explanation: string;
  riskFactors: Record<string, any>;
  recommendedAction: string;
}
