import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Flag, Lightbulb, Zap } from 'lucide-react';
import { analyzePhishingWithFallback, getExplanation, submitReport } from '../utils/api';
import { AnalysisResult } from '../types';

export default function URLScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportCategory, setReportCategory] = useState<'phishing' | 'scam' | 'malware' | 'social_engineering'>('phishing');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const reportUrl = params.get('reportUrl');
      if (reportUrl) {
        setUrl(reportUrl);
        setShowReportForm(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAnalyze = async () => {
    if (!url) return;

    setLoading(true);
    setResult(null);
    setExplanation(null);
    setError(null);

    try {
      const { result: analysis } = await analyzePhishingWithFallback(url, '', 'url');
      setResult(analysis);

      if (analysis.threatIndicators.length > 0) {
        try {
          const exp = await getExplanation(
            analysis.detectionId || 'temp-id',
            analysis.threatIndicators,
            analysis.riskScore,
            url
          );
          setExplanation(exp);
        } catch (e) {
          console.error('Failed to get explanation:', e);
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setError(msg);
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!url || !reportDescription) return;

    setReportSubmitting(true);
    try {
      await submitReport(url, 'url', reportCategory, reportDescription);
      setReportDescription('');
      setShowReportForm(false);
      alert('Report submitted successfully. Thank you!');
    } catch (error) {
      console.error('Report error:', error);
      alert('Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-green-600 dark:text-emerald-400';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/30';
      case 'high': return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-500/30';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-500/30';
      case 'low': return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-500/30';
      default: return 'bg-green-50 dark:bg-emerald-950/30 border-green-200 dark:border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold dark:text-white">URL Phishing Detector</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Enter URL to analyze
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900/70 placeholder-gray-500 dark:placeholder-slate-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-bold shadow-lg shadow-blue-500/30"
          >
            {loading ? 'Analyzing...' : 'Analyze URL'}
          </button>
        </div>
      </div>

      {result && (
        <div className={`rounded-lg border-2 p-6 ${getRiskBg(result.riskLevel)}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {result.isPhishing ? (
                <XCircle className="w-8 h-8 text-red-600" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
              <div>
                <h3 className={`text-2xl font-bold ${getRiskColor(result.riskLevel)}`}>
                  {result.isPhishing ? 'Phishing Detected!' : 'Appears Safe'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Risk Level: {result.riskLevel.toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getRiskColor(result.riskLevel)}`}>
                {result.riskScore}%
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400">Risk Score</p>
            </div>
          </div>

          {result.isPhishing && (
            <div className="bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-500/30 rounded-lg p-4 mb-4">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-300">Security Warning</p>
                  <p className="text-sm text-red-800 dark:text-red-400 mt-1">
                    Do not enter credentials or personal information. Do not click links. Verify sender through official channels.
                  </p>
                </div>
              </div>
            </div>
          )}

          {explanation && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4 mb-4">
              <div className="flex gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">AI Analysis</p>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">{explanation.explanation}</p>
                </div>
              </div>
              {explanation.recommendedAction && (
                <div className="bg-white dark:bg-blue-900/30 rounded p-3 border border-blue-100 dark:border-blue-500/20">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">What You Should Do:</p>
                  <p className="text-sm text-blue-800 dark:text-blue-400">{explanation.recommendedAction}</p>
                </div>
              )}
            </div>
          )}

          {result.threatIndicators.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Why This Was Flagged:
              </h4>
              <div className="space-y-2">
                {result.threatIndicators.map((indicator, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900/50 rounded p-3 border-l-4 border-red-500 dark:border-red-500/50 shadow-sm border border-transparent dark:border-slate-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900 dark:text-slate-200">{indicator.rule}</span>
                      <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                        +{indicator.weight}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-400">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.isPhishing && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <Flag className="w-4 h-4" />
                Report This Threat
              </button>
            </div>
          )}

          {showReportForm && (
            <div className="mt-4 p-4 border border-orange-200 dark:border-orange-500/30 rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3">Report Phishing Threat</h4>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Threat category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/70 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="phishing">Phishing</option>
                  <option value="scam">Scam</option>
                  <option value="social_engineering">Social engineering</option>
                  <option value="malware">Malware</option>
                </select>
              </div>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe what this threat is trying to do..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900/70 placeholder-gray-500 dark:placeholder-slate-500"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSubmitReport}
                  disabled={reportSubmitting || !reportDescription}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 font-medium"
                >
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  onClick={() => {
                    setShowReportForm(false);
                    setReportDescription('');
                  }}
                  className="flex-1 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-slate-200 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/30 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">Scan failed</p>
          <p className="text-sm text-red-800 dark:text-red-400 whitespace-pre-wrap">{error}</p>
        </div>
      )}
    </div>
  );
}
