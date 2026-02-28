export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: { field: string; message: string }[];
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface TaskFilters {
    status?: TaskStatus | '';
    priority?: Priority | '';
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
