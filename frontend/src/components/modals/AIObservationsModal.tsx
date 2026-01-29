import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiMagnifyingGlass, HiStopCircle, HiExclamationTriangle, HiLightBulb, HiPlus, HiCheck } from 'react-icons/hi2';
import type { PMInsight } from '../../services/aiService';

interface AIObservationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    insights: PMInsight[];
    onAddTask: (title: string, description: string) => void;
}

const AIObservationsModal: React.FC<AIObservationsModalProps> = ({ isOpen, onClose, insights, onAddTask }) => {
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

    if (!insights) return null;

    const blockers = insights.filter(i => i.type === 'blocker');
    const warnings = insights.filter(i => i.type === 'warning');
    const suggestions = insights.filter(i => i.type === 'suggestion');

    const total = insights.length || 1;

    // Calculate chart segments
    const circleCircumference = 2 * Math.PI * 40; // r=40
    const blockerDash = (blockers.length / total) * circleCircumference;
    const warningDash = (warnings.length / total) * circleCircumference;
    const suggestionDash = (suggestions.length / total) * circleCircumference;

    const handleAdd = (insight: PMInsight, idx: number) => {
        onAddTask(
            `Fix: ${insight.message}`,
            `Generated from AI Observation (${insight.type}). Priority: ${insight.priority}`
        );
        setAddedItems(prev => new Set(prev).add(idx));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto z-[70] w-full max-w-5xl h-[85vh] bg-background-surface border border-background-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-background-border/50 flex items-center justify-between bg-background-surface/50 backdrop-blur-md">
                            <div className="flex items-center gap-3 text-primary">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <HiMagnifyingGlass className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">AI Manager Observations</h2>
                                    <p className="text-xs text-text-secondary">Real-time health check and risk analysis</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-background-border/50 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
                            >
                                <HiXMark className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8">

                            {/* Visual Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                {/* Chart Card */}
                                <div className="bg-background/50 border border-background-border rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[200px]">
                                    <h3 className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Health Distribution</h3>

                                    <div className="relative w-40 h-40">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            {/* Background Circle */}
                                            <circle cx="50" cy="50" r="40" fill="transparent" strokeDasharray={circleCircumference} strokeWidth="12" className="stroke-background-border/30" />

                                            {/* Suggestions (Cyan) */}
                                            <circle cx="50" cy="50" r="40" fill="transparent"
                                                strokeDasharray={`${suggestionDash} ${circleCircumference}`}
                                                strokeDashoffset="0"
                                                strokeWidth="12" className="stroke-cyan-500 transition-all duration-1000" />

                                            {/* Warnings (Orange) */}
                                            <circle cx="50" cy="50" r="40" fill="transparent"
                                                strokeDasharray={`${warningDash} ${circleCircumference}`}
                                                strokeDashoffset={-suggestionDash}
                                                strokeWidth="12" className="stroke-orange-500 transition-all duration-1000" />

                                            {/* Blockers (Red) */}
                                            <circle cx="50" cy="50" r="40" fill="transparent"
                                                strokeDasharray={`${blockerDash} ${circleCircumference}`}
                                                strokeDashoffset={-(suggestionDash + warningDash)}
                                                strokeWidth="12" className="stroke-red-500 transition-all duration-1000" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-text-primary">{insights.length}</span>
                                            <span className="text-[10px] uppercase text-text-secondary">Insights</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <span className="text-red-500 text-xs font-bold uppercase">Critical</span>
                                            <HiStopCircle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <span className="text-4xl font-bold text-text-primary">{blockers.length}</span>
                                            <p className="text-xs text-text-secondary mt-1">Blockers requiring immediate action.</p>
                                        </div>
                                    </div>
                                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <span className="text-orange-500 text-xs font-bold uppercase">Warnings</span>
                                            <HiExclamationTriangle className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <div>
                                            <span className="text-4xl font-bold text-text-primary">{warnings.length}</span>
                                            <p className="text-xs text-text-secondary mt-1">Potential risks to velocity.</p>
                                        </div>
                                    </div>
                                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 flex flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <span className="text-cyan-500 text-xs font-bold uppercase">Suggestions</span>
                                            <HiLightBulb className="w-6 h-6 text-cyan-500" />
                                        </div>
                                        <div>
                                            <span className="text-4xl font-bold text-text-primary">{suggestions.length}</span>
                                            <p className="text-xs text-text-secondary mt-1">Optimization opportunities.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed List */}
                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-6">Detailed Analysis</h3>
                            <div className="space-y-4">
                                {insights.map((insight, idx) => (
                                    <div key={idx} className={`p-5 rounded-2xl border flex gap-5 group transition-all hover:scale-[1.01] ${insight.type === 'blocker' ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' :
                                        insight.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10' :
                                            'bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/10'
                                        }`}>
                                        <div className="mt-1 flex-shrink-0">
                                            {insight.type === 'blocker' ? <HiStopCircle className="w-6 h-6 text-red-500" /> :
                                                insight.type === 'warning' ? <HiExclamationTriangle className="w-6 h-6 text-orange-500" /> :
                                                    <HiLightBulb className="w-6 h-6 text-cyan-500" />}
                                        </div>
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${insight.type === 'blocker' ? 'text-red-500' :
                                                        insight.type === 'warning' ? 'text-orange-500' :
                                                            'text-cyan-500'
                                                        }`}>
                                                        {insight.type}
                                                    </span>
                                                    {insight.priority === 'high' && (
                                                        <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">HIGH PRIORITY</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-primary font-medium leading-relaxed">{insight.message}</p>
                                            </div>

                                            <button
                                                onClick={() => handleAdd(insight, idx)}
                                                disabled={addedItems.has(idx)}
                                                className="shrink-0 flex items-center justify-center gap-2 text-xs font-bold bg-background-surface border border-background-border text-text-primary hover:bg-primary hover:text-white hover:border-primary px-4 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                                            >
                                                {addedItems.has(idx) ? (
                                                    <>
                                                        <HiCheck className="w-4 h-4" /> Actioned
                                                    </>
                                                ) : (
                                                    <>
                                                        <HiPlus className="w-4 h-4" /> Convert to Task
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AIObservationsModal;
