import apiClient from "./client";
import type { Category } from "@/types";

export const categoriesApi = {
  list: (): Promise<Category[]> => {
    return apiClient.get<Category[]>("/categories");
  },

  create: (name: string): Promise<Category> => {
    return apiClient.post<Category>("/categories", { name });
  },

  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/categories/${id}`);
  },
};

export default categoriesApi;
