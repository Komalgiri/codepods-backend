import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiOutlineCpuChip, HiCheck, HiPlus } from 'react-icons/hi2';

interface ProjectBrain {
    summary: string;
    decisions: string[];
    milestones: string[];
    techStackAdjustments: string;
}

interface ProjectMemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    brain: ProjectBrain | null;
    onAddTask: (title: string, description: string) => void;
}

const ProjectMemoryModal: React.FC<ProjectMemoryModalProps> = ({ isOpen, onClose, brain, onAddTask }) => {
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

    if (!brain) return null;

    const handleAdd = (item: string, type: 'decision' | 'milestone') => {
        onAddTask(
            type === 'decision' ? `Research: ${item}` : `Milestone: ${item}`,
            `Added from Project Memory (${type})`
        );
        setAddedItems(prev => new Set(prev).add(item));
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
                        className="fixed inset-0 m-auto z-[70] w-full max-w-4xl h-[85vh] bg-background-surface border border-background-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-background-border/50 flex items-center justify-between bg-background-surface/50 backdrop-blur-md">
                            <div className="flex items-center gap-3 text-ai-start">
                                <div className="p-2 bg-ai-start/10 rounded-lg">
                                    <HiOutlineCpuChip className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-primary">Project Neural Memory</h2>
                                    <p className="text-xs text-text-secondary">Strategic context and long-term decision tracking</p>
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
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left Col: Summary & Visuals */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Strategic Summary</h3>
                                    <div className="p-6 bg-background/50 rounded-2xl border border-background-border/50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <HiOutlineCpuChip className="w-32 h-32" />
                                        </div>
                                        <p className="text-sm text-text-primary leading-loose italic relative z-10">
                                            "{brain.summary}"
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Tech Stack Evolution</h3>
                                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
                                        <div className="flex items-start gap-4">
                                            <div className="w-2 h-full bg-indigo-500/20 rounded-full" />
                                            <div>
                                                <h4 className="font-bold text-indigo-400 mb-2">Adjustments & Shifts</h4>
                                                <p className="text-sm text-text-primary">{brain.techStackAdjustments || "No major architectural shifts recorded yet."}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Col: Interactive Lists */}
                            <div className="space-y-8">
                                {/* Decisions Timeline */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Key Decisions</h3>
                                        <span className="text-[10px] bg-background-border px-2 py-1 rounded-full text-text-secondary">{brain.decisions.length} Records</span>
                                    </div>

                                    <div className="space-y-3">
                                        {brain.decisions.map((decision, idx) => (
                                            <div key={idx} className="group flex gap-4 p-4 rounded-xl bg-background-surface border border-background-border hover:border-ai-start/50 transition-all">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-ai-start shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                                    <div className="w-0.5 flex-1 bg-gradient-to-b from-ai-start/50 to-transparent my-1" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-text-primary mb-2">{decision}</p>
                                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleAdd(decision, 'decision')}
                                                            disabled={addedItems.has(decision)}
                                                            className="flex items-center gap-1.5 text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {addedItems.has(decision) ? (
                                                                <>
                                                                    <HiCheck className="w-3 h-3" /> Added
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <HiPlus className="w-3 h-3" /> Add Research Task
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {brain.decisions.length === 0 && (
                                            <div className="text-center py-8 text-text-secondary text-sm italic border border-dashed border-background-border rounded-xl">
                                                No key decisions recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Milestones */}
                                <section>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">Milestones Reached</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {brain.milestones.map((milestone, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                                        <HiCheck className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-sm text-text-primary">{milestone}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {brain.milestones.length === 0 && (
                                            <div className="text-center py-8 text-text-secondary text-sm italic border border-dashed border-background-border rounded-xl">
                                                No milestones achieved yet.
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProjectMemoryModal;
