import { useState } from 'react';
import { Shield, PlayCircle, EyeOff, Activity, AlertOctagon, TrendingDown, LayoutPanelTop } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdBlockerDashboard() {
  const [stats] = useState({
    adsBlocked: 142,
    youtubeAdsBlocked: 28,
    trackersBlocked: 56,
    popupsBlocked: 14
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <Shield className="text-rose-500 w-6 h-6" /> Advanced Ad Blocker System
        </h2>
        <p className="text-sm text-slate-400 mb-6">Network-level blocking of YouTube ads (pre-roll, mid-roll), banner ads, popups, and intrusive trackers.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Ads Blocked', val: stats.adsBlocked, icon: Activity, color: 'text-rose-500' },
            { label: 'YouTube Ads Blocked', val: stats.youtubeAdsBlocked, icon: PlayCircle, color: 'text-red-500' },
            { label: 'Trackers Blocked', val: stats.trackersBlocked, icon: EyeOff, color: 'text-orange-500' },
            { label: 'Popups Blocked', val: stats.popupsBlocked, icon: LayoutPanelTop, color: 'text-purple-500' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-slate-500 transition-colors">
              <item.icon className={`w-8 h-8 mb-2 ${item.color}`} />
              <p className="text-3xl font-black text-white">{item.val}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700 flex flex-col">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" /> Weekly Ad-Blocking Stats
            </h3>
            <div className="flex-1 min-h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Mon', ads: 120, trackers: 45 },
                  { name: 'Tue', ads: 98, trackers: 30 },
                  { name: 'Wed', ads: 156, trackers: 80 },
                  { name: 'Thu', ads: 104, trackers: 42 },
                  { name: 'Fri', ads: 180, trackers: 90 },
                  { name: 'Sat', ads: 250, trackers: 120 },
                  { name: 'Sun', ads: 310, trackers: 150 },
                ]}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '13px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="ads" fill="#ef4444" radius={[4, 4, 0, 0]} name="Ads Blocked" stackId="a" />
                  <Bar dataKey="trackers" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Trackers" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-slate-400" /> Recent Activity Log
            </h3>
            <div className="space-y-2">
              {[
                { time: 'Just now', domain: 'youtube.com', reason: 'Pre-roll Video Ad Blocked' },
                { time: '5m ago', domain: 'news-site.org', reason: 'Tracking Script (Google Analytics)' },
                { time: '12m ago', domain: 'ecommerce.xyz', reason: 'Popup Modal Prevented' },
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-300">{log.domain}</p>
                    <p className="text-[10px] text-slate-500">{log.reason}</p>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded-md">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
