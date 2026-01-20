


const TIMELINE_STAGES = [
    {
        id: 1,
        title: 'Architecture & Schema Design',
        description: 'Defining data models and GraphQL interfaces',
        status: 'COMPLETED',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500',
        borderColor: 'border-cyan-500',
        tasks: [
            { name: 'Auth Implementation', status: 'done' },
            { name: 'DB Normalization', status: 'done' }
        ]
    },
    {
        id: 2,
        title: 'Core API Services',
        description: 'Rust-based backend implementation',
        status: 'IN PROGRESS',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-400',
        borderColor: 'border-cyan-400',
        tasks: [
            { name: 'Redis Cache Layer', status: 'progress', progress: 60 },
            { name: 'gRPC Endpoints', status: 'pending' }
        ]
    },
    {
        id: 3,
        title: 'Frontend Integration',
        description: 'Component library & state management',
        status: 'UPCOMING',
        color: 'text-text-secondary',
        bgColor: 'bg-text-secondary',
        borderColor: 'border-text-secondary',
        tasks: []
    }
];

const CHAT_MESSAGES = [
    {
        id: 1,
        sender: 'assistant',
        time: '10:42 AM',
        content: (
            <div>
                <p className="mb-2">I've analyzed the new repository structure. There's a potential bottleneck in your <code className="text-cyan-400">/services/worker.rs</code> implementation regarding concurrent connections.</p>
                <div className="bg-background-surface/50 rounded-lg p-3 border border-background-border font-mono text-xs text-text-secondary">
                    <p className="text-gray-500">// Recommended adjustment</p>
                    <p><span className="text-purple-400">pub async fn</span> <span className="text-blue-400">init_pool</span>() -{'>'} Pool{'<'}Postgres{'>'} {'{'}</p>
                    <p className="pl-4">PgPoolOptions::new().max_connections(50)...</p>
                    <p>{'}'}</p>
                </div>
            </div>
        )
    },
    {
        id: 2,
        sender: 'user',
        time: '10:45 AM',
        content: "Can you update the roadmap to include a 2-day testing sprint before the frontend integration?"
    }
];

