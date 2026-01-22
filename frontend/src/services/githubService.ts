import { apiRequest } from './api';

export interface ProfileAnalysis {
    techStack: string[];
    inferredRole: string;
}

export const githubService = {
    analyzeProfile: async (): Promise<ProfileAnalysis> => {
        const token = localStorage.getItem('token');
        return apiRequest<ProfileAnalysis>('github/analyze', {
            method: 'POST',
            token: token || undefined,
        });
    },

    syncActivity: async () => {
        const token = localStorage.getItem('token');
        return apiRequest('github/sync', {
            method: 'POST',
            token: token || undefined,
        });
    }
};
