/*
  # Enhanced Community Reporting & Gemini Integration

  ## New Tables
  
  ### `user_reports`
  Community crowdsourced threat reporting
  - `id` (uuid, primary key)
  - `url_or_content` (text) - What was reported
  - `report_type` (text) - 'url', 'email', 'message'
  - `threat_category` (text) - 'phishing', 'scam', 'malware', 'social_engineering'
  - `description` (text) - User's description
  - `report_count` (integer) - How many users reported this
  - `verified` (boolean) - Moderator verified
  - `created_at` (timestamptz)

  ### `scam_patterns`
  Specific scam detection patterns
  - `id` (uuid, primary key)
  - `pattern_type` (text) - 'job_offer', 'crypto', 'otp', 'banking', 'inheritance', 'romance'
  - `keywords` (text array) - Keywords to detect
  - `risk_weight` (numeric) - Score weight
  - `description` (text)
  - `is_active` (boolean)

  ### `threat_explanations`
  AI-generated explanations for threats
  - `id` (uuid, primary key)
  - `detection_id` (uuid, foreign key to threat_detections)
  - `gemini_explanation` (text) - Gemini AI analysis
  - `risk_factors` (jsonb) - Detailed risk breakdown
  - `recommended_action` (text) - What user should do
  - `created_at` (timestamptz)

  ### `shared_threat_intelligence`
  Global threat intelligence shared across system
  - `id` (uuid, primary key)
  - `threat_hash` (text) - Hash of threat for deduplication
  - `threat_data` (jsonb) - Full threat info
  - `detected_count` (integer) - How many times detected globally
  - `severity` (text) - Severity level
  - `last_detected` (timestamptz)
*/

CREATE TABLE IF NOT EXISTS user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_or_content text NOT NULL,
  report_type text NOT NULL,
  threat_category text NOT NULL,
  description text,
  report_count integer DEFAULT 1,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scam_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type text NOT NULL,
  keywords text[] NOT NULL,
  risk_weight numeric NOT NULL DEFAULT 15,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS threat_explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id uuid NOT NULL REFERENCES threat_detections(id) ON DELETE CASCADE,
  gemini_explanation text,
  risk_factors jsonb DEFAULT '{}'::jsonb,
  recommended_action text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shared_threat_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_hash text UNIQUE NOT NULL,
  threat_data jsonb NOT NULL,
  detected_count integer DEFAULT 1,
  severity text NOT NULL DEFAULT 'medium',
  last_detected timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_reports_category ON user_reports(threat_category);
CREATE INDEX IF NOT EXISTS idx_user_reports_verified ON user_reports(verified);
CREATE INDEX IF NOT EXISTS idx_scam_patterns_type ON scam_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_threat_explanations_detection ON threat_explanations(detection_id);
CREATE INDEX IF NOT EXISTS idx_shared_intelligence_hash ON shared_threat_intelligence(threat_hash);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_threat_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and insert on user_reports"
  ON user_reports FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on user_reports"
  ON user_reports FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read scam_patterns"
  ON scam_patterns FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow public read threat_explanations"
  ON threat_explanations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read shared_threat_intelligence"
  ON shared_threat_intelligence FOR SELECT
  TO anon
  USING (true);

INSERT INTO scam_patterns (pattern_type, keywords, risk_weight, description) VALUES
  ('job_offer', ARRAY['work from home', 'urgent hiring', 'bitcoin', 'upfront payment', 'wire transfer'], 20, 'Fake job offer scams'),
  ('crypto', ARRAY['crypto', 'bitcoin', 'investment', 'double money', 'guaranteed returns', 'urgent'], 25, 'Cryptocurrency investment scams'),
  ('otp', ARRAY['otp', 'one time password', 'verify otp', 'send otp', 'kyc verification'], 30, 'OTP/KYC scams'),
  ('banking', ARRAY['account suspended', 'verify account', 'update payment', 'unusual activity', 'confirm identity'], 25, 'Fake banking alerts'),
  ('inheritance', ARRAY['inheritance', 'claim prize', 'lottery', 'won', 'unclaimed', 'beneficiary'], 20, 'Inheritance/lottery scams'),
  ('romance', ARRAY['love', 'relationship', 'meet you', 'photos', 'trust me', 'money needed'], 18, 'Romance/catfish scams')
ON CONFLICT DO NOTHING;
