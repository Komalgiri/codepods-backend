


// Mock Data
const ACTIVITY_LOGS = [
    {
        id: '1',
        message: 'feat: implement auth middleware for API routes',
        hash: 'a7c12d9',
        author: 'alex_dev',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        time: 'committed 2 hours ago',
        status: 'PASSED',
        statusColor: 'text-green-500 bg-green-500/10 border-green-500/20'
    },
    {
        id: '2',
        message: 'fix: resolve hydration mismatch on dashboard',
        hash: 'b4e22f1',
        author: 'sarah_codes',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        time: 'committed 5 hours ago',
        status: 'PASSED',
        statusColor: 'text-green-500 bg-green-500/10 border-green-500/20'
    },
    {
        id: '3',
        message: 'docs: update readme with setup instructions',
        hash: 'f9d1102',
        author: 'jordan_tech',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        time: 'committed yesterday',
        status: 'SKIPPED',
        statusColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
        id: '4',
        message: 'refactor: optimize database query performance',
        hash: 'cc4200a',
        author: 'alex_dev',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        time: 'committed 2 days ago',
        status: 'FAILED',
        statusColor: 'text-red-500 bg-red-500/10 border-red-500/20'
    }
];

const GitHubActivity = () => {
    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pr-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
                            <span>Pods</span>
                            <span>/</span>
                            <span>Project Alpha</span>
                            <span>/</span>
                            <span className="text-text-primary">GitHub Activity</span>
                        </div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">Project Activity</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary bg-background-surface border border-background-border px-2 py-1 rounded font-mono">
                                github.com/codepods/project-alpha
                            </span>
                            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Live on Vercel
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-background-surface border border-background-border rounded-lg text-sm font-bold text-text-primary hover:bg-background-border/20 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
                            Sync Now
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-background text-text-primary border border-background-border rounded-lg text-sm font-bold hover:bg-background-surface transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            View on GitHub
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Commits</span>
                            <svg className="w-5 h-5 text-background-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">1,284</span>
                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+12.4%</span>
                        </div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Contributors</span>
                            <svg className="w-5 h-5 text-background-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">12</span>
                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">+2</span>
                        </div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Open Pull Requests</span>
                            <svg className="w-5 h-5 text-background-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">5</span>
                            <span className="text-xs font-bold text-text-secondary bg-background-border/50 px-1.5 py-0.5 rounded">Stable</span>
                        </div>
                    </div>
                </div>

                {/* Chart Mock */}
                <div className="bg-background-surface border border-background-border rounded-2xl p-6 mb-8 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 font-bold text-text-primary">
                            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                            <h3>Weekly Activity Frequency</h3>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">7D REAL-TIME</span>
                    </div>

                    {/* SVG Chart */}
                    <div className="w-full h-48 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-text-secondary opacity-20">
                            <div className="border-b border-white w-full h-full"></div>
                        </div>

                        {/* The Path */}
                        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                            <path
                                d="M0,180 L100,160 L200,170 L300,140 L400,110 L500,130 L600,100 L700,90 L800,110 V200 H0 Z"
                                fill="url(#gradient)"
                                fillOpacity="0.2"
                            />
                            <path
                                d="M0,180 L100,160 L200,170 L300,140 L400,110 L500,130 L600,100 L700,90 L800,110"
                                fill="none"
                                stroke="#4ADE80"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase mt-4 px-2">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </div>

                {/* Latest Activity List */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-bold text-text-primary text-lg">Latest Repository Activity</h3>
                        <span className="text-xs text-text-secondary">(Showing 24 of 1,284)</span>
                    </div>

                    <div className="space-y-3">
                        {ACTIVITY_LOGS.map(log => (
                            <div key={log.id} className="bg-background-surface border border-background-border rounded-lg p-4 flex items-center justify-between hover:bg-background/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <img src={log.avatar} alt={log.author} className="w-10 h-10 rounded-full border border-background-border" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-text-primary">{log.message}</span>
                                            <span className="text-xs text-text-secondary bg-background-border/30 px-1.5 py-0.5 rounded font-mono border border-background-border/50">{log.hash}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                                            <span className="font-medium text-text-primary">{log.author}</span>
                                            <span>•</span>
                                            <span>{log.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${log.statusColor}`}>
                                        {log.status}
                                    </span>
                                    <button className="text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full text-center text-xs font-bold text-text-secondary hover:text-text-primary mt-6 flex items-center justify-center gap-1">
                        View all commits
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-72 flex flex-col gap-6 shrink-0">
                {/* Repo Stats */}
                <div className="bg-background-surface border border-background-border rounded-xl p-6">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">REPOSITORY STATS</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/50 border border-background-border rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-text-secondary mb-1">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                STARS
                            </div>
                            <div className="text-2xl font-bold text-white">2.4k</div>
                        </div>
                        <div className="bg-background/50 border border-background-border rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-text-secondary mb-1">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
                                FORKS
                            </div>
                            <div className="text-2xl font-bold text-white">182</div>
                        </div>
                    </div>
                </div>

                {/* Languages */}
                <div className="bg-background-surface border border-background-border rounded-xl p-6">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">LANGUAGES</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-bold text-text-primary">TypeScript</span>
                                <span className="text-text-secondary">74.9%</span>
                            </div>
                            <div className="h-1.5 bg-background-border rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[74.9%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-bold text-text-primary">Tailwind CSS</span>
                                <span className="text-text-secondary">18.5%</span>
                            </div>
                            <div className="h-1.5 bg-background-border rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 w-[18.5%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-bold text-text-primary">Other</span>
                                <span className="text-text-secondary">7.5%</span>
                            </div>
                            <div className="h-1.5 bg-background-border rounded-full overflow-hidden">
                                <div className="h-full bg-gray-500 w-[7.5%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integration Health */}
                <div className="bg-background-surface border border-background-border rounded-xl p-6">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">INTEGRATION HEALTH</h3>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-white">Webhook Active</span>
                        </div>
                        <p className="text-[10px] text-cyan-500/80 mb-4">Receiving events from GitHub</p>
                        <button className="w-full py-1.5 bg-background-surface border border-background-border hover:bg-background-border transition-colors text-xs font-bold text-cyan-500 rounded">
                            Test Payload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GitHubActivity;
