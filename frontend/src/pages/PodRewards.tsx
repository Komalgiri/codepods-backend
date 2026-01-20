
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { podService, type LeaderboardMember, type Achievement } from '../services/podService';

const PodRewards = () => {
    const { id: podId } = useParams<{ id: string }>();
    const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!podId) return;
            try {
                const [lbResponse, achResponse] = await Promise.all([
                    podService.getPodLeaderboard(podId),
                    podService.getPodAchievements(podId)
                ]);
                setLeaderboard(lbResponse.leaderboard);
                setAchievements(achResponse.achievements);
            } catch (error) {
                console.error("Failed to fetch rewards data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [podId]);

    // Calculate team stats based on leaderboard
    const totalTeamXP = leaderboard.reduce((sum, member) => sum + member.totalPoints, 0);

    const getBadgeIcon = (badge: string) => {
        const map: Record<string, string> = {
            'repo-creator': '📁',
            'committer': '🔨',
            'super-committer': '🔥',
            'mentor': '🎓',
            'bug-fixer': '🐛'
        };
        return map[badge] || '🏅';
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center text-text-secondary">Loading team data...</div>;
    }

    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Content - Leaderboard */}
            <div className="flex-1 overflow-y-auto pr-2">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
                        <span>My Pods</span>
                        <span>/</span>
                        <span className="text-text-primary">Leadership Board</span>
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
                        <div className="text-3xl font-bold text-white mb-1">{totalTeamXP.toLocaleString()}</div>
                        <div className="text-xs text-text-secondary">Tracked across all activities</div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Members</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{leaderboard.length}</div>
                        <div className="text-xs text-cyan-500">Contributing daily</div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Milestones Met</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{achievements.length}</div>
                        <div className="text-xs text-green-500 font-bold">New records!</div>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-background-surface border border-background-border rounded-2xl overflow-hidden mb-8">
                    <div className="p-6 border-b border-background-border flex justify-between items-center">
                        <h3 className="font-bold text-text-primary text-lg">Leaderboard</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-background/50 text-xs font-bold text-text-secondary uppercase tracking-wider text-left">
                            <tr>
                                <th className="px-6 py-4 w-16">Rank</th>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Level</th>
                                <th className="px-6 py-4">XP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-background-border">
                            {leaderboard.map((member, index) => (
                                <tr key={member.id} className="hover:bg-background/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${index + 1 === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                                index + 1 === 2 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/50' :
                                                    index + 1 === 3 ? 'bg-orange-700/20 text-orange-700 border border-orange-700/50' :
                                                        'text-text-secondary'}`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="w-10 h-10 rounded-full border border-background-border" />
                                            <div>
                                                <div className="font-bold text-text-primary">{member.name}</div>
                                                <div className="text-xs text-text-secondary capitalize">{member.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-text-primary">{member.level}</span>
                                            <div className="w-20 h-1.5 bg-background-border rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${(member.totalPoints % 1000) / 10}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary">{member.totalPoints.toLocaleString()}</td>
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
                        {achievements.length > 0 ? achievements.map(achievement => (
                            <div key={achievement.id} className="relative pl-6 pb-6 border-l border-background-border last:pb-0 last:border-0">
                                <div className="absolute left-[-12px] top-0 w-6 h-6 rounded-full bg-background-surface border border-background-border flex items-center justify-center text-sm shadow-sm z-10">
                                    {getBadgeIcon(achievement.badge)}
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-text-primary text-sm capitalize">{achievement.badge.replace('-', ' ')}</h4>
                                        <span className="text-xs font-bold text-yellow-500">+{achievement.points} XP</span>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-3">{achievement.reason}</p>
                                    <div className="flex items-center gap-2">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${achievement.user}`} alt={achievement.user} className="w-5 h-5 rounded-full" />
                                        <span className="text-xs font-bold text-text-primary">{achievement.user}</span>
                                        <span className="text-[10px] text-text-secondary">• {new Date(achievement.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-4">
                                <p className="text-xs text-text-secondary italic">No recent achievements found. Keep pushing to earn badges!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/20 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
                        <span className="text-2xl">🏆</span>
                    </div>
                    <h3 className="font-bold text-text-primary mb-1">Weekly Challenge</h3>
                    <p className="text-xs text-text-secondary mb-4">Complete your assigned tasks to earn the "High Achiever" badge and 500 XP.</p>
                </div>
            </div>
        </div>
    );
};

export default PodRewards;
