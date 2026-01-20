
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mock Data for the Overview
const MOCK_STATS = {
    commits: { value: '1,240', trend: '+12%', trendUp: true },
    prs: { value: '12', trend: '+2%', trendUp: true },
    uptime: { value: '99.9', unit: '%', trend: '', trendUp: true },
    health: 68
};

const MOCK_CONTRIBUTORS = [
    { id: '1', name: 'Alex Rivera', role: 'Lead Architect', type: 'OWNER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: '2', name: 'Sam Chen', role: 'Backend Developer', type: 'MEMBER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
    { id: '3', name: 'Jordan Smith', role: 'DevOps Engineer', type: 'MEMBER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
];

const PodOverview = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Keep for future use when fetching real data
    console.log("Current Pod ID:", id); // Suppress unused var warning
    const [activeTab, setActiveTab] = useState('Overview');

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary selection:text-white">
            {/* Navbar (simplified for this view) */}
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
                        <div className="bg-background-surface/50 px-3 py-1.5 rounded-lg border border-background-border flex items-center gap-2 w-64">
                            <svg className="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" placeholder="Search pods..." className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-secondary" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-text-primary">Project Nebula-X</h1>
                            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full border border-primary/20">ACTIVE</span>
                        </div>
                        <p className="text-text-secondary">Building a decentralized indexing protocol for real-time blockchain telemetry.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-background-surface border border-background-border rounded-lg text-sm font-medium hover:bg-background-border/20 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            Deployment
                        </button>
                        <button className="p-2 bg-background-surface border border-background-border rounded-lg hover:bg-background-border/20 transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-background-border mb-8">
                    <div className="flex gap-8">
                        {['Overview', 'Tasks', 'Team', 'GitHub', 'AI Assistant'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab
                                    ? 'text-primary'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(88,166,154,0.5)]"></div>
                                )}
                                {tab === 'Overview' ? <span className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>{tab}</span> : tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Commits */}
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Commits</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{MOCK_STATS.commits.value}</span>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{MOCK_STATS.commits.trend}</span>
                        </div>
                        <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[70%] rounded-full shadow-[0_0_10px_rgba(88,166,154,0.5)]"></div>
                        </div>
                    </div>

                    {/* Pull Requests */}
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pull Requests</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{MOCK_STATS.prs.value}</span>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{MOCK_STATS.prs.trend}</span>
                        </div>
                        <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[20%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </div>
                    </div>

                    {/* Uptime */}
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Uptime</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">{MOCK_STATS.uptime.value}</span>
                            <span className="text-lg text-text-secondary font-medium">{MOCK_STATS.uptime.unit}</span>
                        </div>
                        <div className="w-full bg-background-border/30 h-1 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[99%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Project Brief */}
                    <div className="lg:col-span-2 bg-background-surface border border-background-border rounded-2xl p-6 shadow-card">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            <h2 className="text-lg font-bold text-text-primary">Project Brief</h2>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed mb-6">
                            Nebula-X is designed to solve the data availability problem for cross-chain analytics. By implementing a sharded indexing strategy, we can achieve sub-second latency for complex telemetry queries across 15+ EVM-compatible networks.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-background/30 border border-background-border rounded-lg p-3">
                                <div className="text-xs font-bold text-text-secondary mb-1">INFRASTRUCTURE</div>
                                <div className="text-sm font-medium text-text-primary">Rust, gRPC, PostgreSQL</div>
                            </div>
                            <div className="bg-background/30 border border-background-border rounded-lg p-3">
                                <div className="text-xs font-bold text-text-secondary mb-1">TARGET LAUNCH</div>
                                <div className="text-sm font-medium text-text-primary">Q4 2024</div>
                            </div>
                        </div>
                    </div>

                    {/* Pod Health */}
                    <div className="bg-background-surface border border-background-border rounded-2xl p-6 shadow-card flex flex-col items-center justify-center relative">
                        <h2 className="text-sm font-bold text-text-primary mb-6">Pod Health</h2>
                        {/* Simple Circular Progress Mock */}
                        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="8" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#58A69A" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="80" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white">68%</span>
                                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">COMPLETED</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-text-secondary">Architecture</span>
                                <span className="font-bold text-primary">100%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-text-secondary">Development</span>
                                <span className="font-bold text-primary">62%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-text-secondary">Security Audit</span>
                                <span className="font-bold text-primary">15%</span>
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
                        {MOCK_CONTRIBUTORS.map(contributor => (
                            <div key={contributor.id} className="bg-background/30 border border-background-border rounded-xl p-4 flex items-center gap-4 hover:bg-background/50 transition-colors cursor-pointer">
                                <img src={contributor.avatar} alt={contributor.name} className="w-10 h-10 rounded-full bg-background-surface" />
                                <div>
                                    <h3 className="text-sm font-bold text-text-primary">{contributor.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-text-secondary">{contributor.role}</p>
                                        <span className={`text-[10px] font-bold px-1.5 rounded ${contributor.type === 'OWNER' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {contributor.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PodOverview;
