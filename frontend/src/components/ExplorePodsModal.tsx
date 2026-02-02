
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { podService, type Pod } from '../services/podService';
import { HiOutlineUserGroup, HiXMark } from 'react-icons/hi2';

interface ExplorePodsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExplorePodsModal = ({ isOpen, onClose }: ExplorePodsModalProps) => {
    const [pods, setPods] = useState<(Pod & { memberCount: number; userStatus: string | null })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [requestingPodId, setRequestingPodId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchPods();
        }
    }, [isOpen]);

    const fetchPods = async () => {
        try {
            setIsLoading(true);
            const res = await podService.getAllPods();
            setPods(res.pods);
        } catch (error) {
            console.error("Failed to fetch pods", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestJoin = async (podId: string) => {
        if (!podId) return;
        setRequestingPodId(podId);
        try {
            await podService.requestToJoin(podId);
            setPods(prev => prev.map(p =>
                p.id === podId ? { ...p, userStatus: 'requested' } : p
            ));
        } catch (error) {
            console.error("Failed to request join", error);
            alert("Failed to send request. You might already be a member or have a pending request.");
        } finally {
            setRequestingPodId(null);
        }
    };

    const handleOpenPod = (podId: string) => {
        navigate(`/pod/${podId}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-background-surface border border-background-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-background-border flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary mb-1">Explore Active Pods</h2>
                                    <p className="text-sm text-text-secondary">Discover and join development teams</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-background-border/50 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
                                >
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                {isLoading ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pods.map((pod) => (
                                            <div key={pod.id} className="bg-background border border-background-border rounded-xl p-5 hover:border-primary/50 transition-colors group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                        <HiOutlineUserGroup className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <span className="text-[10px] font-mono text-text-secondary bg-background-border/30 px-2 py-1 rounded">
                                                        {pod.memberCount} members
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-text-primary mb-2 truncate">{pod.name}</h3>
                                                <p className="text-xs text-text-secondary mb-3 line-clamp-2 min-h-[32px]">
                                                    {pod.description || "No description provided."}
                                                </p>

                                                {pod.repoOwner && pod.repoName && (
                                                    <div className="text-[10px] text-text-secondary font-mono mb-3 truncate bg-background-border/20 px-2 py-1 rounded">
                                                        {pod.repoOwner}/{pod.repoName}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-end mt-auto pt-3 border-t border-white/5">
                                                    {pod.userStatus === 'accepted' ? (
                                                        <button
                                                            onClick={() => handleOpenPod(pod.id)}
                                                            className="w-full px-4 py-2 bg-background-border text-text-primary rounded-lg text-xs font-bold hover:bg-white/10 transition-colors"
                                                        >
                                                            Open Pod
                                                        </button>
                                                    ) : pod.userStatus === 'requested' ? (
                                                        <span className="w-full text-center text-xs font-bold text-yellow-500 px-3 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                                            Request Pending
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRequestJoin(pod.id)}
                                                            disabled={!!requestingPodId}
                                                            className="w-full px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                                        >
                                                            {requestingPodId === pod.id ? 'Sending...' : 'Request to Join'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {pods.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-text-secondary border border-dashed border-background-border rounded-xl">
                                                <HiOutlineUserGroup className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>No active pods found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ExplorePodsModal;
