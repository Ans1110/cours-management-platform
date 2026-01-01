import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/api";
import type { Note, CreateNote, UpdateNote } from "@/types";

export function useNotes(courseId?: number) {
  return useQuery({
    queryKey: ["notes", { courseId }],
    queryFn: () => notesApi.list(courseId),
  });
}

export function useNote(id: number) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => notesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNote) => notesApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: ["notes", { courseId: variables.courseId }],
        });
      }
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNote }) =>
      notesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", variables.id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
