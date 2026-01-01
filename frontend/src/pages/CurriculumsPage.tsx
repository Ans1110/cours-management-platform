import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, X, Loader2, Layers, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { curriculumsApi } from "@/api";
import { curriculumSchema, type CurriculumInput } from "@/schemas";
import type { Curriculum } from "@/types";

export default function CurriculumsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(
    null
  );

  const { data: curriculums = [], isLoading } = useQuery({
    queryKey: ["curriculums"],
    queryFn: curriculumsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: curriculumsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Curriculum> }) =>
      curriculumsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: curriculumsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurriculumInput>({
    resolver: zodResolver(curriculumSchema),
  });

  const openModal = (curriculum?: Curriculum) => {
    if (curriculum) {
      setEditingCurriculum(curriculum);
      reset({
        title: curriculum.title,
        description: curriculum.description || "",
        goal: curriculum.goal || "",
      });
    } else {
      setEditingCurriculum(null);
      reset({ title: "", description: "", goal: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCurriculum(null);
    reset();
  };

  const onSubmit = (data: CurriculumInput) => {
    if (editingCurriculum) {
      updateMutation.mutate({ id: editingCurriculum.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Curriculums</h1>
          <p className="text-slate-400">
            Build your personalized learning paths
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Curriculum
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {curriculums.map((curriculum) => (
          <Card
            key={curriculum.id}
            className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Layers className="h-5 w-5 text-pink-400" />
                  </div>
                  <CardTitle className="text-lg text-white">
                    {curriculum.title}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(curriculum)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(curriculum.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {curriculum.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                  {curriculum.description}
                </p>
              )}
              {curriculum.goal && (
                <div className="flex items-start gap-2 p-3 bg-slate-700/30 rounded-lg">
                  <Target className="h-4 w-4 text-pink-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {curriculum.goal}
                  </p>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3">
                Created {new Date(curriculum.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {curriculums.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">
            No curriculums yet. Create your first learning path!
          </p>
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-pink-500 to-rose-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Curriculum
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingCurriculum ? "Edit Curriculum" : "New Curriculum"}
              </CardTitle>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Title *</Label>
                  <Input
                    {...register("title")}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Curriculum title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-400">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Description</Label>
                  <textarea
                    {...register("description")}
                    className="w-full h-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white resize-none"
                    placeholder="What is this learning path about?"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Goal</Label>
                  <textarea
                    {...register("goal")}
                    className="w-full h-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white resize-none"
                    placeholder="What do you want to achieve?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeModal}
                    className="flex-1 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingCurriculum ? (
                      "Save Changes"
                    ) : (
                      "Create Curriculum"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
