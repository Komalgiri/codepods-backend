import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { githubService } from '../services/githubService';
import { FaGithub, FaFire, FaCertificate, FaMedal, FaRocket, FaBug, FaEdit } from 'react-icons/fa';
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlineGlobeAlt, HiTrendingUp, HiUsers, HiLightningBolt, HiChartBar, HiRefresh } from 'react-icons/hi';

interface UserProfileProps {
    embed?: boolean;
}

const UserProfile = ({ embed = false }: UserProfileProps) => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [showScanModal, setShowScanModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', location: '', website: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setProfileData(data);
                setEditForm({
                    name: data.user.name || '',
                    location: data.user.location || 'Remote',
                    website: data.user.website || 'codepodai.io'
                });
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

    const handleEditProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.updateProfile({ name: editForm.name });
            const data = await userService.getProfile();
            setProfileData(data);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const handleRescanProfile = async () => {
        setIsAnalyzing(true);
        try {
            const result = await githubService.analyzeProfile();
            setScanResult(result);
            setShowScanModal(true);
        } catch (error) {
            console.error("Failed to rescan profile", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleApplyScan = async () => {
        if (!scanResult) return;
        try {
            setIsLoading(true);
            await userService.updateProfile({
                techStack: scanResult.techStack,
                inferredRole: scanResult.inferredRole,
                roleAnalysis: scanResult.roleAnalysis
            });
            const data = await userService.getProfile();
            setProfileData(data);
            setShowScanModal(false);
        } catch (error) {
            console.error("Failed to apply results", error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className={`min-h-screen bg-background text-text-primary font-sans selection:bg-primary selection:text-white ${embed ? 'min-h-0' : ''}`}>
            {/* Navbar */}
            {!embed && (
                <nav className="border-b border-background-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <span className="text-xl font-bold tracking-tight">CodePodAI</span>
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
                                    <button
                                        onClick={handleRescanProfile}
                                        disabled={isAnalyzing}
                                        className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                    >
                                        <FaGithub className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                        {isAnalyzing ? 'Analyzing...' : 'Rescan Profile'}
                                    </button>
                                )}
                            </div>
                            <p className="text-text-secondary text-lg mb-4 font-medium">@{user.githubId || 'username'} • {user.role || 'Developer'}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                                <div className="flex items-center gap-2">
                                    <HiOutlineLocationMarker className="w-4 h-4" />
                                    {user.location || 'Remote'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <HiOutlineMail className="w-4 h-4" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <HiOutlineGlobeAlt className="w-4 h-4" />
                                    {user.website || 'codepodai.io'}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2.5 bg-background-surface border border-background-border font-bold rounded-lg hover:bg-background-border/50 transition-colors flex items-center gap-2"
                            >
                                <FaEdit className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Stats & Badges */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {/* Grinding Metrics */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Total XP Earned</div>
                                <div className="text-3xl font-bold text-white mb-1">{totalPoints.toLocaleString()}</div>
                                <div className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                                    <HiTrendingUp className="w-3 h-3" />
                                    Level Up Imminent
                                </div>
                            </div>

                            <div className="bg-background-surface border border-background-border rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Active Pods</div>
                                <div className="text-3xl font-bold text-white mb-1">{pods.length}</div>
                                <div className="text-[10px] font-bold text-cyan-500 flex items-center gap-1">
                                    <HiUsers className="w-3 h-3" />
                                    Collaborating
                                </div>
                            </div>

                            {/* Reliability & Behavior Metrics */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-5 relative overflow-hidden group hover:border-primary/50 transition-colors">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors"></div>
                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 relative z-10 flex items-center gap-1.5">
                                    <HiChartBar className="w-3.5 h-3.5 text-primary" />
                                    Reliability Score
                                </div>
                                <div className="flex items-baseline gap-1 relative z-10">
                                    <div className="text-3xl font-bold text-white">{Math.round(user.reliabilityScore || 100)}</div>
                                    <div className="text-xs font-bold text-primary">/100</div>
                                </div>
                                <div className="w-full bg-background-border/30 h-1 mt-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(88,166,154,0.5)]"
                                        style={{ width: `${user.reliabilityScore || 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-background-surface border border-background-border rounded-xl p-5 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full group-hover:bg-orange-500/10 transition-colors"></div>
                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 relative z-10 flex items-center gap-1.5">
                                    <FaFire className="w-3.5 h-3.5 text-orange-500" />
                                    Team Impact
                                </div>
                                <div className="flex items-baseline gap-2 relative z-10">
                                    <div className="text-3xl font-bold text-white">{(user.dynamicsMetrics?.rescueCount || 0)}</div>
                                    <div className="text-[10px] font-bold text-orange-500 uppercase">Rescues</div>
                                </div>
                                <div className="text-[10px] font-bold text-text-secondary mt-3 flex items-center justify-between">
                                    <span>ON-TIME RATE</span>
                                    <span className="text-primary">{(user.dynamicsMetrics?.onTimeRate || 100)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Behavior Metrics Card */}
                        <div className="bg-background-surface/40 border border-background-border/60 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1">Consistency</div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                            <div key={i} className={`flex-1 h-3 rounded-sm ${i <= ((user.dynamicsMetrics?.onTimeRate || 100) / 14) ? 'bg-primary' : 'bg-background-border'}`}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-background-border/50"></div>
                                <div className="flex-1">
                                    <div className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1">Team Player</div>
                                    <div className="text-sm font-bold text-text-primary capitalize">
                                        {(user.dynamicsMetrics?.rescueCount || 0) > 5 ? 'Elite Guardian' : (user.dynamicsMetrics?.rescueCount || 0) > 0 ? 'Project Rescuer' : 'Collaborator'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights Layer */}
                        <div className="bg-background-surface border border-background-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                                    <HiLightningBolt className="w-4 h-4 text-primary" />
                                    AI Profile Insights
                                </h3>
                                <button
                                    onClick={async () => {
                                        setIsLoading(true);
                                        try {
                                            await githubService.syncActivity();
                                            const data = await userService.getProfile();
                                            setProfileData(data);
                                        } catch (e) {
                                            console.error("Manual refresh failed", e);
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                    className="p-1 hover:bg-primary/10 text-text-secondary hover:text-primary rounded-md transition-colors"
                                    title="Refresh AI Insights"
                                >
                                    <HiRefresh className="w-3 h-3" />
                                </button>
                            </div>

                            {user.roleAnalysis ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-text-secondary leading-relaxed italic border-l-2 border-primary/30 pl-3">
                                        "{user.roleAnalysis.reason}"
                                    </p>
                                    <div className="space-y-3">
                                        {user.roleAnalysis.languages.map((lang: any) => (
                                            <div key={lang.name} className="space-y-1">
                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                    <span className="text-text-primary">{lang.name}</span>
                                                    <span className="text-primary">{lang.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-background-border/30 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${lang.percentage}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {(user.techStack || ['React', 'Node.js', 'TypeScript']).map((tech: string) => (
                                        <span key={tech} className="px-3 py-1 bg-background-border/20 border border-background-border rounded-full text-[10px] font-bold text-text-primary">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Earned Badges */}
                        <div className="bg-background-surface border border-background-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">Earned Badges</h3>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{badgeCount}</span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500" title="Gold Contributor">
                                    <FaMedal className="w-5 h-5" />
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500" title="Mentor">
                                    <FaCertificate className="w-5 h-5" />
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500" title="Rocket Ship">
                                    <FaRocket className="w-5 h-5" />
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500" title="Bug Hunter">
                                    <FaBug className="w-5 h-5" />
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
                                                                activity.type === 'issue_closed' ? 'border-yellow-500/50 text-yellow-500' :
                                                                    activity.type === 'review_comment' ? 'border-purple-400/50 text-purple-400' :
                                                                        'border-background-border text-text-secondary'
                                                    } flex items-center justify-center z-10 shadow-sm transition-transform hover:scale-110`}>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        {activity.type === 'commit' ? (
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                                        ) : activity.type.startsWith('pr') ? (
                                                            <path d="M15 14h5v-2h-5v-6h2v-2h-6v2h2v4h-6v-4h2v-2h-6v2h2v6h-5v2h5v6h-2v2h6v-2h-2v-4h6v4h-2v2h6v-2h-2v-6z" />
                                                        ) : activity.type === 'issue_closed' ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        ) : activity.type === 'review_comment' ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        ) : (
                                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                        )}
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="font-bold text-text-primary text-sm">
                                                        {activity.type === 'commit' ? `Committed to ${activity.meta?.repoName || 'repository'}` :
                                                            activity.type === 'repo_created' ? `Created repository ${activity.meta?.repoName}` :
                                                                activity.type === 'pr_opened' ? `Opened PR #${activity.meta?.prNumber} in ${activity.meta?.repoName}` :
                                                                    activity.type === 'pr_merged' ? `Merged PR #${activity.meta?.prNumber} in ${activity.meta?.repoName}` :
                                                                        activity.type === 'review_comment' ? `Reviewed code in ${activity.meta?.repoName}` :
                                                                            activity.type === 'issue_closed' ? `Closed Issue #${activity.meta?.issueNumber} in ${activity.meta?.repoName}` :
                                                                                'User Activity'}
                                                    </h4>
                                                    <p className="text-xs text-text-secondary line-clamp-2">{activity.meta?.message || 'Activity synchronized from GitHub.'}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-text-secondary">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                                        <div className="flex items-center gap-1.5 bg-background-border/20 px-2 py-0.5 rounded border border-background-border/50">
                                                            <span className="text-[9px] font-bold text-primary">+{activity.value} XP</span>
                                                            <span className="w-1 h-1 rounded-full bg-text-secondary/30"></span>
                                                            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-tight">{activity.type.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ol>
                            </div>
                        </div>

                        {/* Code Graph */}
                        <div className="bg-background-surface border border-background-border rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-text-primary">Impact Velocity</h3>
                                <div className="flex gap-2 items-center text-[10px] text-text-secondary font-bold uppercase">
                                    <span>Lower</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 bg-background-border/50 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-primary/40 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-primary/70 rounded-sm"></div>
                                        <div className="w-3 h-3 bg-primary rounded-sm"></div>
                                    </div>
                                    <span>Higher</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between h-32 gap-4">
                                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((month, i) => (
                                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="w-full flex items-end justify-center gap-1 h-full">
                                            <div className={`w-3 rounded-t-sm transition-all group-hover:bg-primary/80 ${i % 2 === 0 ? 'h-1/3 bg-primary/20' : 'h-1/2 bg-primary/40'}`}></div>
                                            <div className={`w-3 rounded-t-sm transition-all group-hover:bg-primary ${i % 2 === 0 ? 'h-2/3 bg-primary/60' : 'h-full bg-primary'}`}></div>
                                        </div>
                                        <span className="text-[9px] font-bold text-text-secondary uppercase">{month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <div className="bg-background-surface border border-background-border rounded-2xl w-full max-w-md p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-text-primary">Edit Profile</h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-text-secondary hover:text-text-primary transition-colors text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleEditProfile} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-background border border-background-border rounded-lg px-4 py-2.5 text-text-primary focus:border-primary outline-none"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-6 py-2.5 bg-background-surface border border-background-border font-bold rounded-lg hover:bg-background-border/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-2.5 bg-primary text-background font-bold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Scan Preview Modal */}
            {showScanModal && scanResult && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl">
                    <div className="bg-background-surface border border-background-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="p-8 border-b border-background-border bg-gradient-to-br from-primary/10 to-transparent">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                                        <HiLightningBolt className="text-primary w-8 h-8" />
                                        Profile Re-Scan Results
                                    </h2>
                                    <p className="text-text-secondary mt-1">Our AI analyzed your recent GitHub activity. Here's what we found:</p>
                                </div>
                                <button onClick={() => setShowScanModal(false)} className="text-text-secondary hover:text-text-primary text-2xl group transition-all">
                                    <span className="inline-block group-hover:rotate-90 transition-transform">&times;</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Suggested Role */}
                            <div className="bg-background-border/20 rounded-2xl p-6 border border-background-border/50">
                                <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Suggested Role</div>
                                <div className="text-2xl font-bold text-white mb-2">{scanResult.inferredRole}</div>
                                <p className="text-sm text-text-secondary leading-relaxed italic pr-4">
                                    "{scanResult.roleAnalysis?.reason}"
                                </p>
                            </div>

                            {/* Tech Stack Chips */}
                            <div>
                                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Detected Tech Stack</div>
                                <div className="flex flex-wrap gap-2">
                                    {scanResult.techStack.map((tech: string) => (
                                        <span key={tech} className="px-4 py-2 bg-background border border-background-border rounded-xl text-xs font-bold text-text-primary hover:border-primary/50 transition-colors">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed Language Breakdown */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Detailed Analytics</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(scanResult.roleAnalysis?.languages || []).map((lang: any) => (
                                        <div key={lang.name} className="space-y-2">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-text-primary">{lang.name}</span>
                                                <span className="text-primary">{lang.percentage}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-background-border/30 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${lang.percentage}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-background-border/10 flex gap-4">
                            <button
                                onClick={() => setShowScanModal(false)}
                                className="flex-1 px-8 py-4 bg-background-surface border border-background-border font-bold rounded-2xl hover:bg-background-border/50 transition-colors"
                            >
                                Discard Changes
                            </button>
                            <button
                                onClick={handleApplyScan}
                                className="flex-[2] px-12 py-4 bg-primary text-background font-bold rounded-2xl hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(88,166,154,0.4)]"
                            >
                                Apply to My Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default UserProfile;
