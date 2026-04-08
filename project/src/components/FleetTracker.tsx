import { useState, useEffect } from 'react';
import { Globe, Users, Shield, Radio, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FleetTracker() {
  const [activeNodes, setActiveNodes] = useState(14392);
  const [threatsBlocked, setThreatsBlocked] = useState(8921);

  // Simulate live data
  useEffect(() => {
    const t = setInterval(() => {
      setActiveNodes(p => p + Math.floor(Math.random() * 5) - 2);
      if (Math.random() > 0.7) setThreatsBlocked(p => p + 1);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-500" /> Enterprise Fleet Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Live monitoring of deployed Norix endpoints across your organization.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-emerald-500">Fleet Active</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Endpoints', value: activeNodes.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Threats Blocked (24h)', value: threatsBlocked.toLocaleString(), icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Regions Deployed', value: '24', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Critical Alerts', value: '3', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#0a0a0b] border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            </div>
            <div className="text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Map Simulation UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 70%)' }} />
          <Globe className="w-32 h-32 text-blue-500/20 mb-4 animate-[spin_60s_linear_infinite]" />
          <h3 className="text-xl font-bold mb-2 z-10">Global Node Map</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm z-10 text-sm">Visualizing thousands of active Chrome Extension endpoints forming a distributed security mesh.</p>
          
          {/* Simulated node blips */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 1.5], opacity: [0, 1, 0] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 5 }}
              className="absolute w-4 h-4 bg-blue-500 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-[#0a0a0b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Live Organization Feed</h3>
          <div className="space-y-4">
            {[
              { user: 'jane.d@company.com', action: 'Phishing email blocked', time: 'Just now', type: 'critical' },
              { user: 'sysadmin', action: 'Deployed 500 new seats', time: '2m ago', type: 'info' },
              { user: 'mark.t@company.com', action: 'URL scan returned clean', time: '14m ago', type: 'safe' },
              { user: 'finance_team', action: 'Targeted spear-phishing attempt thwarted', time: '41m ago', type: 'critical' },
              { user: 'sarah.j@company.com', action: 'Extension updated to v3.0', time: '1h ago', type: 'info' },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 items-start pb-4 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${log.type === 'critical' ? 'bg-red-500' : log.type === 'safe' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <div>
                  <div className="text-sm font-semibold">{log.action}</div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between w-full gap-4">
                    <span>{log.user}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
