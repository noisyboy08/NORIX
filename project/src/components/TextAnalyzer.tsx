import { useState } from 'react';
import { Mail, MessageSquare, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { analyzePhishingWithFallback } from '../utils/api';
import { AnalysisResult } from '../types';

export default function TextAnalyzer() {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'email' | 'message'>('email');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!content) return;

    setLoading(true);
    setResult(null);

    try {
      const { result: analysis } = await analyzePhishingWithFallback('', content, type);
      setResult(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
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
          {type === 'email' ? (
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          ) : (
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          )}
          <h2 className="text-xl font-semibold dark:text-white">Email & Message Analyzer</h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                type === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setType('message')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                type === 'message'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              Text Message
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Paste {type === 'email' ? 'email' : 'message'} content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'email'
                  ? 'Paste the email content here...'
                  : 'Paste the message content here...'
              }
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900/70 placeholder-gray-500 dark:placeholder-slate-500"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !content}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Analyzing...' : 'Analyze Content'}
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
                  {result.isPhishing ? 'Social Engineering Detected!' : 'Appears Legitimate'}
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
                  <p className="font-semibold text-red-900 dark:text-red-300">Warning</p>
                  <p className="text-sm text-red-800 dark:text-red-400">
                    This content shows strong indicators of social engineering or phishing. Be cautious with any requests for personal information, credentials, or financial details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {result.threatIndicators.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-slate-200">Threat Indicators Detected:</h4>
              <div className="space-y-2">
                {result.threatIndicators.map((indicator, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900/50 bg-opacity-60 rounded p-3 border border-gray-200 dark:border-slate-700/50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900 dark:text-slate-200">{indicator.rule}</span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">+{indicator.weight}pts</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-400">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.analysisDetails?.contentAnalysis && (
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-slate-700/50">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-200">Analysis Details:</h4>
              <div className="text-sm text-gray-700 dark:text-slate-400 space-y-1">
                {result.analysisDetails.contentAnalysis.urgencyKeywords?.length > 0 && (
                  <p>
                    <span className="font-medium">Urgency tactics:</span>{' '}
                    {result.analysisDetails.contentAnalysis.urgencyKeywords.join(', ')}
                  </p>
                )}
                {result.analysisDetails.contentAnalysis.credentialKeywords?.length > 0 && (
                  <p>
                    <span className="font-medium">Credential requests:</span>{' '}
                    {result.analysisDetails.contentAnalysis.credentialKeywords.join(', ')}
                  </p>
                )}
                {result.analysisDetails.contentAnalysis.brandMentions?.length > 0 && (
                  <p>
                    <span className="font-medium">Brand mentions:</span>{' '}
                    {result.analysisDetails.contentAnalysis.brandMentions.join(', ')}
                  </p>
                )}
                {result.analysisDetails.contentAnalysis.scamPatterns?.length > 0 && (
                  <p>
                    <span className="font-medium">Scam category signals:</span>{' '}
                    {result.analysisDetails.contentAnalysis.scamPatterns.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {result.analysisDetails?.contentAnalysis?.scamPatterns?.length > 0 && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Security Tip</p>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Never share OTPs, passwords, or verification codes. Legitimate banks and services do not ask for OTP over email/SMS/WhatsApp.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
