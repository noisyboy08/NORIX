const LEADERBOARD = [
  { rank: 1, name: 'CyberGuardian_42', reports: 847, verified: 801, badge: '⭐ Elite', color: 'text-yellow-400' },
  { rank: 2, name: 'PhishHunterIN', reports: 623, verified: 589, badge: '🛡️ Guardian', color: 'text-purple-400' },
  { rank: 3, name: 'SecureAce_99', reports: 412, verified: 388, badge: '🛡️ Guardian', color: 'text-purple-400' },
  { rank: 4, name: 'ThreatSlayer7', reports: 298, verified: 271, badge: '🔍 Hunter', color: 'text-blue-400' },
  { rank: 5, name: 'AnonymousHero', reports: 187, verified: 165, badge: '🔍 Hunter', color: 'text-blue-400' },
  { rank: 6, name: 'CyberSentinel_01', reports: 142, verified: 130, badge: '🔍 Hunter', color: 'text-blue-400' },
  { rank: 7, name: 'PhishAlert_IN', reports: 98, verified: 88, badge: '🎯 Rookie', color: 'text-slate-400' },
  { rank: 8, name: 'SafeNet_2024', reports: 67, verified: 60, badge: '🎯 Rookie', color: 'text-slate-400' },
];

export default function CommunityLeaderboard() {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-slate-700/50 bg-gradient-to-r from-yellow-900/20 to-amber-900/20">
        <span className="text-2xl">🏆</span>
        <div>
          <h3 className="font-extrabold text-white text-sm">Community Threat Reporters</h3>
          <p className="text-xs text-slate-400">Top contributors protecting the community</p>
        </div>
      </div>
      <div className="divide-y divide-slate-700/30">
        {LEADERBOARD.map((u) => (
          <div
            key={u.rank}
            className={`flex items-center gap-4 px-5 py-3 hover:bg-slate-700/20 transition-all ${u.rank <= 3 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''}`}
          >
            <span
              className={`text-lg font-extrabold flex-shrink-0 w-6 text-center ${u.rank === 1 ? 'text-yellow-400' : u.rank === 2 ? 'text-slate-300' : u.rank === 3 ? 'text-amber-600' : 'text-slate-600'}`}
            >
              {u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : u.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">{u.name}</p>
              <p className={`text-xs font-bold ${u.color}`}>{u.badge}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-extrabold text-slate-200">{u.reports}</p>
              <p className="text-xs text-slate-500">{u.verified} verified</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
