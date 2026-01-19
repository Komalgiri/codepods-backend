
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

export const podService = {
    createPod: async (data: CreatePodRequest): Promise<{ message: string; pod: Pod }> => {
        return apiRequest<{ message: string; pod: Pod }>('pods', {
            method: 'POST',
            body: data,
            token: localStorage.getItem('token'),
        });
    },

    getPod: async (id: string): Promise<{ pod: Pod }> => {
        return apiRequest<{ pod: Pod }>(`pods/${id}`, {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    }
};
