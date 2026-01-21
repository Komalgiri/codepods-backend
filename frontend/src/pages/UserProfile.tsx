import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

interface UserProfileProps {
    embed?: boolean;
}

const UserProfile = ({ embed = false }: UserProfileProps) => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setProfileData(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                // Fallback to local storage if API fails
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setProfileData({ user: JSON.parse(storedUser), pods: [], rewards: [], activities: [], totalPoints: 0 });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!profileData) return null;

    const { user, pods, totalPoints, activities, badgeCount } = profileData;

    return (
        <div className={`min-h-screen bg-background text-text-primary font-sans selection:bg-primary selection:text-white ${embed ? 'min-h-0' : ''}`}>
            {/* Navbar */}
            {!embed && (
                <nav className="border-b border-background-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <span className="text-xl font-bold tracking-tight">CodePods</span>
                        </div>
                        <div className="flex gap-6 text-sm font-medium text-text-secondary">
                            <span onClick={() => navigate('/dashboard')} className="cursor-pointer hover:text-text-primary">Dashboard</span>
                            <span className="cursor-pointer hover:text-text-primary">Explore</span>
                            <span className="cursor-pointer hover:text-text-primary">Settings</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary cursor-pointer ring-2 ring-primary ring-offset-2 ring-offset-background"></div>
                        </div>
                    </div>
                </nav>
            )}

            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${embed ? 'p-0 max-w-none' : ''}`}>
                {/* Profile Header Card */}
                <div className="bg-background-surface border border-background-border rounded-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-background-border overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center border-4 border-background-surface text-background font-bold text-xs shadow-lg">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-text-primary">{user.name}</h1>
                                {user.githubId && (
                                    <span className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                        GitHub Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-text-secondary text-lg mb-4 font-medium">@{user.githubId || 'username'} • {user.role || 'Developer'}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    {user.location || 'Remote'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                    {user.website || 'codepods.io'}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-6 py-2.5 bg-cyan-500 text-background font-bold rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                Follow
                            </button>
                            <button className="px-6 py-2.5 bg-background-surface border border-background-border font-bold rounded-lg hover:bg-background-border/50 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Stats & Badges */}
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background-surface border border-background-border rounded-xl p-5">
                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Total XP</div>
                                <div className="text-3xl font-bold text-white mb-1">{totalPoints}</div>
                                <div className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                                    Level Up Soon
                                </div>
                            </div>
                            <div className="bg-background-surface border border-background-border rounded-xl p-5">
                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Pods Joined</div>
                                <div className="text-3xl font-bold text-white mb-1">{pods.length}</div>
                                <div className="text-[10px] font-bold text-cyan-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    {pods.length > 0 ? 'Active Member' : 'Join a Pod'}
                                </div>
                            </div>
                        </div>

                        {/* Core Stack */}
                        <div className="bg-background-surface border border-background-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-text-primary">Core Stack</h3>
                                <svg className="w-4 h-4 text-text-secondary cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'Rust', 'TypeScript', 'Go', 'Node.js', 'Docker', 'GraphQL'].map(tech => (
                                    <span key={tech} className="px-3 py-1.5 bg-background-border/20 border border-background-border rounded-full text-xs font-bold text-text-primary flex items-center gap-1.5 hover:border-primary/50 transition-colors cursor-default">
                                        <span className={`w-1.5 h-1.5 rounded-full ${tech === 'React' || tech === 'TypeScript' ? 'bg-blue-500' :
                                            tech === 'Rust' ? 'bg-orange-500' :
                                                tech === 'Node.js' ? 'bg-green-500' :
                                                    tech === 'GraphQL' ? 'bg-pink-500' :
                                                        tech === 'Go' ? 'bg-cyan-500' :
                                                            'bg-gray-500'
                                            }`}></span>
                                        {tech}
                                    </span>
                                ))}
                                <span className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary cursor-pointer hover:bg-primary/20">
                                    + 12 more
                                </span>
                            </div>
                        </div>

                        {/* Earned Badges */}
                        <div className="bg-background-surface border border-background-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-text-primary">Earned Badges</h3>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{badgeCount}</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 hover:scale-105 transition-transform cursor-pointer" title="Gold Contributor">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 hover:scale-105 transition-transform cursor-pointer" title="Mentor">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 hover:scale-105 transition-transform cursor-pointer" title="Rocket Ship">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.49-.55 1.9-2.12 3.5-2.25 1.5.21 4 1.5 4 1.5s2.5-3.5 3-7c.5-3.5-3-5.5-3-5.5s-2 3.5-5.5 3c-3.5-.5-7 3-7 3s1.29 2.5 1.5 4c-.13 1.6-1.74 3-2.25 3.5z"></path></svg>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:scale-105 transition-transform cursor-pointer" title="Bug Hunter">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9z"></path><path d="M12 11h.01"></path><path d="M12 15h.01"></path><path d="M9 13h.01"></path><path d="M15 13h.01"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Activity & Graph */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Activity */}
                        <div className="bg-background-surface border border-background-border rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-background-border flex items-center justify-between">
                                <h3 className="font-bold text-text-primary text-lg">Recent Activity</h3>
                                <div className="flex gap-4 text-xs font-bold text-text-secondary">
                                    <button className="text-text-primary">ALL</button>
                                    <button className="hover:text-text-primary">PODS</button>
                                    <button className="hover:text-text-primary">PRS</button>
                                </div>
                            </div>
                            <div className="p-6">
                                <ol className="relative border-l border-background-border ml-3 space-y-8">
                                    {activities.length === 0 ? (
                                        <div className="text-sm text-text-secondary py-4">No recent activity found.</div>
                                    ) : (
                                        activities.map((activity: any) => (
                                            <li key={activity.id} className="ml-6">
                                                <div className={`absolute w-8 h-8 bg-background-surface rounded-full -left-4 border ${activity.type === 'commit' ? 'border-cyan-500/50 text-cyan-500' :
                                                    activity.type === 'repo_created' ? 'border-purple-500/50 text-purple-500' :
                                                        activity.type === 'pr_opened' ? 'border-blue-500/50 text-blue-500' :
                                                            activity.type === 'pr_merged' ? 'border-green-500/50 text-green-500' :
                                                                'border-background-border text-text-secondary'
                                                    } flex items-center justify-center z-10 shadow-sm`}>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        {activity.type === 'commit' ? (
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                                        ) : activity.type.startsWith('pr') ? (
                                                            <path d="M15 14h5v-2h-5v-6h2v-2h-6v2h2v4h-6v-4h2v-2h-6v2h2v6h-5v2h5v6h-2v2h6v-2h-2v-4h6v4h-2v2h6v-2h-2v-6z" />
                                                        ) : (
                                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                        )}
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="font-bold text-text-primary">
                                                        {activity.type === 'commit' ? `Committed to ${activity.meta?.repoName || 'repository'}` :
                                                            activity.type === 'repo_created' ? `Created repository ${activity.meta?.repoName}` :
                                                                activity.type === 'pr_opened' ? `Opened PR #${activity.meta?.prNumber} in ${activity.meta?.repoName}` :
                                                                    activity.type === 'pr_merged' ? `Merged PR #${activity.meta?.prNumber} in ${activity.meta?.repoName}` :
                                                                        'User Activity'}
                                                    </h4>
                                                    <p className="text-sm text-text-secondary">{activity.meta?.message || 'Activity synchronized from GitHub.'}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs text-text-secondary">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                                        <span className="text-[10px] font-bold bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded uppercase">{activity.type}</span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ol>
                            </div>
                            <div className="p-4 border-t border-background-border text-center">
                                <button className="text-sm font-bold text-cyan-500 hover:text-cyan-400 transition-colors">View All Contributions</button>
                            </div>
                        </div>

                        {/* Code Graph */}
                        <div className="bg-background-surface border border-background-border rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-text-primary">Code Graph</h3>
                                <div className="flex gap-2 items-center text-[10px] text-text-secondary font-bold uppercase">
                                    <span>Less</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 bg-background-border/50 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-cyan-900 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-cyan-700 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-cyan-300 rounded-sm"></div>
                                    </div>
                                    <span>More</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between h-32 gap-4">
                                {/* Simple Bar Chart Mock */}
                                {['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE'].map((month, i) => (
                                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="w-full flex items-end justify-center gap-1 h-full">
                                            <div className={`w-3 rounded-t-sm transition-all group-hover:bg-cyan-400 ${i % 2 === 0 ? 'h-1/3 bg-cyan-900' : 'h-1/2 bg-cyan-700'}`}></div>
                                            <div className={`w-3 rounded-t-sm transition-all group-hover:bg-cyan-300 ${i % 2 === 0 ? 'h-2/3 bg-cyan-500' : 'h-full bg-cyan-300'}`}></div>
                                        </div>
                                        <span className="text-[9px] font-bold text-text-secondary uppercase">{month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
