
import { apiRequest } from './api';

export interface RewardsResponse {
    points: number;
    badges: string[];
    // Add other fields as needed
}

export const userService = {
    getRewards: async (userId: string): Promise<any> => {
        const token = localStorage.getItem('token');
        return apiRequest<any>(`users/${userId}/rewards`, {
            method: 'GET',
            token,
        });
    },
    getProfile: async (): Promise<any> => {
        const token = localStorage.getItem('token');
        return apiRequest<any>('users/profile', {
            method: 'GET',
            token,
        });
    }
};
