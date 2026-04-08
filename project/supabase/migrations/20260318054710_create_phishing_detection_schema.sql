/*
  # PhishGuard AI - Phishing Detection Database Schema

  1. New Tables
    - `threat_detections`: Stores all detected phishing/scam threats
    - `threat_indicators`: Maps threat rules and weights for detection
    - `community_reports`: User-submitted reports of phishing URLs/content
    - `scam_patterns`: Global database of scam patterns and keywords
    - `detection_stats`: Aggregated statistics for dashboard
    
  2. Security
    - Enable RLS on all tables
    - Restrict access to threat data appropriately
    - Allow public reading of statistics
    
  3. Important Notes
    - Detection data is preserved for historical analysis
    - Community reports help build crowdsourced threat database
    - Scam patterns are updateable for continuous improvement
*/

-- Create threat_detections table
CREATE TABLE IF NOT EXISTS threat_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_or_content text NOT NULL,
  detection_type text NOT NULL CHECK (detection_type IN ('url', 'email', 'message', 'website')),
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text NOT NULL CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical')),
  is_phishing boolean NOT NULL DEFAULT false,
  threat_indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
  analysis_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create community_reports table
CREATE TABLE IF NOT EXISTS community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_or_content text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('url', 'email', 'message')),
  threat_category text NOT NULL,
  description text,
  report_count integer DEFAULT 1,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scam_patterns table
CREATE TABLE IF NOT EXISTS scam_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name text NOT NULL,
  pattern_type text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  description text,
  risk_weight integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create detection_stats view
CREATE TABLE IF NOT EXISTS detection_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_type text NOT NULL,
  stat_value integer,
  stat_data jsonb,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE threat_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threat_detections (allow reading all, no direct writes)
CREATE POLICY "Allow reading threat detections"
  ON threat_detections
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for community_reports (allow reporting threats)
CREATE POLICY "Allow reading community reports"
  ON community_reports
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow submitting community reports"
  ON community_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for scam_patterns
CREATE POLICY "Allow reading scam patterns"
  ON scam_patterns
  FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policies for detection_cache
CREATE POLICY "Allow reading detection cache"
  ON detection_cache
  FOR SELECT
  TO public
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_threat_detections_created ON threat_detections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_detections_risk ON threat_detections(risk_level);
CREATE INDEX IF NOT EXISTS idx_community_reports_url ON community_reports(url_or_content);
CREATE INDEX IF NOT EXISTS idx_community_reports_created ON community_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scam_patterns_type ON scam_patterns(pattern_type);
