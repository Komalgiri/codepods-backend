
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
    method?: RequestMethod;
    headers?: Record<string, string>;
    body?: any;
    token?: string | null;
}

export const apiRequest = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', headers = {}, body, token } = options;

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(`${API_URL}/api/${endpoint}`, config);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
    }

    return data as T;
};
