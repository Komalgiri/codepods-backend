
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PodTaskBoard from './PodTaskBoard';
import AIPlanningAssistant from './AIPlanningAssistant';
import GitHubActivity from './GitHubActivity';
import PodRewards from './PodRewards';
import UserProfile from './UserProfile';
import { podService, type Pod, type PodStats } from '../services/podService';

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

    useEffect(() => {
        const fetchPodData = async () => {
            if (!podId) return;
            try {
                const [podResponse, statsResponse] = await Promise.all([
                    podService.getPod(podId),
                    podService.getPodStats(podId)
                ]);
                setPod(podResponse.pod);
                setStats(statsResponse.stats);
            } catch (error) {
                console.error("Failed to fetch pod data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPodData();
    }, [podId]);

    // Sidebar Items configuration
    const sidebarItems: SidebarItem[] = [
        {
            id: 'Overview',
            label: 'Overview',
            icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        },
        {
            id: 'TaskBoard',
            label: 'Pod Task Board',
            icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        },
        {
            id: 'AIPlaaning',
            label: 'AI Planning Asst.',
            icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        },
        {
            id: 'GitHubStats',
            label: 'GitHub Activity',
            icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        },
        {
            id: 'Rewards',
            label: 'Rewards & Leaders',
            icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
        },
        {
            id: 'UserProfile',
            label: 'User Profile',
            icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        }
    ];

    const renderContent = () => {
        if (loading) return <div className="h-full flex items-center justify-center text-text-secondary">Loading Pod...</div>;
        if (!pod) return <div className="h-full flex items-center justify-center text-text-secondary">Pod not found.</div>;

        switch (activeTab) {
            case 'TaskBoard':
                return <PodTaskBoard />;
            case 'AIPlaaning':
                return <AIPlanningAssistant />;
            case 'GitHubStats':
                return <GitHubActivity />;
            case 'Rewards':
                return <PodRewards />;
            case 'UserProfile':
                return <UserProfile embed={true} />;
            case 'Overview':
            default:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Commits */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Commits</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">{stats?.commits.value || '0'}</span>
                                    {stats?.commits.trend && (
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{stats.commits.trend}</span>
                                    )}
                                </div>
                                <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[70%] rounded-full shadow-[0_0_10px_rgba(88,166,154,0.5)]"></div>
                                </div>
                            </div>

                            {/* Pull Requests */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pull Requests</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">{stats?.prs.value || '0'}</span>
                                    {stats?.prs.trend && (
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{stats.prs.trend}</span>
                                    )}
                                </div>
                                <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[20%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>

                            {/* Uptime */}
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Uptime</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">{stats?.uptime.value || '99.9'}</span>
                                    <span className="text-lg text-text-secondary font-medium">{stats?.uptime.unit || '%'}</span>
                                </div>
                                <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[99%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Project Brief */}
                            <div className="lg:col-span-2 bg-background-surface border border-background-border rounded-2xl p-6 shadow-card">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <h2 className="text-lg font-bold text-text-primary">Project Brief</h2>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                                    {pod.description || "Building the next generation of decentralized collaboration tools."}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-background/30 border border-background-border rounded-lg p-3">
                                        <div className="text-xs font-bold text-text-secondary mb-1">REPOSITORY</div>
                                        <div className="text-sm font-medium text-text-primary truncate">{pod.repoOwner}/{pod.repoName}</div>
                                    </div>
                                    <div className="bg-background/30 border border-background-border rounded-lg p-3">
                                        <div className="text-xs font-bold text-text-secondary mb-1">CREATED</div>
                                        <div className="text-sm font-medium text-text-primary">{new Date(pod.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pod Health */}
                            <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card flex flex-col items-center justify-center relative">
                                <h2 className="text-sm font-bold text-text-primary mb-6">Pod Health</h2>
                                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#58A69A" strokeWidth="8"
                                            strokeDasharray="251.2"
                                            strokeDashoffset={251.2 - (251.2 * (stats?.health || 0)) / 100}
                                            strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{stats?.health || 0}%</span>
                                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">COMPLETED</span>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-text-secondary">Task Completion</span>
                                        <span className="font-bold text-primary">{stats?.health || 0}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Contributors */}
                        <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-text-primary">Active Contributors</h2>
                                <button className="text-xs font-bold text-primary hover:text-primary-dark">Manage Team</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {pod.members.map(member => (
                                    <div key={member.id} className="bg-background/30 border border-background-border rounded-xl p-4 flex items-center gap-4 hover:bg-background/50 transition-colors cursor-pointer">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.name}`} alt={member.user?.name} className="w-10 h-10 rounded-full bg-background-surface" />
                                        <div>
                                            <h3 className="text-sm font-bold text-text-primary">{member.user?.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-text-secondary capitalize">{member.role}</p>
                                                <span className={`text-[10px] font-bold px-1.5 rounded ${member.role === 'admin' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                    {member.role.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary selection:text-white flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-background-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50 h-16 shrink-0">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <span className="text-xl font-bold tracking-tight">CodePods</span>
                    </div>
                    <div className="flex items-center gap-4">
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
                <aside className="w-64 border-r border-background-border bg-background-surface/30 backdrop-blur-md flex flex-col">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
                                <span className="font-bold text-primary text-xl">{pod?.name.charAt(0) || 'N'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-sm font-bold text-text-primary truncate">{pod?.name || 'Project'}</h2>
                                <p className="text-xs text-text-secondary truncate">Active Pod</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(88,166,154,0.1)]'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-background-border/30 border border-transparent'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-background-border/50">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                            Back to Dashboard
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-background p-8">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PodOverview;
