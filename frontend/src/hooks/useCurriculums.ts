import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { curriculumsApi } from "@/api";
import type { CreateCurriculum, UpdateCurriculum } from "@/types";

export function useCurriculums() {
  return useQuery({
    queryKey: ["curriculums"],
    queryFn: curriculumsApi.list,
  });
}

export function useCurriculum(id: number) {
  return useQuery({
    queryKey: ["curriculum", id],
    queryFn: () => curriculumsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCurriculum) => curriculumsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
    },
  });
}

export function useUpdateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCurriculum }) =>
      curriculumsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
      queryClient.invalidateQueries({ queryKey: ["curriculum", variables.id] });
    },
  });
}

export function useDeleteCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => curriculumsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
    },
  });
}

export function useAddCourseToCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      curriculumId,
      courseId,
    }: {
      curriculumId: number;
      courseId: number;
    }) => curriculumsApi.addCourse(curriculumId, courseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.curriculumId],
      });
    },
  });
}

export function useRemoveCourseFromCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      curriculumId,
      courseId,
    }: {
      curriculumId: number;
      courseId: number;
    }) => curriculumsApi.removeCourse(curriculumId, courseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.curriculumId],
      });
    },
  });
}

export function useReorderCurriculumCourses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      curriculumId,
      courseIds,
    }: {
      curriculumId: number;
      courseIds: number[];
    }) => curriculumsApi.reorderCourses(curriculumId, courseIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
      queryClient.invalidateQueries({
        queryKey: ["curriculum", variables.curriculumId],
      });
    },
  });
}
