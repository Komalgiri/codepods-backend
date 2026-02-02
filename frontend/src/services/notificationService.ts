
import { apiRequest } from './api';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'invite' | 'request' | 'success' | 'warning';
    link: string | null;
    read: boolean;
    createdAt: string;
}

export const notificationService = {
    getNotifications: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
        return apiRequest<{ notifications: Notification[]; unreadCount: number }>('notifications', {
            method: 'GET',
            token: localStorage.getItem('token'),
        });
    },

    markAsRead: async (id: string): Promise<{ success: boolean }> => {
        return apiRequest<{ success: boolean }>(`notifications/${id}/read`, {
            method: 'PATCH',
            token: localStorage.getItem('token'),
        });
    },

    markAllAsRead: async (): Promise<{ success: boolean }> => {
        return apiRequest<{ success: boolean }>('notifications/read-all', {
            method: 'PATCH',
            token: localStorage.getItem('token'),
        });
    }
};
