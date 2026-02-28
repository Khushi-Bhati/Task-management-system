import api from './api';
import { User, Task, TaskFilters, ApiResponse, Pagination } from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', data),

    logout: () => api.post<ApiResponse<null>>('/auth/logout'),

    refresh: (refreshToken: string) =>
        api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),

    getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
    getTasks: (filters: TaskFilters = {}) => {
        const params = new URLSearchParams();
        if (filters.page) params.set('page', String(filters.page));
        if (filters.limit) params.set('limit', String(filters.limit));
        if (filters.status) params.set('status', filters.status);
        if (filters.priority) params.set('priority', filters.priority);
        if (filters.search) params.set('search', filters.search);
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
        return api.get<ApiResponse<{ tasks: Task[]; pagination: Pagination }>>(`/tasks?${params.toString()}`);
    },

    getTask: (id: string) => api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`),

    createTask: (data: {
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string | null;
    }) => api.post<ApiResponse<{ task: Task }>>('/tasks', data),

    updateTask: (id: string, data: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string | null;
    }) => api.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data),

    deleteTask: (id: string) => api.delete<ApiResponse<null>>(`/tasks/${id}`),

    toggleTask: (id: string) => api.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}/toggle`),
};
