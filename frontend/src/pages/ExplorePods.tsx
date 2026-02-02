
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { podService, type Pod } from '../services/podService';
import { HiOutlineUserGroup, HiOutlinePlus } from 'react-icons/hi2';

const ExplorePods = () => {
    const [pods, setPods] = useState<(Pod & { memberCount: number; userStatus: string | null })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [requestingPodId, setRequestingPodId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPods();
    }, []);

    const fetchPods = async () => {
        try {
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

    if (isLoading) return (
        <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 animate-in fade-in duration-500">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Explore Pods</h1>
                    <p className="text-text-secondary">Discover and join active development pods.</p>
                </div>
                <button
                    onClick={() => navigate('/create-pod')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:shadow-[0_0_20px_rgba(88,166,154,0.4)] transition-all active:scale-95"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Create Pod
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pods.map((pod) => (
                    <div key={pod.id} className="bg-background-surface border border-background-border rounded-xl p-6 hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <HiOutlineUserGroup className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xs font-mono text-text-secondary bg-background-border/30 px-2 py-1 rounded">
                                {pod.memberCount} members
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-text-primary mb-2">{pod.name}</h3>
                        <p className="text-sm text-text-secondary mb-4 line-clamp-2 min-h-[40px]">
                            {pod.description || "No description provided."}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <div className="text-xs text-text-secondary font-mono">
                                {pod.repoOwner}/{pod.repoName}
                            </div>

                            {pod.userStatus === 'accepted' ? (
                                <button
                                    onClick={() => navigate(`/pods/${pod.id}`)}
                                    className="px-4 py-1.5 bg-background-border text-text-primary rounded text-xs font-bold hover:bg-white/10 transition-colors"
                                >
                                    Open
                                </button>
                            ) : pod.userStatus === 'requested' ? (
                                <span className="text-xs font-bold text-yellow-500 px-3 py-1.5 bg-yellow-500/10 rounded border border-yellow-500/20">
                                    Requested
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleRequestJoin(pod.id)}
                                    disabled={!!requestingPodId}
                                    className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {requestingPodId === pod.id ? 'Sending...' : 'Request to Join'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {pods.length === 0 && (
                    <div className="col-span-full py-12 text-center text-text-secondary border border-dashed border-background-border rounded-xl">
                        <p>No active pods found. Be the first to create one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorePods;
