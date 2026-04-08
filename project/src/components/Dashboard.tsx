import { useState, useEffect } from 'react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { BarChart3, Activity, Shield, AlertTriangle, Clock, TrendingUp, Globe, RefreshCw } from 'lucide-react';
import { getStats, getRecentDetections } from '../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

const chartDefaults = {
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
  },
};

const BRAND_DATA = {
  labels: ['PayPal', 'SBI Bank', 'Apple', 'Microsoft', 'Amazon', 'HDFC', 'Google', 'Netflix'],
  datasets: [{
    label: 'Impersonation Attempts',
    data: [340, 290, 215, 180, 165, 142, 120, 98],
    backgroundColor: ['#3b82f6','#ef4444','#8b5cf6','#06b6d4','#f59e0b','#10b981','#f97316','#ec4899'],
    borderRadius: 6,
  }]
};

const COUNTRY_DATA = {
  labels: ['Russia', 'Nigeria', 'China', 'Pakistan', 'Romania', 'Brazil', 'Ukraine', 'Bangladesh'],
  datasets: [{
    label: 'Attacks Originating',
    data: [520, 430, 360, 290, 210, 185, 165, 140],
    backgroundColor: 'rgba(239,68,68,0.7)',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 4,
  }]
};

const SCAM_TYPE_DATA = {
  labels: ['Banking', 'KYC/OTP', 'Lottery', 'Job Offer', 'Crypto', 'Romance', 'Tech Support'],
  datasets: [{
    label: 'Detection Count',
    data: [380, 320, 220, 195, 175, 130, 110],
    backgroundColor: [
      'rgba(59,130,246,0.8)', 'rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)',
      'rgba(16,185,129,0.8)', 'rgba(139,92,246,0.8)', 'rgba(236,72,153,0.8)', 'rgba(6,182,212,0.8)'
    ],
    borderRadius: 6,
  }]
};

function generateDailyData() {
  const labels = [];
  const phishing = [];
  const safe = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    phishing.push(Math.floor(Math.random() * 40 + 10));
    safe.push(Math.floor(Math.random() * 80 + 30));
  }
  return { labels, phishing, safe };
}

const dailyData = generateDailyData();

const DAILY_CHART = {
  labels: dailyData.labels,
  datasets: [
    {
      label: 'Phishing Detected',
      data: dailyData.phishing,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    },
    {
      label: 'Safe Scans',
      data: dailyData.safe,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }
  ]
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([getStats(), getRecentDetections(20)]);
      setStats(s);
      setRecent(r);
    } catch { }
    setLoading(false);
  }

  const riskDist = stats ? {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Safe'],
    datasets: [{
      data: [
        stats.riskDistribution?.critical || 0,
        stats.riskDistribution?.high || 0,
        stats.riskDistribution?.medium || 0,
        stats.riskDistribution?.low || 0,
        stats.riskDistribution?.safe || 0,
      ],
      backgroundColor: ['#ef4444','#f59e0b','#facc15','#3b82f6','#10b981'],
      borderWidth: 0,
    }]
  } : null;

  const statCards = [
    { label: 'Total Scans',      value: stats?.totalScans    ?? '–', icon: Activity,      color: 'blue'    },
    { label: 'Threats Detected', value: stats?.threatsDetected ?? '–', icon: AlertTriangle, color: 'red'     },
    { label: 'Safe Results',     value: stats?.safeResults   ?? '–', icon: Shield,        color: 'emerald' },
    { label: 'Scans Today',      value: stats?.scansToday    ?? '–', icon: Clock,         color: 'purple'  },
    { label: 'Detection Rate',   value: stats ? `${stats.detectionRate}%` : '–', icon: TrendingUp, color: 'orange' },
    { label: 'Countries Tracked',value: '47',                         icon: Globe,         color: 'cyan'    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  const riskBadge = (level: string) => {
    const m: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400',
      high:     'bg-orange-500/20 text-orange-400',
      medium:   'bg-yellow-500/20 text-yellow-400',
      low:      'bg-blue-500/20 text-blue-400',
      safe:     'bg-emerald-500/20 text-emerald-400',
    };
    return m[level] || 'bg-slate-700 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`bg-slate-800/60 border rounded-2xl p-4 ${colorMap[c.color]}`}>
              <Icon className="w-5 h-5 mb-2" />
              <p className="text-2xl font-extrabold text-white">{loading ? '…' : c.value}</p>
              <p className="text-xs font-medium mt-1 opacity-80">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Trend - Wide */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Daily Scan Trends (14 days)
          </h3>
          <Line data={DAILY_CHART} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: true } as any} />
        </div>

        {/* Risk Distribution */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Risk Distribution
          </h3>
          {riskDist ? (
            <div>
              <Doughnut data={riskDist} options={{ plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }, responsive: true, cutout: '65%' } as any} />
              <div className="mt-4 space-y-1">
                {['Critical','High','Medium','Low','Safe'].map((l, i) => {
                  const colors = ['bg-red-500','bg-orange-500','bg-yellow-500','bg-blue-500','bg-emerald-500'];
                  const vals = [stats?.riskDistribution?.critical,stats?.riskDistribution?.high,stats?.riskDistribution?.medium,stats?.riskDistribution?.low,stats?.riskDistribution?.safe];
                  return (
                    <div key={l} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
                      <span className="text-slate-400 flex-1">{l}</span>
                      <span className="text-slate-300 font-semibold">{vals[i] ?? 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Connect Supabase to see live data</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Targeted Brands */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400" /> Most Impersonated Brands
          </h3>
          <Bar data={BRAND_DATA} options={{ ...chartDefaults, indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } } as any} />
        </div>

        {/* Scam Types */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-red-400" /> Scam Categories Detected
          </h3>
          <Bar data={SCAM_TYPE_DATA} options={{ ...chartDefaults, responsive: true, plugins: { legend: { display: false } } } as any} />
        </div>
      </div>

      {/* Attack Origins + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Origins */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-cyan-400" /> Top Attack Origins
          </h3>
          <Bar data={COUNTRY_DATA} options={{ ...chartDefaults, indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } } as any} />
        </div>

        {/* Recent Detections */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200">Recent Detections</h3>
            <button onClick={load} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-slate-700/40 rounded-xl animate-pulse" />
              ))
            ) : recent.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No detections yet. Connect Supabase to see live data.</p>
            ) : recent.map(d => (
              <div key={d.id} className="bg-slate-900/60 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-200 font-mono truncate">{d.url || d.url_or_content}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(d.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })} · {d.detection_type}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${riskBadge(d.risk_level)}`}>{d.risk_level}</span>
                  <span className="text-sm font-bold text-slate-300">{d.risk_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
