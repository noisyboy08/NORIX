import { lazy, Suspense } from 'react';
import type { Page } from './pageTypes';

const URLScanner = lazy(() => import('./components/URLScanner'));
const TextAnalyzer = lazy(() => import('./components/TextAnalyzer'));
const UniversalScanner = lazy(() => import('./components/UniversalScanner'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const HistoryScanner = lazy(() => import('./components/HistoryScanner'));
const SecurityTools = lazy(() => import('./components/SecurityTools'));
const BulkScanner = lazy(() => import('./components/BulkScanner'));
const EmailHeaderAnalyzer = lazy(() => import('./components/EmailHeaderAnalyzer'));
const BreachChecker = lazy(() => import('./components/BreachChecker'));
const TrainingMode = lazy(() => import('./components/TrainingMode'));
const ThreatFeed = lazy(() => import('./components/ThreatFeed'));
const PhishBot = lazy(() => import('./components/PhishBot'));
const FairnessAudit = lazy(() => import('./components/FairnessAudit'));
const EmailIntelligence = lazy(() => import('./components/EmailIntelligence'));
const PhoneIntelligence = lazy(() => import('./components/PhoneIntelligence'));
const AdBlockerDashboard = lazy(() => import('./components/AdBlockerDashboard'));
const SandboxSuite = lazy(() => import('./components/SandboxSuite'));
const EnterpriseSecurity = lazy(() => import('./components/EnterpriseSecurity'));
const GodLevelAI = lazy(() => import('./components/GodLevelAI'));
const NextGenDashboard = lazy(() => import('./components/NextGenFeatures'));
const SupremeGodLevel = lazy(() => import('./components/SupremeGodLevel'));
const FleetTracker = lazy(() => import('./components/FleetTracker'));

const VoiceScamDetector = lazy(() =>
  import('./components/AdvancedFeatures').then((m) => ({ default: m.VoiceScamDetector }))
);
const CampaignFingerprinter = lazy(() =>
  import('./components/AdvancedFeatures').then((m) => ({ default: m.CampaignFingerprinter }))
);
const OTPScanDetector = lazy(() =>
  import('./components/AdvancedFeatures').then((m) => ({ default: m.OTPScanDetector }))
);

const ThreatRadarMap = lazy(() =>
  import('./components/EnterpriseFeatures').then((m) => ({ default: m.ThreatRadarMap }))
);
const VisualDOMCloning = lazy(() =>
  import('./components/EnterpriseFeatures').then((m) => ({ default: m.VisualDOMCloning }))
);
const SocialMediaTracker = lazy(() =>
  import('./components/EnterpriseFeatures').then((m) => ({ default: m.SocialMediaTracker }))
);
const BreachAutopsyVault = lazy(() =>
  import('./components/EnterpriseFeatures').then((m) => ({ default: m.BreachAutopsyVault }))
);

const CommunityLeaderboard = lazy(() => import('./components/CommunityLeaderboard'));

function PageFallback() {
  return (
    <div
      className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/40 px-6 py-12 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      <p className="text-sm font-medium text-slate-400">Loading module…</p>
    </div>
  );
}

export function AppPageContent({ page }: { page: Page }) {
  return (
    <Suspense fallback={<PageFallback />}>
      {page === 'universal' && <UniversalScanner />}
      {page === 'url' && <URLScanner />}
      {page === 'text' && <TextAnalyzer />}
      {page === 'bulk' && <BulkScanner />}
      {page === 'header' && <EmailHeaderAnalyzer />}
      {page === 'otp' && <OTPScanDetector />}
      {page === 'feed' && <ThreatFeed />}
      {page === 'voice' && <VoiceScamDetector />}
      {page === 'campaign' && <CampaignFingerprinter />}
      {page === 'history' && <HistoryScanner />}
      {page === 'dashboard' && <Dashboard />}
      {page === 'tools' && <SecurityTools />}
      {page === 'breach' && <BreachChecker />}
      {page === 'training' && <TrainingMode />}
      {page === 'phishbot' && <PhishBot />}
      {page === 'leaderboard' && <CommunityLeaderboard />}
      {page === 'fairness' && <FairnessAudit />}
      {page === 'email_intel' && <EmailIntelligence />}
      {page === 'phone_intel' && <PhoneIntelligence />}
      {page === 'ad_blocker' && <AdBlockerDashboard />}
      {page === 'sandbox' && <SandboxSuite />}
      {page === 'enterprise' && <EnterpriseSecurity />}
      {page === 'threat_radar' && <ThreatRadarMap />}
      {page === 'visual_dom' && <VisualDOMCloning />}
      {page === 'social_scan' && <SocialMediaTracker />}
      {page === 'breach_checker' && <BreachAutopsyVault />}
      {page === 'next_gen' && <NextGenDashboard />}
      {page === 'god_level' && <GodLevelAI />}
      {page === 'supreme_god' && <SupremeGodLevel />}
      {page === 'fleet' && <FleetTracker />}
    </Suspense>
  );
}
