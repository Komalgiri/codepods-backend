
import { apiRequest } from './api';

export interface RewardsResponse {
    points: number;
    badges: string[];
    // Add other fields as needed
}

export const userService = {
    getRewards: async (userId: string): Promise<RewardsResponse> => {
        const token = localStorage.getItem('token');
        return apiRequest<RewardsResponse>(`users/${userId}/rewards`, {
            method: 'GET',
            token,
        });
    }
};
