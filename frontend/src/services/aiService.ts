import { apiRequest } from './api';

export interface RoadmapStage {
    id: number;
    title: string;
    description: string;
    status: 'COMPLETED' | 'IN PROGRESS' | 'UPCOMING';
    tasks: { name: string; status: 'done' | 'progress' | 'pending'; progress?: number; assignee?: string; assigneeId?: string }[];
}

export interface TeamAllocationMember {
    id: string;
    name: string;
    role: string;
    match: number;
}

export interface PMInsight {
    type: 'blocker' | 'warning' | 'suggestion';
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export interface ProjectBrain {
    summary: string;
    decisions: string[];
    milestones: string[];
    techStackAdjustments: string;
}

export interface RoadmapResponse {
    stage: string;
    roadmap: RoadmapStage[];
    projectBrain: ProjectBrain | null;
    members: TeamAllocationMember[];
    confidence: number;
    duration: string;
    efficiency: string;
    pmInsights?: PMInsight[];
    meta?: {
        cached: boolean;
        daysSinceGeneration: number;
        daysUntilRegeneration: number;
        lastUpdated: string;
    };
}

export interface AIReply {
    reply: string;
    timestamp: string;
}

export interface TaskSuggestion {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    assigneeId: string;
}

export const aiService = {
    getPodPlan: async (podId: string, force: boolean = false): Promise<RoadmapResponse> => {
        const query = force ? '?force=true' : '';
        return apiRequest<RoadmapResponse>(`ai/pods/${podId}/plan${query}`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    getProjectBrain: async (podId: string): Promise<{ name: string; brain: ProjectBrain }> => {
        return apiRequest<{ name: string; brain: ProjectBrain }>(`ai/pods/${podId}/brain`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    suggestTasks: async (podId: string): Promise<{ suggestions: TaskSuggestion[] }> => {
        return apiRequest<{ suggestions: TaskSuggestion[] }>(`ai/pods/${podId}/suggest-tasks`, {
            method: 'POST',
            token: localStorage.getItem('token'),
        });
    }
};
