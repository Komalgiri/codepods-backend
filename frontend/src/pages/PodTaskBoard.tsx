
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { podService, type Task } from '../services/podService';
import { aiService, type TaskSuggestion } from '../services/aiService';

// Type definition for task categories
type ColumnType = 'todo' | 'inProgress' | 'completed';

interface TaskColumn {
    id: ColumnType;
    title: string;
    count: number;
    tasks: any[];
}

const PodTaskBoard = () => {
    const { id: podId } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('All Tasks');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiSuggestions, setAiSuggestions] = useState<TaskSuggestion[]>([]);
    const [isAILoading, setIsAILoading] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [podId]);

    const fetchTasks = async () => {
        if (!podId) return;
        setLoading(true);
        try {
            const response = await podService.getPodTasks(podId);
            setTasks(response.tasks);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestAI = async () => {
        if (!podId) return;
        setIsAILoading(true);
        try {
            const response = await aiService.suggestTasks(podId);
            setAiSuggestions(response.suggestions);
        } catch (error) {
            console.error("AI connection failed", error);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleAddAISuggestion = async (suggestion: TaskSuggestion) => {
        if (!podId) return;
        try {
            await podService.createTask(podId, {
                title: suggestion.title,
                description: suggestion.description
            });
            // Remove from suggestions and refresh tasks
            setAiSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
            fetchTasks();
        } catch (error) {
            console.error("Failed to add AI task", error);
        }
    };

    // Group tasks by status
    const getColumnTasks = (status: string) => {
        return tasks.filter(t => {
            if (status === 'todo') return t.status === 'pending';
            if (status === 'inProgress') return t.status === 'in-progress';
            if (status === 'completed') return t.status === 'done';
            return false;
        }).map(task => ({
            id: task.id,
            tag: task.status === 'done' ? 'SHIPPED' : (task.status === 'in-progress' ? 'ACTIVE' : 'TASK'),
            tagColor: task.status === 'done'
                ? 'text-gray-500 bg-gray-500/10 border-gray-500/20'
                : (task.status === 'in-progress'
                    ? 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
                    : 'text-orange-500 bg-orange-500/10 border-orange-500/20'),
            title: task.title,
            description: (task as any).description || '',
            avatars: task.user ? [`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.user.name}`] : [],
            comments: 0,
            date: new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            isCompleted: task.status === 'done',
            meta: task.status === 'done' ? 'Merged' : null,
            metaColor: 'text-text-secondary'
        }));
    };

    const columns: Record<ColumnType, TaskColumn> = {
        todo: {
            id: 'todo',
            title: 'To Do',
            count: getColumnTasks('todo').length,
            tasks: getColumnTasks('todo')
        },
        inProgress: {
            id: 'inProgress',
            title: 'In Progress',
            count: getColumnTasks('inProgress').length,
            tasks: getColumnTasks('inProgress')
        },
        completed: {
            id: 'completed',
            title: 'Completed',
            count: getColumnTasks('completed').length,
            tasks: getColumnTasks('completed')
        }
    };

    if (loading && tasks.length === 0) {
        return <div className="h-full flex items-center justify-center text-text-secondary">Loading tasks...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className="mb-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                    <span>My Pods</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <span>Projects</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <span className="text-text-primary">Task Board</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-1">Project Board</h1>
                        <p className="text-text-secondary text-sm">Collaborative real-time task management for the Core Team.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* AI Suggest Button */}
                        <button
                            onClick={handleSuggestAI}
                            disabled={isAILoading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(88,166,154,0.3)] hover:shadow-[0_0_20px_rgba(88,166,154,0.5)] transition-all disabled:opacity-50"
                        >
                            {isAILoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                            )}
                            Suggest Tasks with AI
                        </button>
                    </div>
                </div>

                {/* AI Suggestions Row */}
                {aiSuggestions.length > 0 && (
                    <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/20 rounded-lg">
                                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                                </div>
                                <h3 className="font-bold text-text-primary">AI Strategy Suggestions</h3>
                            </div>
                            <button onClick={() => setAiSuggestions([])} className="text-text-secondary hover:text-text-primary">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {aiSuggestions.map((suggestion, i) => (
                                <div key={i} className="bg-background-surface/50 border border-background-border rounded-xl p-4 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${suggestion.priority === 'high' ? 'text-red-400 border-red-400/20 bg-red-400/10' : 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10'
                                            }`}>
                                            {suggestion.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-text-primary mb-1">{suggestion.title}</h4>
                                    <p className="text-xs text-text-secondary mb-4 flex-1">{suggestion.description}</p>
                                    <button
                                        onClick={() => handleAddAISuggestion(suggestion)}
                                        className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Add to Board
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                                <span className="bg-background-surface border border-background-border text-text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{columns.todo.count}</span>
                            </div>
                        </div>
                        {columns.todo.tasks.map(task => (
                            <div key={task.id} className="bg-background-surface border border-background-border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${task.tagColor}`}>{task.tag}</span>
                                </div>
                                <h4 className="font-bold text-text-primary text-sm mb-2">{task.title}</h4>
                                <p className="text-xs text-text-secondary mb-4 line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {task.avatars.map((avatar: string, i: number) => (
                                            <img key={i} src={avatar} alt="User" className="w-6 h-6 rounded-full border-2 border-background-surface" />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        <span>{task.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* In Progress Column */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-text-primary">In Progress</h3>
                                <span className="text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full text-xs font-bold">{columns.inProgress.count}</span>
                            </div>
                        </div>
                        {columns.inProgress.tasks.map(task => (
                            <div key={task.id} className="bg-background-surface border border-cyan-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-500/40 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${task.tagColor}`}>{task.tag}</span>
                                </div>
                                <h4 className="font-bold text-text-primary text-sm mb-2">{task.title}</h4>
                                <p className="text-xs text-text-secondary mb-4 line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {task.avatars.map((avatar: string, i: number) => (
                                            <img key={i} src={avatar} alt="User" className="w-6 h-6 rounded-full border-2 border-background-surface" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Completed Column */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-text-primary">Completed</h3>
                                <span className="bg-background-surface border border-background-border text-text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{columns.completed.count}</span>
                            </div>
                        </div>
                        {columns.completed.tasks.map(task => (
                            <div key={task.id} className="bg-background-surface/50 border border-background-border rounded-xl p-4 opacity-75 hover:opacity-100 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${task.tagColor}`}>{task.tag}</span>
                                </div>
                                <h4 className={`font-bold text-text-primary text-sm mb-2 ${task.isCompleted ? 'line-through text-text-secondary' : ''}`}>{task.title}</h4>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex -space-x-2">
                                        {task.avatars.map((avatar: string, i: number) => (
                                            <img key={i} src={avatar} alt="User" className="w-6 h-6 rounded-full border-2 border-background-surface grayscale" />
                                        ))}
                                    </div>
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
