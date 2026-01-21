
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { aiService, type RoadmapStage } from '../services/aiService';

interface ChatMessage {
    id: number;
    sender: 'assistant' | 'user';
    time: string;
    content: string | JSX.Element;
}

const AIPlanningAssistant = () => {
    const { id: podId } = useParams<{ id: string }>();
    const [roadmap, setRoadmap] = useState<RoadmapStage[]>([]);
    const [teamAllocation, setTeamAllocation] = useState<any[]>([]);
    const [projectStage, setProjectStage] = useState<string>("Analyzing...");
    const [stats, setStats] = useState<{ confidence: number; duration: string; efficiency: string } | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            sender: 'assistant',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: "Hello! I'm your CodePods AI Consultant. I've analyzed your project and generated a roadmap. How can I help you optimize your development journey today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchPlan = async (isRegen = false) => {
        if (!podId) return;
        if (isRegen) setIsRegenerating(true);
        else setLoading(true);

        try {
            const response = await aiService.getPodPlan(podId);
            setRoadmap(response.roadmap);
            setTeamAllocation(response.members || []);
            setProjectStage(response.stage || "Development");
            setStats({
                confidence: response.confidence,
                duration: response.duration,
                efficiency: response.efficiency
            });

            if (isRegen) {
                const aiMsg: ChatMessage = {
                    id: Date.now(),
                    sender: 'assistant',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    content: "Roadmap has been recalculated based on your latest activity. I've re-allocated resources to optimize for the next sprint."
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.error("Failed to fetch AI plan", error);
        } finally {
            setLoading(false);
            setIsRegenerating(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, [podId]);

    const handleRegenerateNodes = () => {
        fetchPlan(true);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !podId || sending) return;

        const userMsg: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSending(true);

        try {
            const response = await aiService.chatWithAI(podId, input);
            const aiMsg: ChatMessage = {
                id: Date.now() + 1,
                sender: 'assistant',
                time: response.timestamp,
                content: response.reply
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Chat failed", error);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center text-text-secondary">AI is generating your roadmap...</div>;

    return (
        <div className="h-full flex gap-6 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pr-2">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
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
                        <div className="bg-background-surface border border-background-border rounded-lg px-4 py-2 text-center">
                            <div className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Duration</div>
                            <div className="text-lg font-bold text-white">{stats?.duration || '4 Weeks'}</div>
                        </div>
                        <div className="bg-background-surface border border-background-border rounded-lg px-4 py-2 text-center">
                            <div className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">AI Confidence</div>
                            <div className="text-lg font-bold text-cyan-500">{Math.round((stats?.confidence || 0) * 100)}%</div>
                        </div>
                        <div className="bg-background-surface border border-background-border rounded-lg px-4 py-2 text-center">
                            <div className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Efficiency</div>
                            <div className="text-lg font-bold text-red-400">{stats?.efficiency || '+12%'}</div>
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
                            <button
                                onClick={handleRegenerateNodes}
                                disabled={isRegenerating}
                                className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                            >
                                {isRegenerating ? 'Optimizing...' : 'Regenerate Nodes'}
                            </button>
                        </div>

                        <div className="relative pl-4 space-y-12 before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-background-border">
                            {roadmap.map((stage) => (
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

                                    {stage.tasks.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            {stage.tasks.map((task, idx) => (
                                                <div key={idx} className="bg-background/30 border border-background-border rounded-xl p-3 flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-text-primary font-medium">{task.name}</span>
                                                        {task.status === 'done' && (
                                                            <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {task.assignee && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <img
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`}
                                                                alt={task.assignee}
                                                                className="w-4 h-4 rounded-full bg-background-surface border border-background-border"
                                                            />
                                                            <span className="text-[10px] font-bold text-text-secondary">{task.assignee}</span>
                                                        </div>
                                                    )}

                                                    {task.status === 'progress' && (
                                                        <div className="w-full h-1 bg-background-border rounded-full overflow-hidden mt-1">
                                                            <div className="h-full bg-cyan-500" style={{ width: `${task.progress}%` }}></div>
                                                        </div>
                                                    )}
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
                        <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-text-primary mb-2">Ready to evolve?</h3>
                                <p className="text-xs text-text-secondary mb-6">Let the AI scan your repository and optimize the next sprint backlog.</p>
                                <button
                                    onClick={handleRegenerateNodes}
                                    disabled={isRegenerating}
                                    className="w-full py-3 bg-text-primary text-background font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    <svg className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                    {isRegenerating ? 'Analyzing...' : 'Generate AI Plan'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-background-surface border border-background-border rounded-2xl p-6 flex-1">
                            <div className="flex items-center gap-2 mb-6">
                                <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                <h3 className="text-lg font-bold text-text-primary">Team Allocation</h3>
                            </div>

                            <div className="space-y-4">
                                {teamAllocation.length > 0 ? teamAllocation.map((member) => (
                                    <div key={member.id} className="bg-background/50 border border-background-border rounded-xl p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{member.role}</span>
                                            <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
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
            </div>

            {/* Chat Sidebar */}
            <div className="w-80 bg-background-surface border border-background-border rounded-2xl flex flex-col shrink-0 overflow-hidden">
                <div className="p-4 border-b border-background-border flex justify-between items-center bg-background/50">
                    <div className="flex items-center gap-2 text-cyan-500 font-bold">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span>AI Consultant</span>
                    </div>
                </div>

                <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {messages.map((msg) => (
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
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-background/50 border-t border-background-border">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask AI to refine the plan..."
                            disabled={sending}
                            className="w-full bg-background border border-background-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-cyan-500/50 transition-all pr-10"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500 text-background rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
                        >
                            {sending ? (
                                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIPlanningAssistant;
