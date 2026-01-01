import apiClient from "./client";
import type { Todo, CreateTodo, UpdateTodo } from "@/types";

export const todosApi = {
  list: (status?: string): Promise<Todo[]> => {
    const params = status ? `?status=${status}` : "";
    return apiClient.get<Todo[]>(`/todos${params}`);
  },

  getById: (id: number): Promise<Todo> => {
    return apiClient.get<Todo>(`/todos/${id}`);
  },

  create: (data: CreateTodo): Promise<Todo> => {
    return apiClient.post<Todo>("/todos", data);
  },

  update: (id: number, data: UpdateTodo): Promise<Todo> => {
    return apiClient.put<Todo>(`/todos/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/todos/${id}`);
  },

  updateStatus: (id: number, status: string): Promise<Todo> => {
    return apiClient.patch<Todo>(`/todos/${id}/status`, { status });
  },
};

export default todosApi;
