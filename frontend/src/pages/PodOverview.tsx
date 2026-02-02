import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PodTaskBoard from './PodTaskBoard';
import AIPlanningAssistant from './AIPlanningAssistant';
import GitHubActivity from './GitHubActivity';
import PodRewards from './PodRewards';
import NotificationDropdown from '../components/NotificationDropdown';
import { podService, type Pod, type PodStats } from '../services/podService';
import { HiChartBar, HiPlus, HiLightningBolt, HiOutlineHome, HiOutlineMap, HiOutlineClipboardList, HiOutlineGift, HiLockClosed } from 'react-icons/hi';
import { FaFire, FaUserShield, FaCrown, FaTools, FaGithub } from 'react-icons/fa';

// Type definitions for Sidebar Items
interface SidebarItem {
    id: string;
    label: string;
    icon: JSX.Element;
}

const PodOverview = () => {
    const navigate = useNavigate();
    const { id: podId } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('Overview');
    const [pod, setPod] = useState<Pod | null>(null);
    const [stats, setStats] = useState<PodStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<{ id: string; name: string; email: string }[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [userRepos, setUserRepos] = useState<any[]>([]);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyGithubUsername, setVerifyGithubUsername] = useState('');
    const [health, setHealth] = useState<any>(null);
    const [userStatus, setUserStatus] = useState<string>('accepted');

    const refreshData = async () => {
        if (!podId) return;
        try {
            const [podResponse, statsResponse, lbResponse] = await Promise.all([
                podService.getPod(podId),
                podService.getPodStats(podId),
                podService.getPodLeaderboard(podId)
            ]);

            setPod(podResponse.pod);
            setStats(statsResponse.stats);
            setHealth(lbResponse.health);

            // Robust user status detection
            if (podResponse.userStatus) {
                setUserStatus(podResponse.userStatus);
            } else {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const member = podResponse.pod.members.find(m => m.userId === currentUser.id || m.user?.id === currentUser.id);
                if (member) setUserStatus(member.status);
            }
        } catch (error) {
            console.error("Failed to fetch pod data", error);
        }
    };

    useEffect(() => {
        const fetchPodData = async () => {
            setLoading(true);
            await refreshData();
            setLoading(false);
        };
        fetchPodData();
    }, [podId]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchUserRepos = async () => {
        setIsLoadingRepos(true);
        try {
            const response = await podService.getGitHubRepos();
            setUserRepos(response.repos);
        } catch (error: any) {
            console.error("Failed to fetch repos", error);
            setMessage({ type: 'error', text: 'Please connect GitHub in your profile first' });
        } finally {
            setIsLoadingRepos(false);
        }
    };

    const handleUserSearch = async (query: string) => {
        setUserSearchQuery(query);
        if (query.length < 2) {
            setUserSearchResults([]);
            return;
        }
        setIsSearchingUsers(true);
        try {
            const response = await podService.searchUsers(query);
            setUserSearchResults(response.users);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearchingUsers(false);
        }
    };

    const handleAddMember = async (userId: string) => {
        if (!podId) return;
        setUpdating(true);
        try {
            await podService.addMember(podId, userId);
            setMessage({ type: 'success', text: 'Member added successfully!' });
            setIsMemberModalOpen(false);
            setUserSearchQuery('');
            setUserSearchResults([]);
            refreshData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to add member' });
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: string) => {
        if (!podId) return;
        setUpdating(true);
        try {
            await podService.updateMemberRole(podId, memberId, newRole);
            setMessage({ type: 'success', text: 'Member role updated!' });
            refreshData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update role' });
        } finally {
            setUpdating(false);
        }
    };

    const handleSync = async () => {
        if (!podId) return;
        setUpdating(true);
        try {
            await podService.syncPodActivity(podId);
            setMessage({ type: 'success', text: 'Activity synced with GitHub!' });
            refreshData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Sync failed' });
        } finally {
            setUpdating(false);
        }
    };

    const handleVerifyGitHub = async () => {
        if (!verifyGithubUsername) return;
        setIsVerifying(true);
        try {
            await podService.updateProfile({ githubUsername: verifyGithubUsername });
            setMessage({ type: 'success', text: 'GitHub username verified!' });
            // Update local storage user
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, githubUsername: verifyGithubUsername }));
            refreshData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Verification failed' });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRespondInvite = async (status: 'accepted' | 'rejected') => {
        if (!podId) return;
        setUpdating(true);
        try {
            await podService.respondToInvite(podId, status);
            if (status === 'accepted') {
                setMessage({ type: 'success', text: 'Welcome to the pod! 🚀' });
                refreshData();
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to respond to invite' });
        } finally {
            setUpdating(false);
        }
    };

    // Sidebar Items configuration
    const sidebarItems: SidebarItem[] = [
        {
            id: 'Overview',
            label: 'Overview',
            icon: <HiOutlineHome className="w-5 h-5" />
        },
        {
            id: 'AIPlanning',
            label: 'AI Generate Roadmap',
            icon: <HiOutlineMap className="w-5 h-5" />
        },
        {
            id: 'TaskBoard',
            label: 'Assign Tasks to Team',
            icon: <HiOutlineClipboardList className="w-5 h-5" />
        },
        {
            id: 'GitHubStats',
            label: 'GitHub Activity',
            icon: <FaGithub className="w-5 h-5" />
        },
        {
            id: 'Rewards',
            label: 'Rewards & Leaderboard',
            icon: <HiOutlineGift className="w-5 h-5" />
        }
    ];

    const renderContent = () => {
        if (loading) return <div className="h-full flex items-center justify-center text-text-secondary">Loading Pod...</div>;
        if (!pod) return <div className="h-full flex items-center justify-center text-text-secondary">Pod not found.</div>;

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentMember = pod.members.find(m => m.user?.id === currentUser.id || m.userId === currentUser.id);
        const needsGithubVerification = !currentMember?.user?.githubUsername && !currentUser.githubUsername;

        if (userStatus === 'pending' && activeTab !== 'Overview') {
            return (
                <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <HiLockClosed className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Section Locked</h2>
                    <p className="text-text-secondary text-center max-w-md mb-8">
                        This section contains confidential team collaboration and task data.
                        Please <span className="text-primary font-bold">Accept the Invitation</span> in the Overview tab to unlock full access.
                    </p>
                    <button
                        onClick={() => setActiveTab('Overview')}
                        className="px-6 py-2 bg-background-border text-text-primary rounded-lg font-bold hover:bg-primary/10 transition-colors"
                    >
                        GO TO OVERVIEW
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case 'TaskBoard':
                return <PodTaskBoard />;
            case 'AIPlanning':
                return <AIPlanningAssistant pod={pod} />;
            case 'GitHubStats':
                return <GitHubActivity />;
            case 'Rewards':
                return <PodRewards />;
            case 'Overview':
            default:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-text-primary">
                        {/* Verification Banner */}
                        {needsGithubVerification && (
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-primary/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">⚡</div>
                                    <div>
                                        <h3 className="font-bold text-text-primary">Unlock your contributions!</h3>
                                        <p className="text-sm text-text-secondary">Link your GitHub username to earn XP and appear on the leaderboard.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <input
                                        type="text"
                                        placeholder="GitHub Username"
                                        value={verifyGithubUsername}
                                        onChange={(e) => setVerifyGithubUsername(e.target.value)}
                                        className="bg-background-surface border border-background-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 flex-1 md:w-48"
                                    />
                                    <button
                                        onClick={handleVerifyGitHub}
                                        disabled={isVerifying || !verifyGithubUsername}
                                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isVerifying ? 'LINKING...' : 'LINK ACCOUNT'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Commits */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">Total Commits</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-text-primary">{stats?.commits.value || '0'}</span>
                                    {stats?.commits.trend && (
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded leading-none">{stats.commits.trend}</span>
                                    )}
                                </div>
                                <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[70%] rounded-full shadow-[0_0_10px_rgba(88,166,154,0.5)]"></div>
                                </div>
                            </div>

                            {/* Weekly Commits */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-ai-start/50 transition-colors">
                                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">Weekly Commits</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-text-primary">{stats?.weeklyCommits?.value || '0'}</span>
                                    <span className="text-xs font-medium text-text-secondary uppercase tracking-widest opacity-50">this week</span>
                                </div>
                                <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-ai-start w-[40%] rounded-full shadow-[0_0_10px_rgba(147,197,253,0.5)]"></div>
                                </div>
                            </div>

                            {/* Pull Requests */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">Pull Requests</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-text-primary">{stats?.prs.value || '0'}</span>
                                    {stats?.prs.trend && (
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded leading-none">{stats.prs.trend}</span>
                                    )}
                                </div>
                                <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[20%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>

                            {/* Uptime */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">Uptime</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-text-primary">{stats?.uptime.value || '99.9'}</span>
                                    <span className="text-lg text-text-secondary font-medium">{stats?.uptime.unit || '%'}</span>
                                </div>
                                <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[99%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 flex flex-col gap-8">
                                {/* Project Brief */}
                                <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card">
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        <h2 className="text-lg font-bold text-text-primary">Project Brief</h2>
                                    </div>
                                    <p className="text-text-secondary text-sm leading-relaxed mb-6">
                                        {pod.description || "Building the next generation of decentralized collaboration tools."}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-background/30 border border-background-border rounded-lg p-3 group relative overflow-hidden">
                                            <div className="text-xs font-bold text-text-secondary mb-1">REPOSITORY</div>
                                            {pod.repoOwner && pod.repoName ? (
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm font-medium text-text-primary truncate">{pod.repoOwner}/{pod.repoName}</div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleSync}
                                                            disabled={updating}
                                                            className="text-[10px] font-bold text-primary hover:underline disabled:opacity-50"
                                                        >
                                                            {updating ? 'SYNCING...' : 'SYNC'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsRepoModalOpen(true);
                                                                fetchUserRepos();
                                                            }}
                                                            className="text-[10px] font-bold text-text-secondary hover:text-text-primary"
                                                        >
                                                            EDIT
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setIsRepoModalOpen(true);
                                                        fetchUserRepos();
                                                    }}
                                                    className="w-full py-1 text-xs font-bold text-primary bg-primary/10 rounded border border-primary/20 hover:bg-primary/20 transition-all"
                                                >
                                                    + LINK REPOSITORY
                                                </button>
                                            )}
                                        </div>
                                        <div className="bg-background/30 border border-background-border rounded-lg p-3">
                                            <div className="text-xs font-bold text-text-secondary mb-1">CREATED</div>
                                            <div className="text-sm font-medium text-text-primary">{new Date(pod.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Intelligence */}
                                <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card hover:border-ai-start/30 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-ai-start/5 rounded-full -mr-16 -mt-16 group-hover:bg-ai-start/10 transition-colors"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-ai-start" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" /></svg>
                                            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Project Intelligence</h2>
                                        </div>
                                        <span className="text-[10px] font-bold bg-ai-start/20 text-blue-400 px-2 py-0.5 rounded-full uppercase">Strategic Memory</span>
                                    </div>

                                    {pod.projectBrain ? (
                                        <div className="space-y-4 relative z-10">
                                            <div className="p-3 bg-background/50 rounded-xl border border-background-border/50">
                                                <p className="text-xs text-text-secondary leading-relaxed italic line-clamp-4">
                                                    "{pod.projectBrain.summary}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {pod.projectBrain.decisions?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="text-[10px] font-bold text-text-secondary uppercase">Key Decisions</div>
                                                        <div className="flex flex-col gap-1.5">
                                                            {pod.projectBrain.decisions.slice(0, 3).map((d: string, i: number) => (
                                                                <div key={i} className="flex gap-2 items-start text-[11px] text-text-primary font-medium">
                                                                    <span className="text-ai-start mt-0.5">◈</span>
                                                                    <span className="line-clamp-1">{d}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {pod.projectBrain.milestones?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="text-[10px] font-bold text-text-secondary uppercase">Recent Milestones</div>
                                                        <div className="flex flex-col gap-1.5">
                                                            {pod.projectBrain.milestones.slice(0, 3).map((m: string, i: number) => (
                                                                <div key={i} className="flex gap-2 items-start text-[11px] text-text-primary font-medium">
                                                                    <span className="text-green-500 mt-0.5">✔</span>
                                                                    <span className="line-clamp-1">{m}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-background-border/30 flex justify-end items-center text-[10px] text-text-secondary font-bold">
                                                <button
                                                    onClick={() => setActiveTab('AIPlanning')}
                                                    className="text-ai-start hover:underline cursor-pointer"
                                                >
                                                    VIEW FULL STRATEGY →
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 space-y-3 relative z-10">
                                            <div className="w-12 h-12 rounded-full bg-ai-start/10 border border-ai-start/20 flex items-center justify-center mx-auto">
                                                <svg className="w-6 h-6 text-ai-start opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-secondary">Project Brain currently learning...</p>
                                                <button
                                                    onClick={() => setActiveTab('AIPlanning')}
                                                    className="text-[10px] font-bold text-ai-start mt-2 hover:underline"
                                                >
                                                    GENERATE ROADMAP TO SEED BRAIN
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Health Index */}
                            <div className="lg:col-span-1 bg-background-surface border border-background-border rounded-2xl p-6 shadow-card flex flex-col relative group hover:border-primary/40 transition-all">
                                <h2 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <HiChartBar className="w-4 h-4 text-primary" />
                                    Pod Health Index
                                </h2>

                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative w-36 h-36 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                                            <circle cx="50" cy="50" r="42" fill="none" stroke={
                                                (health?.score || 0) > 80 ? '#58A69A' :
                                                    (health?.score || 0) > 50 ? '#EAB308' : '#EF4444'
                                            } strokeWidth="8"
                                                strokeDasharray="263.8"
                                                strokeDashoffset={263.8 - (263.8 * (health?.score || 0)) / 100}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-text-primary">{health?.score || 0}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${health?.tag === 'Excellent' ? 'bg-success/10 text-success' :
                                                health?.tag === 'Good' ? 'bg-cyan-500/10 text-cyan-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>{health?.tag || 'NA'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">⚡ AI Quick Solves</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {health?.quickSolves && health.quickSolves.length > 0 ? (
                                            health.quickSolves.map((solve: any) => (
                                                <div key={solve.id} className="p-2.5 rounded-xl bg-background/40 border border-background-border/50 group/solve hover:border-primary/30 transition-all">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[11px] font-bold text-text-primary">{solve.title}</span>
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${solve.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                                                            }`}>
                                                            {solve.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-text-secondary leading-tight">{solve.action}</p>
                                                </div>
                                            ))
                                        ) : (health?.score || 0) > 80 ? (
                                            <div className="text-center py-4 bg-success/5 border border-success/20 rounded-xl">
                                                <p className="text-[10px] text-success font-bold italic">Pod is perfectly optimized! ✨</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 bg-background/20 border border-background-border rounded-xl">
                                                <p className="text-[10px] text-text-secondary italic">Performing strategic analysis...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Contributors */}
                        <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-text-primary">Active Contributors</h2>
                                <button
                                    onClick={() => setIsMemberModalOpen(true)}
                                    className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 transition-all"
                                >
                                    <HiPlus className="w-3.5 h-3.5" />
                                    Add Member
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {pod.members.map(member => {
                                    const isSelf = member.userId === currentUser.id;
                                    const isAdmin = pod.members.find(m => m.userId === currentUser.id)?.role === 'admin';

                                    return (
                                        <div key={member.id} className="bg-background/30 border border-background-border rounded-xl p-4 flex items-center gap-4 hover:bg-background/50 transition-colors group relative">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.name}`} alt={member.user?.name} className="w-10 h-10 rounded-full bg-background-surface" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-text-primary truncate">{member.user?.name} {isSelf && "(You)"}</h3>
                                                <p className="text-[10px] text-text-secondary font-medium truncate mb-1">{member.user?.inferredRole || 'Developer'}</p>
                                                <div className="flex items-center gap-2">
                                                    {isAdmin && !isSelf ? (
                                                        <select
                                                            value={member.role}
                                                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                                            disabled={updating}
                                                            className="text-[10px] font-bold bg-background-border/50 border-none rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                                                        >
                                                            <option value="member">MEMBER</option>
                                                            <option value="maintainer">MAINTAINER</option>
                                                            <option value="admin">ADMIN</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`text-[10px] font-bold px-1.5 rounded flex items-center gap-1 ${member.role === 'admin' ? 'bg-green-500/20 text-green-500' :
                                                            member.role === 'maintainer' ? 'bg-purple-500/20 text-purple-500' :
                                                                'bg-blue-500/20 text-blue-500'}`}>
                                                            {member.role === 'admin' ? <FaCrown className="w-2 h-2" /> : member.role === 'maintainer' ? <FaTools className="w-2 h-2" /> : <FaUserShield className="w-2 h-2" />}
                                                            {member.role.toUpperCase()}
                                                        </span>
                                                    )}

                                                    <div className="flex items-center gap-1.5 ml-auto bg-background/50 px-2 py-0.5 rounded border border-background-border/50 group-hover:border-primary/30 transition-colors" title={`Reliability: ${Math.round(member.user?.reliabilityScore || 100)}%`}>
                                                        <HiChartBar className={`w-3 h-3 ${(member.user?.reliabilityScore || 100) > 80 ? 'text-primary' :
                                                            (member.user?.reliabilityScore || 100) > 50 ? 'text-yellow-500' : 'text-red-500'
                                                            }`} />
                                                        <div className="w-8 h-1 bg-background-border rounded-full overflow-hidden hidden sm:block">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${(member.user?.reliabilityScore || 100) > 80 ? 'bg-primary' :
                                                                    (member.user?.reliabilityScore || 100) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${member.user?.reliabilityScore || 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-text-secondary">{Math.round(member.user?.reliabilityScore || 100)}</span>
                                                    </div>

                                                    {(member.user?.dynamicsMetrics?.rescueCount || 0) > 0 && (
                                                        <div className="flex items-center gap-0.5 text-orange-400 group/rescue" title={`Has rescued ${member.user?.dynamicsMetrics?.rescueCount} tasks!`}>
                                                            <FaFire className="w-3 h-3 animate-pulse" />
                                                            <span className="text-[8px] font-bold">{(member.user?.dynamicsMetrics?.rescueCount)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AI Team Gap Analysis */}
                        <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card overflow-hidden relative group mt-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 transition-transform duration-500 group-hover:scale-110"></div>

                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                            <HiLightningBolt className="text-primary w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-text-primary">AI Team Gap Analysis</h2>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Strategic Hiring Recommendations</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                                        Our analysis of your current team's tech stack and project velocity shows a strong foundation in
                                        <span className="text-text-primary font-bold"> {
                                            Array.from(new Set(pod.members.flatMap(m => m.user?.techStack || []))).slice(0, 3).join(', ')
                                        }</span>. However, to reach peak efficiency, we've identified the following gaps:
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="p-4 bg-background/50 rounded-xl border border-background-border/50 hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]"></div>
                                                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Required: {
                                                    !pod.members.some(m => (m.user?.inferredRole || '').toLowerCase().includes('backend')) ? 'Backend Architect' :
                                                        !pod.members.some(m => (m.user?.inferredRole || '').toLowerCase().includes('devops')) ? 'DevOps Engineer' : 'QA/Test Specialist'
                                                }</span>
                                            </div>
                                            <p className="text-[11px] text-text-secondary">Current velocity is bottlenecked by {
                                                !pod.members.some(m => (m.user?.inferredRole || '').toLowerCase().includes('backend')) ? 'database optimization and API scaling' :
                                                    !pod.members.some(m => (m.user?.inferredRole || '').toLowerCase().includes('devops')) ? 'deployment friction and CI/CD maintenance' : 'untested edge cases and regression risks'
                                            }.</p>
                                        </div>

                                        <div className="p-4 bg-background/50 rounded-xl border border-background-border/50 hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                                                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Skill Pivot: {
                                                    pod.members.flatMap(m => m.user?.techStack || []).includes('Python') ? 'Data Engineering' : 'Real-time Systems'
                                                }</span>
                                            </div>
                                            <p className="text-[11px] text-text-secondary">Leverage your existing {
                                                pod.members.flatMap(m => m.user?.techStack || []).includes('Python') ? 'Python expertise to build AI pipelines' : 'TypeScript foundation for WebSockets implementation'
                                            }.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-64 space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                                    <div className="text-center space-y-1">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">Team Score</div>
                                        <div className="text-4xl font-black text-text-primary">{Math.min(100, pod.members.length * 20)}%</div>
                                        <div className="text-[9px] font-bold text-text-secondary uppercase">Composition Index</div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-[10px] font-bold items-center">
                                            <span className="text-text-secondary">FRONTEND</span>
                                            <span className="text-text-primary">{Math.round((pod.members.filter(m => (m.user?.inferredRole || '').toLowerCase().includes('frontend')).length / pod.members.length) * 100) || 0}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-background-border rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${(pod.members.filter(m => (m.user?.inferredRole || '').toLowerCase().includes('frontend')).length / pod.members.length) * 100 || 0}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold items-center mt-3">
                                            <span className="text-text-secondary">BACKEND</span>
                                            <span className="text-text-primary">{Math.round((pod.members.filter(m => (m.user?.inferredRole || '').toLowerCase().includes('backend')).length / pod.members.length) * 100) || 0}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-background-border rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500" style={{ width: `${(pod.members.filter(m => (m.user?.inferredRole || '').toLowerCase().includes('backend')).length / pod.members.length) * 100 || 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary selection:text-primary-foreground flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-background-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50 h-16 shrink-0">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <span className="text-xl font-bold tracking-tight">CodePodAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationDropdown />
                        <div className="bg-background-surface/50 px-3 py-1.5 rounded-lg border border-background-border flex items-center gap-2 w-64">
                            <svg className="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" placeholder="Search pods..." className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-secondary" />
                        </div>
                        <div
                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary cursor-pointer hover:ring-2 hover:ring-primary transition-all p-[1px]"
                            onClick={() => navigate('/profile')}
                        >
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                                alt="Profile"
                                className="w-full h-full rounded-full bg-background-surface"
                            />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-background-border bg-background-surface/80 backdrop-blur-xl flex flex-col relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-ai-start/50 to-primary/50 opacity-50"></div>

                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-8 p-3 bg-background/40 rounded-xl border border-background-border/50 group transition-all duration-300 hover:border-primary/30">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-ai-start/20 border border-primary/20 flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                                <span className="font-bold text-primary text-xl drop-shadow-[0_0_8px_rgba(88,166,154,0.4)]">{pod?.name.charAt(0) || 'N'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-sm font-bold text-text-primary truncate transition-colors group-hover:text-primary">{pod?.name || 'Project'}</h2>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-70">Active Pod</p>
                            </div>
                        </div>

                        <nav className="space-y-1.5">
                            {sidebarItems.map((item) => {
                                const isLocked = userStatus === 'pending' && item.id !== 'Overview';

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => !isLocked && setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                            ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_15px_rgba(88,166,154,0.1)]'
                                            : isLocked
                                                ? 'text-text-secondary/30 cursor-not-allowed opacity-60 grayscale'
                                                : 'text-text-secondary hover:text-primary hover:bg-primary/5 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                {item.icon}
                                            </span>
                                            <span className="relative z-10">{item.label}</span>
                                        </div>

                                        {isLocked && (
                                            <HiLockClosed className="w-3.5 h-3.5 text-text-secondary/50" />
                                        )}

                                        {activeTab === item.id && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full animate-in slide-in-from-left duration-300"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-background-border/50 bg-background/20">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-background-surface border border-background-border text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                            Exit Pod
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-background p-8 relative">
                    {/* Toast Notification */}
                    {message && (
                        <div className={`fixed top-20 right-8 z-[100] px-6 py-3 rounded-xl border shadow-xl animate-in slide-in-from-right duration-300 flex items-center gap-3 ${message.type === 'success' ? 'bg-success/10 border-success/30 text-success' : 'bg-red-500/10 border-red-500/30 text-red-500'
                            }`}>
                            {message.type === 'success' ? (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            )}
                            <span className="text-sm font-bold uppercase tracking-wider">{message.text}</span>
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* GLOBAL INVITATION BANNER */}
                        {userStatus === 'pending' && (
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-primary/10 animate-in slide-in-from-top-4 duration-500 mb-8 border-l-4 border-l-primary">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl shadow-inner">📩</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-text-primary">Pending Invitation</h3>
                                        <p className="text-sm text-text-secondary max-w-md mt-1">
                                            You've been invited to join <span className="text-primary font-bold">@{pod?.name}</span>.
                                            Accept to unlock your contributions, earn XP, and start collaborating.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button
                                        onClick={() => handleRespondInvite('rejected')}
                                        disabled={updating}
                                        className="flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold text-text-secondary hover:bg-background-border transition-all hover:text-text-primary disabled:opacity-50"
                                    >
                                        DECLINE
                                    </button>
                                    <button
                                        onClick={() => handleRespondInvite('accepted')}
                                        disabled={updating}
                                        className="flex-1 md:flex-none bg-primary text-primary-foreground px-10 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {updating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                JOINING...
                                            </>
                                        ) : (
                                            <>
                                                <HiPlus className="w-5 h-5" />
                                                ACCEPT INVITATION
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* Modal - Link Repository */}
            {isRepoModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsRepoModalOpen(false)}></div>
                    <div className="bg-background-surface border border-background-border rounded-2xl p-8 w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-text-primary">Link GitHub Repository</h2>
                            <button onClick={() => setIsRepoModalOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <p className="text-text-secondary text-sm mb-6">Select a repository from your GitHub account to sync commit and contributor stats with this pod.</p>

                        <div className="space-y-4">
                            {isLoadingRepos ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Fetching Repositories...</span>
                                </div>
                            ) : userRepos.length > 0 ? (
                                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1 mb-2">Select a Repository</div>
                                    {userRepos.map((repo) => (
                                        <button
                                            key={repo.id}
                                            onClick={async () => {
                                                setUpdating(true);
                                                try {
                                                    await podService.updatePod(podId!, { repoOwner: repo.owner.login, repoName: repo.name });
                                                    setMessage({ type: 'success', text: 'Repository linked successfully!' });
                                                    setIsRepoModalOpen(false);
                                                    refreshData();
                                                } catch (error: any) {
                                                    setMessage({ type: 'error', text: error.message || 'Failed to link repository' });
                                                } finally {
                                                    setUpdating(false);
                                                }
                                            }}
                                            disabled={updating}
                                            className="w-full bg-background/40 border border-background-border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 hover:bg-background/60 transition-all group text-left"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg className="w-3.5 h-3.5 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                                    <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{repo.name}</span>
                                                </div>
                                                <div className="text-[10px] text-text-secondary italic">{repo.description || "No description provided"}</div>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-bold text-text-primary">{repo.stargazers_count}</span>
                                                    <span className="text-[8px] text-text-secondary uppercase">Stars</span>
                                                </div>
                                                <div className="w-1 h-8 bg-background-border rounded-full"></div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-bold text-text-primary">{repo.language || "N/A"}</span>
                                                    <span className="text-[8px] text-text-secondary uppercase">Stack</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 rounded-full bg-background/50 border border-background-border flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-text-secondary opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                    </div>
                                    <p className="text-sm text-text-secondary italic">No repositories found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Add Member */}
            {isMemberModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMemberModalOpen(false)}></div>
                    <div className="bg-background-surface border border-background-border rounded-2xl p-8 w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-text-primary">Add Team Member</h2>
                            <button onClick={() => setIsMemberModalOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search users..."
                                value={userSearchQuery}
                                onChange={(e) => handleUserSearch(e.target.value)}
                                className="w-full bg-background border border-background-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            {isSearchingUsers && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {userSearchResults.length > 0 ? (
                                userSearchResults.map((user) => (
                                    <div key={user.id} className="bg-background/40 border border-background-border rounded-xl p-3 flex items-center justify-between hover:border-primary/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full bg-background-surface" />
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">{user.name}</div>
                                                <div className="text-[10px] text-text-secondary">{user.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddMember(user.id)}
                                            disabled={updating || pod?.members.some(m => m.userId === user.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${pod?.members.some(m => m.userId === user.id)
                                                ? 'bg-background-border/50 text-text-secondary cursor-not-allowed'
                                                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                                                }`}
                                        >
                                            {updating ? '...' : pod?.members.some(m => m.userId === user.id) ? 'ALREADY IN' : 'ADD'}
                                        </button>
                                    </div>
                                ))
                            ) : userSearchQuery.length >= 2 ? (
                                <div className="text-center py-6 text-text-secondary text-xs italic">No users found for "{userSearchQuery}"</div>
                            ) : (
                                <div className="text-center py-6 text-text-secondary text-xs italic opacity-50">Type at least 2 characters to search...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PodOverview;
