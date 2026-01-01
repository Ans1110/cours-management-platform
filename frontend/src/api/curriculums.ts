import apiClient from "./client";
import type { Curriculum, CreateCurriculum, UpdateCurriculum } from "@/types";

export const curriculumsApi = {
  list: (): Promise<Curriculum[]> => {
    return apiClient.get<Curriculum[]>("/curriculums");
  },

  getById: (id: number): Promise<Curriculum> => {
    return apiClient.get<Curriculum>(`/curriculums/${id}`);
  },

  create: (data: CreateCurriculum): Promise<Curriculum> => {
    return apiClient.post<Curriculum>("/curriculums", data);
  },

  update: (id: number, data: UpdateCurriculum): Promise<Curriculum> => {
    return apiClient.put<Curriculum>(`/curriculums/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/curriculums/${id}`);
  },

  addCourse: (curriculumId: number, courseId: number): Promise<void> => {
    return apiClient.post<void>(
      `/curriculums/${curriculumId}/courses/${courseId}`
    );
  },

  removeCourse: (curriculumId: number, courseId: number): Promise<void> => {
    return apiClient.delete<void>(
      `/curriculums/${curriculumId}/courses/${courseId}`
    );
  },

  reorderCourses: (
    curriculumId: number,
    courseIds: number[]
  ): Promise<void> => {
    return apiClient.put<void>(`/curriculums/${curriculumId}/courses/order`, {
      courseIds,
    });
  },
};

export default curriculumsApi;
