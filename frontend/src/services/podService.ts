
import { apiRequest } from './api';

export interface CreatePodRequest {
    name: string;
    description: string;
}

export interface PodMember {
    id: string;
    userId: string;
    podId: string;
    role: string;
    user?: {
        id: string;
        name: string;
        email: string;
        githubUsername?: string;
        reliabilityScore?: number;
        dynamicsMetrics?: {
            onTimeRate?: number;
            rescueCount?: number;
            missedDeadlines?: number;
            totalCompleted?: number;
        };
    };
}

export interface Pod {
    id: string;
    name: string;
    description: string | null;
    repoOwner: string | null;
    repoName: string | null;
    createdAt: string;
    members: PodMember[];
    projectBrain?: any;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'pending' | 'in-progress' | 'done';
    podId: string;
    assignedTo: string | null;
    dueAt: string | null;
    createdAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface LeaderboardMember {
    id: string;
    name: string;
    email: string;
    role: string;
    totalPoints: number;
    level: number;
    badges: any[];
    githubUsername?: string;
}

export interface PodStats {
    commits: { value: string; trend: string; trendUp: boolean; unit: string };
    prs: { value: string; trend: string; trendUp: boolean; unit: string };
    weeklyCommits?: { value: string; unit: string };
    uptime: { value: string; unit: string; trend: string; trendUp: boolean };
    health: number;
}

export interface Achievement {
    id: string;
    user: string;
    badge: string;
    points: number;
    reason: string;
    time: string;
}

export const podService = {
    createPod: async (data: CreatePodRequest): Promise<{ message: string; pod: Pod }> => {
        return apiRequest<{ message: string; pod: Pod }>('pods', {
            method: 'POST',
            body: data,
            token: localStorage.getItem('token'),
        });
    },

    getUserPods: async (): Promise<{ pods: (Pod & { role: string })[] }> => {
        return apiRequest<{ pods: (Pod & { role: string })[] }>('pods', {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    getPod: async (id: string): Promise<{ pod: Pod }> => {
        return apiRequest<{ pod: Pod }>(`pods/${id}`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    getPodTasks: async (podId: string): Promise<{ tasks: Task[] }> => {
        return apiRequest<{ tasks: Task[] }>(`pods/${podId}/tasks`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    getPodLeaderboard: async (podId: string): Promise<{ leaderboard: LeaderboardMember[] }> => {
        return apiRequest<{ leaderboard: LeaderboardMember[] }>(`pods/${podId}/leaderboard`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    getPodStats: async (podId: string): Promise<{ stats: PodStats }> => {
        return apiRequest<{ stats: PodStats }>(`pods/${podId}/stats`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    getPodAchievements: async (podId: string): Promise<{ achievements: Achievement[] }> => {
        return apiRequest<{ achievements: Achievement[] }>(`pods/${podId}/achievements`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    createTask: async (podId: string, data: { title: string; description?: string; assignedTo?: string }): Promise<{ message: string; task: Task }> => {
        return apiRequest<{ message: string; task: Task }>(`pods/${podId}/tasks`, {
            method: 'POST',
            body: data,
            token: localStorage.getItem('token'),
        });
    },

    updateTaskStatus: async (taskId: string, status: string): Promise<{ message: string; task: Task }> => {
        return apiRequest<{ message: string; task: Task }>(`tasks/${taskId}`, {
            method: 'PATCH',
            body: { status },
            token: localStorage.getItem('token'),
        });
    },

    updatePod: async (podId: string, data: { name?: string; description?: string; repoOwner?: string; repoName?: string }): Promise<{ message: string; pod: Pod }> => {
        return apiRequest<{ message: string; pod: Pod }>(`pods/${podId}`, {
            method: 'PATCH',
            body: data,
            token: localStorage.getItem('token'),
        });
    },

    addMember: async (podId: string, userId: string, role: string = 'member'): Promise<{ message: string; member: PodMember }> => {
        return apiRequest<{ message: string; member: PodMember }>(`pods/${podId}/members`, {
            method: 'POST',
            body: { userId, role },
            token: localStorage.getItem('token'),
        });
    },

    searchUsers: async (query: string): Promise<{ users: { id: string; name: string; email: string }[] }> => {
        return apiRequest<{ users: { id: string; name: string; email: string }[] }>(`users/search?q=${query}`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    getGitHubRepos: async (): Promise<{ repos: { id: string; name: string; fullName: string; owner: { login: string } }[] }> => {
        return apiRequest<{ repos: any[] }>('github/repos', {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    getPodActivities: async (podId: string): Promise<{ activities: any[] }> => {
        return apiRequest<{ activities: any[] }>(`pods/${podId}/activities`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    updateMemberRole: async (podId: string, memberId: string, role: string): Promise<{ message: string; member: PodMember }> => {
        return apiRequest<{ message: string; member: PodMember }>(`pods/${podId}/members/${memberId}`, {
            method: 'PATCH',
            body: { role },
            token: localStorage.getItem('token'),
        });
    },

    syncPodActivity: async (podId: string): Promise<{ message: string; results: any }> => {
        return apiRequest<{ message: string; results: any }>(`pods/${podId}/sync`, {
            method: 'POST',
            token: localStorage.getItem('token'),
        });
    },

    updateProfile: async (data: { name?: string; githubUsername?: string }): Promise<{ message: string; user: any }> => {
        return apiRequest<{ message: string; user: any }>('users/profile', {
            method: 'PATCH',
            body: data,
            token: localStorage.getItem('token'),
        });
    }
};
