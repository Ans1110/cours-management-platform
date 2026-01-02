import { apiClient } from "./client";
import type { Attachment } from "@/types";

export const filesApi = {
  upload: (file: File, noteId: number): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("noteId", noteId.toString());
    return apiClient.postFormData<Attachment>("/files/upload", formData);
  },

  getByNoteId: (noteId: number) =>
    apiClient.get<Attachment[]>(`/files/note/${noteId}`),

  delete: (id: number) => apiClient.delete<void>(`/files/${id}`),
};
