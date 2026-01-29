
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { podService } from '../services/podService';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Activity {
    id: string;
    type: string;
    description: string;
    date: string;
}

interface Pod {
    id: string;
    name: string;
    role: string;
    status: string;
}

interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'done';
    dueDate: string;
}

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [rewards, setRewards] = useState<any>(null);

    // Mock data for sections without endpoints
    const [activities] = useState<Activity[]>([
        { id: '1', type: 'commit', description: 'Pushed code to api-integration', date: '2 hours ago' },
        { id: '2', type: 'pr', description: 'Opened PR #42: Authentication flow', date: '5 hours ago' },
        { id: '3', type: 'review', description: 'Reviewed PR #40: Database schema', date: '1 day ago' },
    ]);

    const [pods, setPods] = useState<Pod[]>([]);

    const [tasks] = useState<Task[]>([
        { id: '1', title: 'Implement Auth Flow', status: 'in-progress', dueDate: 'Today' },
        { id: '2', title: 'Design Dashboard', status: 'pending', dueDate: 'Tomorrow' },
        { id: '3', title: 'Setup Database', status: 'done', dueDate: 'Yesterday' },
    ]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            navigate('/auth');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const fetchRewards = async () => {
            try {
                const rewardsData = await userService.getRewards(parsedUser.id);
                setRewards(rewardsData);
            } catch (error) {
                console.error('Failed to fetch rewards:', error);
            }
        };

        const fetchPods = async () => {
            try {
                const podsData = await podService.getUserPods();
                setPods(podsData.pods);
            } catch (error) {
                console.error('Failed to fetch pods:', error);
            }
        };

        fetchRewards();
        fetchPods();
    }, [navigate]);

    const [currentPodPage, setCurrentPodPage] = useState(0);
    const podsPerPage = 2;
    const totalPodPages = Math.ceil(pods.length / podsPerPage);

    const handlePodPageChange = (index: number) => {
        setCurrentPodPage(index);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/auth');
    };

    if (!user) return null;

    const visiblePods = pods.slice(currentPodPage * podsPerPage, (currentPodPage * podsPerPage) + podsPerPage);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary selection:text-white">
            {/* Navigation */}
            <nav className="border-b border-background-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="p-1 rounded-lg">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">CodePods</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/profile')}>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{user.name}</span>
                                <span className="text-xs font-medium text-text-secondary">{rewards?.totalPoints || 0} XP</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] group-hover:ring-2 group-hover:ring-primary transition-all">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                    alt="Profile"
                                    className="w-full h-full rounded-full bg-background-surface"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                    <p className="text-text-secondary mt-1">Welcome back, get ready to code.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Stats & Activity */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 shadow-card hover:shadow-lg transition-all duration-200">
                                <div className="text-text-secondary text-sm font-medium mb-1">Total XP</div>
                                <div className="text-3xl font-bold text-primary">{rewards?.totalPoints || 0}</div>
                                <div className="text-xs text-text-secondary mt-2">+120 this week</div>
                            </div>
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 shadow-card hover:shadow-lg transition-all duration-200">
                                <div className="text-text-secondary text-sm font-medium mb-1">Active Pods</div>
                                <div className="text-3xl font-bold text-text-primary font-mono">{pods.length}</div>
                                <div className="text-xs text-text-secondary mt-2">1 pending invite</div>
                            </div>
                            <div className="bg-background-surface border border-background-border rounded-xl p-6 shadow-card hover:shadow-lg transition-all duration-200">
                                <div className="text-text-secondary text-sm font-medium mb-1">Open Tasks</div>
                                <div className="text-3xl font-bold text-text-primary font-mono">{tasks.filter(t => t.status !== 'done').length}</div>
                                <div className="text-xs text-text-secondary mt-2">{tasks.filter(t => t.status === 'in-progress').length} in progress</div>
                            </div>
                        </div>

                        {/* Recent Activity & My Pods Grid */}
                        <div className="grid grid-cols-1 gap-8">
                            {/* My Pods Section */}
                            <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card min-h-[400px] flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-text-primary">My Pods</h2>
                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{pods.length}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate('/create-pod')}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-all"
                                        title="Create New Pod"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                        Create Pod
                                    </button>
                                </div>

                                <div className="flex-1">
                                    {pods.length === 0 ? (
                                        <div className="text-center py-12 bg-background/20 rounded-xl border border-dashed border-background-border">
                                            <div className="w-12 h-12 bg-background-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-background-border">
                                                <svg className="w-6 h-6 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                            </div>
                                            <p className="text-text-secondary text-sm font-medium">You haven't joined any pods yet.</p>
                                            <p className="text-text-secondary/50 text-xs mt-1 mb-6">Start collaborating by creating a new workspace.</p>
                                            <button
                                                onClick={() => navigate('/create-pod')}
                                                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/20"
                                            >
                                                Create your first pod →
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                                {visiblePods.map((pod) => (
                                                    <div
                                                        key={pod.id}
                                                        onClick={() => navigate(`/pod/${pod.id}`)}
                                                        className="group p-5 rounded-2xl border border-background-border/50 bg-background/30 hover:bg-background-surface hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden h-[180px] flex flex-col justify-between"
                                                    >
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>

                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors truncate">{pod.name}</h3>
                                                                <div className="flex gap-1.5 shrink-0">
                                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{pod.role}</span>
                                                                    {pod.status === 'pending' && <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Invited</span>}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-text-secondary line-clamp-2">
                                                                Collaborative workspace for the {pod.name} project team.
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-between relative z-10 pt-4 border-t border-background-border/30 mt-auto">
                                                            <div className="flex items-center -space-x-2">
                                                                {[1, 2, 3].map((i) => (
                                                                    <div key={i} className={`w-7 h-7 rounded-full border-2 border-background-surface bg-gray-600 flex items-center justify-center text-[10px] text-white font-bold`}>
                                                                        {i === 3 ? '+2' : ''}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[11px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                                                                {pod.status === 'pending' ? 'Review Invite' : 'Open Pod'}
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                    <polyline points="12 5 19 12 12 19"></polyline>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination Dots */}
                                            {totalPodPages > 1 && (
                                                <div className="flex justify-center gap-2 mt-8">
                                                    {[...Array(totalPodPages)].map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => handlePodPageChange(i)}
                                                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentPodPage === i
                                                                ? 'bg-primary w-6'
                                                                : 'bg-background-border border border-background-border hover:bg-primary/50'
                                                                }`}
                                                            title={`Go to page ${i + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card">
                                <h2 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h2>
                                <div className="space-y-4">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors">
                                            <div className={`p-2 rounded-full ${activity.type === 'commit' ? 'bg-blue-500/10 text-blue-500' :
                                                activity.type === 'pr' ? 'bg-purple-500/10 text-purple-500' :
                                                    'bg-orange-500/10 text-orange-500'
                                                }`}>
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    {activity.type === 'commit' ? (
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                                    ) : activity.type === 'pr' ? (
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                    ) : (
                                                        <path d="M9 11l3 3L22 4" />
                                                    )}
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-text-primary">{activity.description}</p>
                                                <p className="text-xs text-text-secondary mt-0.5">{activity.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tasks */}
                        <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-text-primary">My Tasks</h2>
                                <button className="text-sm text-primary hover:text-primary-dark font-medium">View All</button>
                            </div>
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 border border-background-border/50 rounded-xl bg-background/30">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${task.status === 'in-progress' ? 'bg-blue-500' :
                                                task.status === 'done' ? 'bg-green-500' : 'bg-gray-400'
                                                }`} />
                                            <span className={`text-sm font-medium ${task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <div className="text-xs text-text-secondary">{task.dueDate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Pods & Skills */}
                    <div className="space-y-8">
                        {/* Skills/Tags Preview */}
                        <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card">
                            <h2 className="text-lg font-bold text-text-primary mb-4">My Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'].map(skill => (
                                    <span key={skill} className="px-3 py-1 rounded-full bg-background/50 border border-background-border text-xs font-medium text-text-secondary hover:border-primary/50 hover:text-primary transition-all cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Badges/Rewards Preview */}
                        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-text-primary mb-2">Next Milestone</h2>
                            <p className="text-sm text-text-secondary mb-4">You're 30 XP away from reaching Level 5!</p>
                            <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(88,166,154,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
