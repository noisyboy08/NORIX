/*
  # Phishing Detection System Database Schema

  ## Overview
  Creates the complete database structure for an AI-powered phishing and social engineering detection system.

  ## New Tables
  
  ### `threat_detections`
  Stores all phishing detection results and analysis logs
  - `id` (uuid, primary key) - Unique detection ID
  - `url` (text) - The URL or content being analyzed
  - `detection_type` (text) - Type: 'url', 'email', 'website', 'message'
  - `risk_score` (numeric) - Risk score from 0-100
  - `risk_level` (text) - Classification: 'safe', 'low', 'medium', 'high', 'critical'
  - `threat_indicators` (jsonb) - Array of detected threat indicators
  - `analysis_details` (jsonb) - Detailed analysis breakdown
  - `is_phishing` (boolean) - Final determination
  - `user_reported` (boolean) - Whether user reported this
  - `ip_address` (text) - Source IP for tracking
  - `created_at` (timestamptz) - Detection timestamp

  ### `known_threats`
  Database of known phishing URLs, domains, and patterns
  - `id` (uuid, primary key) - Unique threat ID
  - `threat_type` (text) - Type: 'url', 'domain', 'keyword', 'pattern'
  - `threat_value` (text) - The actual threat (URL, domain, etc.)
  - `description` (text) - Description of the threat
  - `severity` (text) - Severity level
  - `source` (text) - Source of threat intelligence
  - `times_detected` (integer) - How many times detected
  - `last_seen` (timestamptz) - Last detection timestamp
  - `is_active` (boolean) - Whether threat is still active
  - `created_at` (timestamptz) - When added to database

  ### `detection_rules`
  Configurable detection rules and patterns
  - `id` (uuid, primary key) - Rule ID
  - `rule_name` (text) - Name of the rule
  - `rule_type` (text) - Type of rule
  - `pattern` (text) - Pattern to match
  - `weight` (numeric) - Weight in scoring (0-100)
  - `description` (text) - Rule description
  - `is_enabled` (boolean) - Whether rule is active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for detection endpoints (API-based auth)
  - Insert policies for logging detections
*/

-- Create threat_detections table
CREATE TABLE IF NOT EXISTS threat_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  detection_type text NOT NULL DEFAULT 'url',
  risk_score numeric NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'safe',
  threat_indicators jsonb DEFAULT '[]'::jsonb,
  analysis_details jsonb DEFAULT '{}'::jsonb,
  is_phishing boolean DEFAULT false,
  user_reported boolean DEFAULT false,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create known_threats table
CREATE TABLE IF NOT EXISTS known_threats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_type text NOT NULL,
  threat_value text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  source text DEFAULT 'user_reported',
  times_detected integer DEFAULT 0,
  last_seen timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create detection_rules table
CREATE TABLE IF NOT EXISTS detection_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_type text NOT NULL,
  pattern text NOT NULL,
  weight numeric NOT NULL DEFAULT 10,
  description text,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_threat_detections_created_at ON threat_detections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_detections_risk_level ON threat_detections(risk_level);
CREATE INDEX IF NOT EXISTS idx_known_threats_value ON known_threats(threat_value);
CREATE INDEX IF NOT EXISTS idx_known_threats_type ON known_threats(threat_type);

-- Enable RLS
ALTER TABLE threat_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_rules ENABLE ROW LEVEL SECURITY;

-- Public access policies for API usage
CREATE POLICY "Allow public read access to threat_detections"
  ON threat_detections FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to threat_detections"
  ON threat_detections FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read access to known_threats"
  ON known_threats FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow public read access to detection_rules"
  ON detection_rules FOR SELECT
  TO anon
  USING (is_enabled = true);

-- Insert default detection rules
INSERT INTO detection_rules (rule_name, rule_type, pattern, weight, description) VALUES
  ('Suspicious TLD', 'url', '.xyz|.top|.club|.work|.site', 15, 'Commonly used in phishing'),
  ('IP Address in URL', 'url', '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', 25, 'Direct IP addresses often used in phishing'),
  ('Long URL', 'url', 'length>75', 10, 'Unusually long URLs'),
  ('Multiple Subdomains', 'url', 'subdomain>3', 15, 'Too many subdomains'),
  ('Urgency Keywords', 'content', 'urgent|suspended|verify|confirm|update|expire', 20, 'Social engineering urgency'),
  ('Credential Request', 'content', 'password|login|credential|account', 15, 'Requesting sensitive info'),
  ('Suspicious Characters', 'url', '@|//|\\-', 10, 'URL obfuscation techniques'),
  ('Brand Impersonation', 'content', 'paypal|apple|microsoft|google|amazon|bank', 25, 'Impersonating major brands'),
  ('No HTTPS', 'url', '^http:', 20, 'Insecure connection'),
  ('Shortened URL', 'url', 'bit\\.ly|tinyurl|goo\\.gl|ow\\.ly', 15, 'URL shorteners hide destination')
ON CONFLICT DO NOTHING;

-- Insert sample known threats
INSERT INTO known_threats (threat_type, threat_value, description, severity) VALUES
  ('domain', 'paypal-login-security.com', 'Fake PayPal login page', 'critical'),
  ('domain', 'apple-account-verify.com', 'Fake Apple ID verification', 'critical'),
  ('domain', 'secure-banking-login.net', 'Generic banking phish', 'high'),
  ('keyword', 'verify your account immediately', 'Common phishing phrase', 'medium'),
  ('keyword', 'account will be suspended', 'Urgency tactic', 'high')
ON CONFLICT DO NOTHING;