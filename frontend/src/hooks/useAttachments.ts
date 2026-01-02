import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filesApi } from "@/api";

export function useAttachments(noteId: number | undefined) {
  return useQuery({
    queryKey: ["attachments", noteId],
    queryFn: () => filesApi.getByNoteId(noteId!),
    enabled: !!noteId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, noteId }: { file: File; noteId: number }) =>
      filesApi.upload(file, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", variables.noteId],
      });
    },
  });
}

export function useDeleteAttachment(noteId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", noteId] });
    },
  });
}
