
import { apiRequest } from './api';

export interface RoadmapStage {
    id: number;
    title: string;
    description: string;
    status: 'COMPLETED' | 'IN PROGRESS' | 'UPCOMING';
    tasks: { name: string; status: 'done' | 'progress' | 'pending'; progress?: number }[];
}

export interface RoadmapResponse {
    roadmap: RoadmapStage[];
    confidence: number;
    duration: string;
    efficiency: string;
}

export interface AIReply {
    reply: string;
    timestamp: string;
}

export interface TaskSuggestion {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}

export const aiService = {
    getPodPlan: async (podId: string): Promise<RoadmapResponse> => {
        return apiRequest<RoadmapResponse>(`ai/pods/${podId}/plan`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    suggestTasks: async (podId: string): Promise<{ suggestions: TaskSuggestion[] }> => {
        return apiRequest<{ suggestions: TaskSuggestion[] }>(`ai/pods/${podId}/suggest-tasks`, {
            method: 'POST',
            token: localStorage.getItem('token'),
        });
    },

    chatWithAI: async (podId: string, message: string): Promise<AIReply> => {
        return apiRequest<AIReply>(`ai/pods/${podId}/chat`, {
            method: 'POST',
            token: localStorage.getItem('token'),
            body: JSON.stringify({ message }),
        });
    }
};
