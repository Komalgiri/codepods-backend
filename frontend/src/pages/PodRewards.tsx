


// Mock Data
const MEMBER_RANKINGS = [
    {
        id: '1',
        rank: 1,
        name: 'Alex Rivera',
        role: 'Lead Architect',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        xp: 12450,
        level: 42,
        contributions: 156,
        badges: ['Architect', 'Bug Hunter', 'Veteran'],
        trend: '+240 XP',
        trendUp: true
    },
    {
        id: '2',
        rank: 2,
        name: 'Sam Chen',
        role: 'Backend Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
        xp: 9800,
        level: 35,
        contributions: 132,
        badges: ['Speed Demon', 'Fixer'],
        trend: '+120 XP',
        trendUp: true
    },
    {
        id: '3',
        rank: 3,
        name: 'Jordan Smith',
        role: 'DevOps Engineer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        xp: 8500,
        level: 31,
        contributions: 98,
        badges: ['Infrastructure', 'Cloud Ninja'],
        trend: '+85 XP',
        trendUp: true
    }
];

const RECENT_ACHIEVEMENTS = [
    {
        id: '1',
        user: 'Alex Rivera',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        title: 'Merged 50 PRs',
        description: 'Reached a milestone of 50 Pull Requests merged into main.',
        xp: 500,
        time: '2 hours ago',
        icon: '🚀'
    },
    {
        id: '2',
        user: 'Sam Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
        title: 'Bug Exterminator',
        description: 'Fixed a critical P0 bug in production.',
        xp: 1000,
        time: 'Yesterday',
        icon: '🐛'
    }
];

const PodRewards = () => {
    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Content - Leaderboard */}
            <div className="flex-1 overflow-y-auto pr-2">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
                        <span>Pods</span>
                        <span>/</span>
                        <span>Project Alpha</span>
                        <span>/</span>
                        <span className="text-text-primary">Rewards</span>
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Team Leadership</h1>
                    <p className="text-text-secondary text-sm">Recognizing contributions and celebrating team milestones.</p>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Total Team XP</span>
                            <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">30,750</div>
                        <div className="text-xs text-text-secondary">Top 5% of all Pods</div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Sprint Goal</span>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-bold text-white">85%</span>
                            <span className="text-xs text-cyan-500">On Track</span>
                        </div>
                        <div className="w-full bg-background-border/30 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                        </div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Streak</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">12 Days</div>
                        <div className="text-xs text-green-500 font-bold">New Record!</div>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-background-surface border border-background-border rounded-2xl overflow-hidden mb-8">
                    <div className="p-6 border-b border-background-border flex justify-between items-center">
                        <h3 className="font-bold text-text-primary text-lg">Leaderboard</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-xs font-bold bg-primary/20 text-primary border border-primary/20 rounded-lg">All Time</button>
                            <button className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">This Sprint</button>
                        </div>
                    </div>
                    <table className="w-full">
                        <thead className="bg-background/50 text-xs font-bold text-text-secondary uppercase tracking-wider text-left">
                            <tr>
                                <th className="px-6 py-4 w-16">Rank</th>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Level</th>
                                <th className="px-6 py-4">Contributions</th>
                                <th className="px-6 py-4">XP</th>
                                <th className="px-6 py-4 text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-background-border">
                            {MEMBER_RANKINGS.map((member) => (
                                <tr key={member.id} className="hover:bg-background/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${member.rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                                member.rank === 2 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/50' :
                                                    member.rank === 3 ? 'bg-orange-700/20 text-orange-700 border border-orange-700/50' :
                                                        'text-text-secondary'}`}>
                                            {member.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border border-background-border" />
                                            <div>
                                                <div className="font-bold text-text-primary">{member.name}</div>
                                                <div className="text-xs text-text-secondary">{member.role}</div>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                                {member.badges.slice(0, 2).map(badge => (
                                                    <span key={badge} className="text-[9px] px-1.5 py-0.5 bg-background-border/50 rounded text-text-secondary border border-background-border">{badge}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-text-primary">{member.level}</span>
                                            <div className="w-20 h-1.5 bg-background-border rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${(member.xp % 1000) / 10}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-text-secondary">{member.contributions}</td>
                                    <td className="px-6 py-4 font-bold text-primary">{member.xp.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                                            {member.trend}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Sidebar - Recent Activity */}
            <div className="w-80 flex flex-col gap-6 shrink-0">
                <div className="bg-background-surface border border-background-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Recent Achievements</h3>
                    <div className="space-y-6">
                        {RECENT_ACHIEVEMENTS.map(achievement => (
                            <div key={achievement.id} className="relative pl-6 pb-6 border-l border-background-border last:pb-0 last:border-0">
                                <div className="absolute left-[-12px] top-0 w-6 h-6 rounded-full bg-background-surface border border-background-border flex items-center justify-center text-sm shadow-sm z-10">
                                    {achievement.icon}
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-text-primary text-sm">{achievement.title}</h4>
                                        <span className="text-xs font-bold text-yellow-500">+{achievement.xp} XP</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-3">{achievement.description}</p>
                                    <div className="flex items-center gap-2">
                                        <img src={achievement.avatar} alt={achievement.user} className="w-5 h-5 rounded-full" />
                                        <span className="text-xs font-bold text-text-primary">{achievement.user}</span>
                                        <span className="text-[10px] text-text-secondary">• {achievement.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/20 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
                        <span className="text-2xl">🏆</span>
                    </div>
                    <h3 className="font-bold text-text-primary mb-1">Weekly Challenge</h3>
                    <p className="text-xs text-text-secondary mb-4">Complete 10 Code Reviews this week to earn the "Mentor" badge and 500 XP.</p>
                    <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-primary w-[40%] rounded-full shadow-[0_0_10px_rgba(88,166,154,0.5)]"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                        <span>4/10</span>
                        <span>40%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PodRewards;
