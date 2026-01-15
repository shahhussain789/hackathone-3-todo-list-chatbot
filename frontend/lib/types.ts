/**
 * TypeScript types matching API schemas.
 */

// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

// Single task response (alias for Task)
export type TaskResponse = Task;

// Error response
export interface ErrorResponse {
  detail: string;
  status_code?: number;
}

// API response wrapper
export type ApiResponse<T> = {
  data?: T;
  error?: ErrorResponse;
};