const AIPlanningAssistant = () => {
    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pr-2">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-1">Strategic Roadmap</h1>
                        <p className="text-text-secondary text-sm">AI-generated path from concept to deployment. Optimized for React/Rust stack.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-background-surface border border-background-border rounded-lg px-4 py-2 text-center">
                            <div className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Duration</div>
                            <div className="text-lg font-bold text-white">4 Weeks</div>
                        </div>
                        <div className="bg-background-surface border border-background-border rounded-lg px-4 py-2 text-center">
                            <div className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">AI Confidence</div>
                            <div className="text-lg font-bold text-cyan-500">94%</div>
                        </div>
                        <div className="bg-background-surface border border-background-border rounded-lg px-4 py-2 text-center">
                            <div className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Efficiency</div>
                            <div className="text-lg font-bold text-red-400">+12%</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Timeline Column */}
                    <div className="flex-1 bg-background-surface border border-background-border rounded-2xl p-6 relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-text-primary font-bold">
                                <svg className="w-5 h-5 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="8" x2="12" y2="21"></line><line x1="8" y1="13" x2="16" y2="13"></line></svg>
                                <h3>Development Timeline</h3>
                            </div>
                            <button className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">
                                Regenerate Nodes
                            </button>
                        </div>

                        <div className="relative pl-4 space-y-12 before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-background-border">
                            {TIMELINE_STAGES.map((stage) => (
                                <div key={stage.id} className="relative pl-8">
                                    {/* Node Dot */}
                                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-background-surface ${stage.status === 'COMPLETED' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : stage.status === 'IN PROGRESS' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-background-border'}`}></div>

                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-text-primary text-lg">{stage.title}</h4>
                                            <p className="text-xs text-text-secondary">{stage.description}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${stage.status === 'COMPLETED' ? 'bg-cyan-500/10 text-cyan-500' :
                                            stage.status === 'IN PROGRESS' ? 'bg-cyan-500 text-background font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' :
                                                'bg-background-border/50 text-text-secondary'
                                            }`}>
                                            {stage.status}
                                        </span>
                                    </div>

                                    {stage.tasks.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            {stage.tasks.map((task, idx) => (
                                                <div key={idx} className="bg-background/30 border border-background-border rounded-xl p-3 flex items-center justify-between">
                                                    <span className="text-sm text-text-primary font-medium">{task.name}</span>
                                                    {task.status === 'done' && (
                                                        <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </div>
                                                    )}
                                                    {task.status === 'progress' && (
                                                        <div className="w-24 h-1.5 bg-background-border rounded-full overflow-hidden">
                                                            <div className="h-full bg-cyan-500" style={{ width: `${task.progress}%` }}></div>
                                                        </div>
                                                    )}
                                                    {task.status === 'pending' && <span className="text-xs text-text-secondary font-bold">Pending</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Action Column */}
                    <div className="w-80 flex flex-col gap-6">
                        {/* Generate AI Plan Card */}
                        <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-text-primary mb-2">Ready to evolve?</h3>
                                <p className="text-xs text-text-secondary mb-6">Let the AI scan your repository and optimize the next sprint backlog.</p>
                                <button className="w-full py-3 bg-text-primary text-background font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                    Generate AI Plan
                                </button>
                            </div>
                        </div>

                        {/* Team Allocation Card */}
                        <div className="bg-background-surface border border-background-border rounded-2xl p-6 flex-1">
                            <div className="flex items-center gap-2 mb-6">
                                <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                <h3 className="text-lg font-bold text-text-primary">Team Allocation</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-background/50 border border-background-border rounded-xl p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">LEAD BACKEND</span>
                                        <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white"></div>
                                        <div>
                                            <div className="font-bold text-sm text-text-primary">Alex Rivera</div>
                                            <div className="text-[10px] text-cyan-500">98% Match for Rust</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-background/50 border border-orange-500/30 rounded-xl p-3 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">DEVOPS ENGINEER</span>
                                        <span className="text-[9px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">GAP FOUND</span>
                                    </div>
                                    <div className="h-8 mb-2"></div>
                                    <button className="w-full py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-lg hover:bg-orange-500/20 transition-colors">
                                        AUTO-HIRE ON UPWORK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-80 bg-background-surface border border-background-border rounded-2xl flex flex-col shrink-0 overflow-hidden">
                <div className="p-4 border-b border-background-border flex justify-between items-center bg-background/50">
                    <div className="flex items-center gap-2 text-cyan-500 font-bold">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span>AI Consultant</span>
                    </div>
                    <button className="text-text-secondary hover:text-text-primary">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {CHAT_MESSAGES.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.sender === 'user' ? 'text-text-secondary' : 'text-cyan-500'}`}>
                                    {msg.sender === 'user' ? 'YOU' : 'ASSISTANT'}
                                </span>
                                <span className="text-[10px] text-text-secondary">{msg.time}</span>
                            </div>
                            <div className={`text-sm p-3 rounded-2xl max-w-[90%] leading-relaxed ${msg.sender === 'user'
                                ? 'bg-background-border/50 text-text-primary rounded-tr-sm'
                                : 'bg-background/50 border border-background-border text-text-primary rounded-tl-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-background/50 border-t border-background-border">
                    <div className="flex gap-2 mb-3">
                        <button className="text-[10px] font-bold px-2 py-1 rounded-full border border-background-border hover:bg-background-border/50 transition-colors text-text-secondary hover:text-text-primary">
                            Refine Schema
                        </button>
                        <button className="text-[10px] font-bold px-2 py-1 rounded-full border border-background-border hover:bg-background-border/50 transition-colors text-text-secondary hover:text-text-primary">
                            CI/CD Check
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ask AI to refine the plan..."
                            className="w-full bg-background border border-background-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-cyan-500/50 transition-all pr-10"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500 text-background rounded-lg hover:bg-cyan-400 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-text-secondary mt-2 text-center opacity-50">AI may hallucinate architectural patterns. Always verify critical paths.</p>
                </div>
            </div>
        </div>
    );
};

export default AIPlanningAssistant;
