import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => categoriesApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
