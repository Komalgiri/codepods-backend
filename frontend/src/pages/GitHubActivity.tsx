

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { podService } from '../services/podService';

const GitHubActivity = () => {
    const { id: podId } = useParams<{ id: string }>();
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pod, setPod] = useState<any>(null);

    const fetchActivities = async () => {
        if (!podId) return;
        try {
            const [activitiesRes, podRes] = await Promise.all([
                podService.getPodActivities(podId),
                podService.getPod(podId)
            ]);
            setActivities(activitiesRes.activities);
            setPod(podRes.pod);
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [podId]);

    const handleSync = async () => {
        if (!podId) return;
        setIsSyncing(true);
        try {
            await podService.syncPodActivity(podId);
            await fetchActivities();
        } catch (error) {
            console.error("Sync failed", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const getStatusInfo = (type: string) => {
        switch (type) {
            case 'commit':
                return { label: 'COMMIT', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
            case 'pr_opened':
                return { label: 'PR OPEN', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
            case 'pr_merged':
                return { label: 'PR MERGED', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
            case 'repo_created':
                return { label: 'REPO CREATE', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' };
            default:
                return { label: 'ACTIVITY', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' };
        }
    };

    if (isLoading) return (
        <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const stats = {
        totalCommits: activities.filter(a => a.type === 'commit').length,
        activeContributors: new Set(activities.map(a => a.userId)).size,
        openPRs: activities.filter(a => a.type === 'pr_opened').length - activities.filter(a => a.type === 'pr_merged').length
    };

    return (
        <div className="h-full flex gap-6 overflow-hidden animate-in fade-in duration-500">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
                            <span>Pods</span>
                            <span>/</span>
                            <span>{pod?.name || 'Project'}</span>
                            <span>/</span>
                            <span className="text-text-primary">GitHub Activity</span>
                        </div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">Project Activity</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary bg-background-surface border border-background-border px-2 py-1 rounded font-mono">
                                {pod?.repoOwner}/{pod?.repoName}
                            </span>
                            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Integration Active
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="flex items-center gap-2 px-4 py-2 bg-background-surface border border-background-border rounded-lg text-sm font-bold text-text-primary hover:bg-background-border/20 transition-colors disabled:opacity-50"
                        >
                            <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                        <a
                            href={`https://github.com/${pod?.repoOwner}/${pod?.repoName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-background text-text-primary border border-background-border rounded-lg text-sm font-bold hover:bg-background-surface transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            View on GitHub
                        </a>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Commits</span>
                            <svg className="w-5 h-5 text-text-secondary opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{stats.totalCommits}</span>
                        </div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-ai-start/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Weekly Commits</span>
                            <svg className="w-5 h-5 text-text-secondary opacity-30 group-hover:text-ai-start group-hover:opacity-100 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                                {activities.filter(a => a.type === 'commit' && new Date(a.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                            </span>
                        </div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Contributors</span>
                            <svg className="w-5 h-5 text-text-secondary opacity-30 group-hover:text-cyan-500 group-hover:opacity-100 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                                {new Set(activities.filter(a => new Date(a.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).map(a => a.userId)).size}
                            </span>
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-50 ml-1">this week</span>
                        </div>
                    </div>
                    <div className="bg-background-surface border border-background-border rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Weekly PRs</span>
                            <svg className="w-5 h-5 text-text-secondary opacity-30 group-hover:text-blue-500 group-hover:opacity-100 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l-4 4-4-4M11 18V4" /></svg>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                                {activities.filter(a => (a.type === 'pr_opened' || a.type === 'pr_merged') && new Date(a.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Latest Activity List */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-bold text-text-primary text-lg">Latest Repository Activity</h3>
                        <span className="text-xs text-text-secondary">(Showing {activities.length} entries)</span>
                    </div>

                    <div className="space-y-3">
                        {activities.length === 0 ? (
                            <div className="bg-background-surface border border-background-border border-dashed rounded-xl py-12 flex flex-col items-center justify-center text-center px-6">
                                <svg className="w-12 h-12 text-text-secondary mb-4 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20M2 12h20" /></svg>
                                <p className="text-text-secondary mb-2 font-medium">No activity synced yet.</p>
                                <button
                                    onClick={handleSync}
                                    className="text-primary text-sm font-bold hover:underline"
                                >
                                    Try Syncing Now
                                </button>
                            </div>
                        ) : (
                            activities.map(activity => {
                                const status = getStatusInfo(activity.type);
                                return (
                                    <div key={activity.id} className="bg-background-surface border border-background-border rounded-lg p-4 flex items-center justify-between hover:bg-background/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user?.name}`} alt={activity.user?.name} className="w-10 h-10 rounded-full border border-background-border bg-background" />
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-text-primary">
                                                        {activity.type === 'commit' ? activity.meta?.message :
                                                            activity.type === 'pr_opened' ? `Opened PR #${activity.meta?.prNumber}: ${activity.meta?.title}` :
                                                                activity.type === 'pr_merged' ? `Merged PR #${activity.meta?.prNumber}: ${activity.meta?.title}` :
                                                                    activity.type === 'repo_created' ? `Created repo ${activity.meta?.repoName}` :
                                                                        activity.type}
                                                    </span>
                                                    {activity.meta?.sha && (
                                                        <span className="text-[10px] text-text-secondary bg-background-border/30 px-1.5 py-0.5 rounded font-mono border border-background-border/50">{activity.meta.sha.substring(0, 7)}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5 font-medium">
                                                    <span className="text-text-primary font-bold">{activity.user?.name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(activity.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${status.color}`}>
                                                {status.label}
                                            </span>
                                            {activity.meta?.prUrl || activity.meta?.commitUrl ? (
                                                <a
                                                    href={activity.meta.prUrl || activity.meta.commitUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-text-secondary hover:text-text-primary transition-colors"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-72 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
                {/* Integration Info */}
                <div className="bg-background-surface border border-background-border rounded-xl p-6">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">INTEGRATION HEALTH</h3>
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-white">Manual Sync</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mb-4 leading-relaxed">
                            Currently using manual polling sync. Webhooks coming soon for real-time updates.
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="w-full py-1.5 bg-background-surface border border-background-border hover:bg-background-border transition-colors text-xs font-bold text-primary rounded"
                        >
                            {isSyncing ? 'Processing...' : 'Sync Activity'}
                        </button>
                    </div>
                </div>

                {/* Team Impact */}
                <div className="bg-background-surface border border-background-border rounded-xl p-6">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">TEAM IMPACT</h3>
                    <div className="space-y-4">
                        {Array.from(new Set(activities.map(a => a.userId))).slice(0, 5).map(uId => {
                            const userActivities = activities.filter(a => a.userId === uId);
                            const userName = userActivities[0]?.user?.name || 'Contributor';
                            const commitCount = userActivities.filter(a => a.type === 'commit').length;
                            return (
                                <div key={uId}>
                                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                                        <span className="text-text-primary">{userName}</span>
                                        <span className="text-text-secondary">{commitCount} commits</span>
                                    </div>
                                    <div className="h-1 bg-background-border rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${Math.min((commitCount / (stats.totalCommits || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GitHubActivity;
