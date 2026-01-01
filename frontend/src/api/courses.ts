import apiClient from "./client";
import type { Course, CreateCourse, UpdateCourse } from "@/types";

export const coursesApi = {
  list: (): Promise<Course[]> => {
    return apiClient.get<Course[]>("/courses");
  },

  getById: (id: number): Promise<Course> => {
    return apiClient.get<Course>(`/courses/${id}`);
  },

  create: (data: CreateCourse): Promise<Course> => {
    return apiClient.post<Course>("/courses", data);
  },

  update: (id: number, data: UpdateCourse): Promise<Course> => {
    return apiClient.put<Course>(`/courses/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/courses/${id}`);
  },

  updateProgress: (id: number, progress: number): Promise<Course> => {
    return apiClient.patch<Course>(`/courses/${id}/progress`, { progress });
  },
};

export default coursesApi;
