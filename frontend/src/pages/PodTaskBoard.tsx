
import { useState } from 'react';

// Mock Data
const COLUMNS = {
    todo: {
        id: 'todo',
        title: 'To Do',
        count: 4,
        tasks: [
            {
                id: '1',
                tag: 'HIGH PRIORITY',
                tagColor: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
                title: 'Refactor WebSocket authentication logic',
                description: 'The current handshake protocol is vulnerable to replay attacks. Need to implement JWT rotation.',
                avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam'],
                comments: 3,
                date: null
            },
            {
                id: '2',
                tag: 'FEATURE',
                tagColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                title: 'Add Mermaid.js support to READMEs',
                description: 'Render diagrams directly from markdown in the repository viewer.',
                avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'],
                comments: 0,
                date: 'Oct 24'
            }
        ]
    },
    inProgress: {
        id: 'inProgress',
        title: 'In Progress',
        count: 2,
        tasks: [
            {
                id: '3',
                tag: 'ACTIVE',
                tagColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
                title: 'Setup AWS Lambda edge functions',
                description: 'Optimizing global latency for Phoenix API by moving auth to the edge.',
                avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'],
                meta: 'Merging',
                metaColor: 'text-cyan-500',
                metaIcon: <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
            },
            {
                id: '4',
                tag: 'REFACTOR',
                tagColor: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
                title: 'Clean up unused Tailwind classes',
                description: 'Reviewing the landing page for unused styles to reduce CSS bundle size.',
                avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Sam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'],
                meta: '3d left',
                metaColor: 'text-text-secondary',
                metaIcon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            }
        ]
    },
    completed: {
        id: 'completed',
        title: 'Completed',
        count: 12,
        tasks: [
            {
                id: '5',
                tag: 'SHIPPED',
                tagColor: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
                title: 'Database migration to PostgreSQL 16',
                description: 'Successfully upgraded the production environment without downtime.',
                avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'],
                isCompleted: true,
                meta: 'Merged 3h ago',
                metaColor: 'text-text-secondary'
            },
            {
                id: '6',
                tag: 'SHIPPED',
                tagColor: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
                title: 'Update branding to new logo set',
                description: '',
                avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'],
                isCompleted: true,
                meta: '',
                metaColor: ''
            }
        ]
    }
};

const PodTaskBoard = () => {
    const [activeTab, setActiveTab] = useState('All Tasks');

    return (
        <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className="mb-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                    <span>My Pods</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <span>Phoenix Engine</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <span className="text-text-primary">Task Board</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-1">Phoenix Engine Board</h1>
                        <p className="text-text-secondary text-sm">Collaborative real-time task management for the Core Team.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* View Filters */}
                        <div className="flex items-center bg-background-surface border border-background-border rounded-lg p-1">
                            <button className="p-2 hover:bg-background/50 rounded-md text-text-secondary hover:text-text-primary transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                            </button>
                            <button className="p-2 bg-background/50 rounded-md text-text-primary shadow-sm">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button className="p-2 hover:bg-background/50 rounded-md text-text-secondary hover:text-text-primary transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                            </button>
                        </div>

                        {/* AI Suggest Button */}
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(88,166,154,0.3)] hover:shadow-[0_0_20px_rgba(88,166,154,0.5)] transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                            Suggest Tasks with AI
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mt-8 border-b border-background-border">
                    {['All Tasks', 'Assigned to Me', 'High Priority', 'Backlog'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === tab
                                ? 'text-primary'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 min-w-full h-full pb-4">
                    {/* To Do Column */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-text-primary">To Do</h3>
                                <span className="bg-background-surface border border-background-border text-text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{COLUMNS.todo.count}</span>
                            </div>
                            <button className="text-text-secondary hover:text-text-primary">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                            </button>
                        </div>
                        {COLUMNS.todo.tasks.map(task => (
                            <div key={task.id} className="bg-background-surface border border-background-border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${task.tagColor}`}>{task.tag}</span>
                                    <button className="text-text-secondary/50 group-hover:text-text-secondary">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                    </button>
                                </div>
                                <h4 className="font-bold text-text-primary text-sm mb-2">{task.title}</h4>
                                <p className="text-xs text-text-secondary mb-4 line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {task.avatars.map((avatar, i) => (
                                            <img key={i} src={avatar} alt="User" className="w-6 h-6 rounded-full border-2 border-background-surface" />
                                        ))}
                                        {task.id === '1' && (
                                            <div className="w-6 h-6 rounded-full bg-background-border border-2 border-background-surface flex items-center justify-center text-[8px] text-text-secondary font-bold">+1</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                                        {task.date ? (
                                            <>
                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                <span>{task.date}</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                                <span>{task.comments}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-background-border rounded-xl text-text-secondary text-sm font-medium hover:text-text-primary hover:border-primary/50 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                            Add New Task
                        </button>
                    </div>

                    {/* In Progress Column */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-text-primary">In Progress</h3>
                                <span className="bg-background-surface border border-background-border text-text-secondary text-xs font-bold px-2 py-0.5 rounded-full text-cyan-500 bg-cyan-500/10">{COLUMNS.inProgress.count}</span>
                            </div>
                            <button className="text-text-secondary hover:text-text-primary">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                            </button>
                        </div>
                        {COLUMNS.inProgress.tasks.map(task => (
                            <div key={task.id} className="bg-background-surface border border-cyan-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-500/40 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${task.tagColor}`}>{task.tag}</span>
                                    <button className="text-text-secondary/50 group-hover:text-text-secondary">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                    </button>
                                </div>
                                <h4 className="font-bold text-text-primary text-sm mb-2">{task.title}</h4>
                                <p className="text-xs text-text-secondary mb-4 line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {task.avatars.map((avatar, i) => (
                                            <img key={i} src={avatar} alt="User" className="w-6 h-6 rounded-full border-2 border-background-surface" />
                                        ))}
                                    </div>
                                    {task.meta && (
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${task.metaColor}`}>
                                            {task.metaIcon}
                                            {task.meta}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Completed Column */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-text-primary">Completed</h3>
                                <span className="bg-background-surface border border-background-border text-text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{COLUMNS.completed.count}</span>
                            </div>
                            <button className="text-text-secondary hover:text-text-primary">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                            </button>
                        </div>
                        {COLUMNS.completed.tasks.map(task => (
                            <div key={task.id} className="bg-background-surface/50 border border-background-border rounded-xl p-4 opacity-75 hover:opacity-100 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${task.tagColor}`}>{task.tag}</span>
                                    <button className="text-text-secondary/50 group-hover:text-text-secondary">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </button>
                                </div>
                                <h4 className={`font-bold text-text-primary text-sm mb-2 ${task.isCompleted ? 'line-through text-text-secondary' : ''}`}>{task.title}</h4>
                                {task.description && <p className="text-xs text-text-secondary mb-4 line-clamp-2">{task.description}</p>}
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex -space-x-2">
                                        {task.avatars.map((avatar, i) => (
                                            <img key={i} src={avatar} alt="User" className="w-6 h-6 rounded-full border-2 border-background-surface grayscale" />
                                        ))}
                                    </div>
                                    {task.meta && (
                                        <div className={`flex items-center gap-1.5 text-xs ${task.metaColor}`}>
                                            {task.meta}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PodTaskBoard;
