
import { apiRequest } from './api';

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface SignupCredentials {
    name: string;
    email: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        githubId?: string | null;
    };
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        return apiRequest<AuthResponse>('users/login', {
            method: 'POST',
            body: credentials,
        });
    },

    signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
        return apiRequest<AuthResponse>('users/signup', {
            method: 'POST',
            body: credentials,
        });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
