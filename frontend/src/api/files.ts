import { apiClient } from "./client";
import type { Attachment } from "@/types";

export const filesApi = {
  upload: async (file: File, noteId: number): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("noteId", noteId.toString());

    const response = await fetch("http://localhost:8080/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  },

  getByNoteId: (noteId: number) =>
    apiClient.get<Attachment[]>(`/files/note/${noteId}`),

  delete: (id: number) => apiClient.delete<void>(`/files/${id}`),
};
