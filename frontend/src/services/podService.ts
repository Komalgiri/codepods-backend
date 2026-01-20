
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
}

export interface Task {
    id: string;
    title: string;
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
}

export interface PodStats {
    commits: { value: string; trend: string; trendUp: boolean; unit: string };
    prs: { value: string; trend: string; trendUp: boolean; unit: string };
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
    }
};
