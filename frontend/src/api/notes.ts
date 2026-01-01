import apiClient from "./client";
import type { Note, CreateNote, UpdateNote } from "@/types";

export const notesApi = {
  list: (courseId?: number): Promise<Note[]> => {
    const params = courseId ? `?courseId=${courseId}` : "";
    return apiClient.get<Note[]>(`/notes${params}`);
  },

  getById: (id: number): Promise<Note> => {
    return apiClient.get<Note>(`/notes/${id}`);
  },

  create: (data: CreateNote): Promise<Note> => {
    return apiClient.post<Note>("/notes", data);
  },

  update: (id: number, data: UpdateNote): Promise<Note> => {
    return apiClient.put<Note>(`/notes/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/notes/${id}`);
  },
};

export default notesApi;
