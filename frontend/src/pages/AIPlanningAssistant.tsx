import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { aiService, type RoadmapStage } from '../services/aiService';
import { podService } from '../services/podService';
import {
    HiOutlineClock,
    HiOutlineBolt,
    HiOutlineCpuChip,
    HiOutlineQueueList,
    HiCheckCircle,
    HiExclamationCircle,
    HiPlus,
    HiCheck,
    HiOutlineLightBulb,
    HiOutlineUsers,
    HiMagnifyingGlass,
    HiOutlineCubeTransparent,
    HiArrowRight
} from 'react-icons/hi2';
import { FaCrown, FaBrain } from 'react-icons/fa6';
import ProjectMemoryModal from '../components/modals/ProjectMemoryModal';
import AIObservationsModal from '../components/modals/AIObservationsModal';

const AIPlanningAssistant = () => {
    const { id: podId } = useParams<{ id: string }>();
    const [roadmap, setRoadmap] = useState<RoadmapStage[]>([]);
    const [teamAllocation, setTeamAllocation] = useState<any[]>([]);
    const [projectStage, setProjectStage] = useState<string>("Analyzing...");
    const [stats, setStats] = useState<{ confidence: number; duration: string; efficiency: string } | null>(null);
    const [brain, setBrain] = useState<any>(null);
    const [pmInsights, setPmInsights] = useState<any[]>([]);
    const [meta, setMeta] = useState<{ cached: boolean; daysSinceGeneration: number; daysUntilRegeneration: number } | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syncedTasks, setSyncedTasks] = useState<Set<string>>(new Set());
    const [syncingTaskId, setSyncingTaskId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [lastRegenTime, setLastRegenTime] = useState<number>(0);

    // Modal States
    const [isMemoryOpen, setIsMemoryOpen] = useState(false);
    const [isObservationsOpen, setIsObservationsOpen] = useState(false);

    const fetchPlan = async (isRegen = false) => {
        if (!podId) return;
        if (isRegen) setIsRegenerating(true);
        else setLoading(true);

        try {
            // Check localStorage cache first (1 hour TTL)
            const CACHE_KEY = `roadmap_${podId}`;
            const CACHE_TTL = 60 * 60 * 1000; // 1 hour

            if (!isRegen) {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    const isValid = Date.now() - timestamp < CACHE_TTL;

                    if (isValid) {
                        console.log('[Cache] Using cached roadmap');
                        setRoadmap(data.roadmap);
                        setTeamAllocation(data.members || []);
                        setProjectStage(data.stage || "Development");
                        setStats({
                            confidence: data.confidence,
                            duration: data.duration,
                            efficiency: data.efficiency
                        });
                        setMeta(data.meta || null);
                        setBrain(data.projectBrain || null);
                        setPmInsights(data.pmInsights || []);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Fetch fresh data
            const response = await aiService.getPodPlan(podId, isRegen);

            // Cache the response
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: response,
                timestamp: Date.now()
            }));

            setRoadmap(response.roadmap || []);
            setTeamAllocation(response.members || []);
            setProjectStage(response.stage || "Development");
            setStats({
                confidence: response.confidence || 0,
                duration: response.duration || 'Unknown',
                efficiency: response.efficiency || '0%'
            });
            setMeta(response.meta || null);
            setBrain(response.projectBrain || null);
            setPmInsights(response.pmInsights || []);

        } catch (error) {
            console.error("Failed to fetch AI plan", error);
            setToast({ message: (error as any).message || 'Failed to load roadmap. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
            setIsRegenerating(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, [podId]);

    const handleRegenerateNodes = () => {
        const now = Date.now();
        const COOLDOWN = 5000; // 5 seconds

        if (now - lastRegenTime < COOLDOWN) {
            const remaining = Math.ceil((COOLDOWN - (now - lastRegenTime)) / 1000);
            setToast({ message: `Please wait ${remaining}s before regenerating again.`, type: 'error' });
            setTimeout(() => setToast(null), 2000);
            return;
        }

        setLastRegenTime(now);
        fetchPlan(true);
    };

    const handleAddRoadmapTask = async (stageId: number, task: any) => {
        if (!podId) return;
        const taskKey = `${stageId}-${task.name}`;
        setSyncingTaskId(taskKey);

        try {
            await podService.createTask(podId, {
                title: task.name,
                description: `Part of AI Roadmap Phase: ${roadmap.find(r => r.id === stageId)?.title}`,
                assignedTo: task.assigneeId
            });
            setSyncedTasks(prev => new Set(prev).add(taskKey));
            setToast({ message: `"${task.name}" added to Task Board!`, type: 'success' });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error("Failed to sync task", error);
            setToast({ message: 'Failed to add task. Please try again.', type: 'error' });
            setTimeout(() => setToast(null), 4000);
        } finally {
            setSyncingTaskId(null);
        }
    };

    const handleGeneralAddTask = async (title: string, description: string) => {
        if (!podId) return;
        try {
            await podService.createTask(podId, {
                title: title,
                description: description
            });
            setToast({ message: `Task "${title}" created!`, type: 'success' });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            setToast({ message: 'Failed to create task.', type: 'error' });
        }
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-text-secondary animate-in fade-in duration-700">
            <FaBrain className="w-12 h-12 text-primary animate-pulse" />
            <span className="font-bold tracking-wider text-sm">AI MANAGER IS ANALYZING YOUR POD...</span>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === 'success'
                    ? 'bg-green-500/90 border-green-400/50 text-white'
                    : 'bg-red-500/90 border-red-400/50 text-white'
                    }`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? (
                            <HiCheckCircle className="w-6 h-6 flex-shrink-0" />
                        ) : (
                            <HiExclamationCircle className="w-6 h-6 flex-shrink-0" />
                        )}
                        <span className="font-bold text-sm">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4 shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-text-primary">Strategic Roadmap</h1>
                        <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest leading-none mt-1">
                            {projectStage}
                        </span>
                    </div>
                    <p className="text-text-secondary text-sm">AI-generated path from concept to deployment. Optimized for your stack.</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-background-surface/50 border border-background-border rounded-xl px-4 py-2 text-center group hover:border-primary/50 transition-all">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-text-secondary tracking-wider mb-0.5">
                            <HiOutlineClock className="w-3 h-3" />
                            Duration
                        </div>
                        <div className="text-lg font-bold text-white">{stats?.duration || '4 Weeks'}</div>
                    </div>
                    <div className="bg-background-surface/50 border border-background-border rounded-xl px-4 py-2 text-center group hover:border-cyan-500/50 transition-all">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-text-secondary tracking-wider mb-0.5">
                            <HiOutlineLightBulb className="w-3 h-3 text-cyan-500" />
                            AI Confidence
                        </div>
                        <div className="text-lg font-bold text-cyan-500">{Math.round((stats?.confidence || 0) * 100)}%</div>
                    </div>
                    <div className="bg-background-surface/50 border border-background-border rounded-xl px-4 py-2 text-center group hover:border-red-400/50 transition-all">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-text-secondary tracking-wider mb-0.5">
                            <HiOutlineBolt className="w-3 h-3 text-red-400" />
                            Efficiency
                        </div>
                        <div className="text-lg font-bold text-red-400">{stats?.efficiency || '+12%'}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Timeline Column */}
                <div className="flex-1 bg-background-surface/40 backdrop-blur-sm border border-background-border rounded-2xl p-6 relative overflow-y-auto">
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-background-surface/90 backdrop-blur-md z-10 py-3 -mx-6 px-6 border-b border-background-border/50">
                        <div className="flex items-center gap-2 text-text-primary font-bold">
                            <HiOutlineQueueList className="w-5 h-5 text-cyan-500" />
                            <h3>Development Timeline</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {meta && meta.daysUntilRegeneration > 0 && (
                                <span className="text-[10px] font-bold text-text-secondary bg-background-border/50 px-2 py-1 rounded">
                                    Refreshes in {meta.daysUntilRegeneration} days
                                </span>
                            )}
                            <button
                                onClick={handleRegenerateNodes}
                                disabled={isRegenerating}
                                className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                            >
                                {isRegenerating ? 'Optimizing...' : 'Regenerate Nodes'}
                            </button>
                        </div>
                    </div>

                    <div className="relative pl-4 space-y-12 before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-background-border">
                        {roadmap && Array.isArray(roadmap) && roadmap.map((stage) => (
                            <div key={stage.id} className="relative pl-8">
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

                                {stage.tasks && stage.tasks.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {stage.tasks.map((task, idx) => {
                                            const taskKey = `${stage.id}-${task.name}`;
                                            const isSynced = syncedTasks.has(taskKey);
                                            const isSyncing = syncingTaskId === taskKey;

                                            return (
                                                <div key={idx} className={`bg-background/30 border border-background-border rounded-xl p-3 flex flex-col gap-2 transition-all ${isSynced ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-text-primary font-medium">{task.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            {task.status === 'done' && (
                                                                <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                                                    <HiCheck className="w-3 h-3 stroke-[3]" />
                                                                </div>
                                                            )}
                                                            {!isSynced ? (
                                                                <button
                                                                    onClick={() => handleAddRoadmapTask(stage.id, task)}
                                                                    disabled={isSyncing}
                                                                    className="w-6 h-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
                                                                    title="Add to Task Board"
                                                                >
                                                                    {isSyncing ? (
                                                                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <HiPlus className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <div className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold rounded border border-green-500/20 uppercase tracking-tighter">
                                                                    Added
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {(task.assignee || (task as any).assigneeId) && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="relative">
                                                                <img
                                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee || (task as any).assigneeId}`}
                                                                    alt={task.assignee}
                                                                    className="w-4 h-4 rounded-full bg-background-surface border border-background-border"
                                                                />
                                                                <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full border border-background"></div>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-text-secondary">{task.assignee || 'Member'}</span>
                                                        </div>
                                                    )}

                                                    {task.status === 'progress' && (
                                                        <div className="w-full h-1 bg-background-border rounded-full overflow-hidden mt-1">
                                                            <div className="h-full bg-cyan-500" style={{ width: `${task.progress}%` }}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Action Column */}
                <div className="w-80 flex flex-col gap-6 shrink-0">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-text-primary mb-2">Sprint Optimization</h3>
                            <p className="text-xs text-text-secondary mb-6">Let the AI scan your repository and optimize the next sprint backlog.</p>
                            <button
                                onClick={handleRegenerateNodes}
                                disabled={isRegenerating}
                                className="w-full py-3 bg-text-primary text-background font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <HiOutlineBolt className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                                {isRegenerating ? 'Analyzing...' : 'Generate AI Plan'}
                            </button>
                        </div>
                    </div>

                    {brain && (
                        <div
                            onClick={() => setIsMemoryOpen(true)}
                            className="group cursor-pointer bg-background-surface border border-background-border hover:border-ai-start/50 rounded-2xl p-6 transition-all transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-ai-start">
                                    <HiOutlineCpuChip className="w-6 h-6" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Project Memory</h3>
                                </div>
                                <HiArrowRight className="w-4 h-4 text-text-secondary -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-3 mb-3">
                                {brain.summary}
                            </p>
                            <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                                <span className="px-2 py-1 bg-background rounded-lg border border-background-border">{brain.decisions?.length || 0} Decision Nodes</span>
                            </div>
                        </div>
                    )}

                    {/* AI Manager Observations */}
                    <div
                        onClick={() => setIsObservationsOpen(true)}
                        className="group cursor-pointer bg-background-surface border border-background-border hover:border-primary/50 rounded-2xl p-6 transition-all transform hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-primary">
                                <HiMagnifyingGlass className="w-6 h-6" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">AI Observations</h3>
                            </div>
                            <HiArrowRight className="w-4 h-4 text-text-secondary -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                        </div>

                        <div className="flex gap-3 mb-2">
                            <div className="flex-1 bg-red-500/10 rounded-lg p-2 text-center border border-red-500/10">
                                <div className="text-lg font-bold text-red-500 leading-none">{pmInsights.filter(i => i.type === 'blocker').length}</div>
                                <div className="text-[9px] font-bold text-red-500 uppercase mt-1">Blockers</div>
                            </div>
                            <div className="flex-1 bg-orange-500/10 rounded-lg p-2 text-center border border-orange-500/10">
                                <div className="text-lg font-bold text-orange-500 leading-none">{pmInsights.filter(i => i.type === 'warning').length}</div>
                                <div className="text-[9px] font-bold text-orange-500 uppercase mt-1">Risks</div>
                            </div>
                            <div className="flex-1 bg-cyan-500/10 rounded-lg p-2 text-center border border-cyan-500/10">
                                <div className="text-lg font-bold text-cyan-500 leading-none">{pmInsights.filter(i => i.type === 'suggestion').length}</div>
                                <div className="text-[9px] font-bold text-cyan-500 uppercase mt-1">Tips</div>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-text-secondary">Click to view detailed analysis graph</p>
                    </div>

                    <div className="bg-background-surface border border-background-border rounded-2xl p-6 flex-1 overflow-y-auto group hover:border-orange-400/30 transition-all">
                        <div className="flex items-center gap-2 mb-6 sticky top-0 bg-background-surface py-1 border-b border-background-border/30 -mx-6 px-6">
                            <HiOutlineUsers className="w-5 h-5 text-orange-400" />
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Team Allocation</h3>
                        </div>

                        <div className="space-y-4">
                            {teamAllocation && teamAllocation.length > 0 ? teamAllocation.map((member) => (
                                <div key={member.id} className="bg-background/50 border border-background-border rounded-xl p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate max-w-[140px]" title={member.role}>{member.role}</span>
                                            {member.role.toLowerCase().includes('lead') && <FaCrown className="w-2.5 h-2.5 text-yellow-500 mb-0.5" />}
                                        </div>
                                        <HiOutlineCubeTransparent className="w-4 h-4 text-cyan-500 shrink-0 opacity-70 group-hover:rotate-90 transition-transform duration-500" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} className="w-8 h-8 rounded-full border border-background-border bg-background-surface" />
                                        <div>
                                            <div className="font-bold text-sm text-text-primary">{member.name}</div>
                                            <div className="text-[10px] text-cyan-500">{member.match}% AI Match</div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-xs text-text-secondary italic">
                                    No members found for allocation.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ProjectMemoryModal
                isOpen={isMemoryOpen}
                onClose={() => setIsMemoryOpen(false)}
                brain={brain}
                onAddTask={handleGeneralAddTask}
            />

            <AIObservationsModal
                isOpen={isObservationsOpen}
                onClose={() => setIsObservationsOpen(false)}
                insights={pmInsights}
                onAddTask={handleGeneralAddTask}
            />
        </div>
    );
};

export default AIPlanningAssistant;
