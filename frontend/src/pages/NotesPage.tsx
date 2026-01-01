import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notesApi, coursesApi } from "@/api";
import { noteSchema, type NoteInput } from "@/schemas";
import type { Note } from "@/types";

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => notesApi.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Note> }) =>
      notesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteInput>({
    resolver: zodResolver(noteSchema),
  });

  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      reset({
        title: note.title,
        content: note.content || "",
        courseId: note.courseId,
      });
    } else {
      setEditingNote(null);
      reset({ title: "", content: "", courseId: undefined });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    reset();
  };

  const onSubmit = (data: NoteInput) => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getCourseTitle = (courseId?: number) => {
    if (!courseId) return "No course";
    const course = courses.find((c) => c.id === courseId);
    return course?.title || "Unknown course";
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
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-slate-400">Capture your learning insights</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <FileText className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">
                      {note.title}
                    </CardTitle>
                    <p className="text-sm text-slate-400">
                      {getCourseTitle(note.courseId)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(note)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(note.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {note.content && (
                <p className="text-sm text-slate-400 line-clamp-3 whitespace-pre-wrap">
                  {note.content}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-3">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">
            No notes yet. Create your first note!
          </p>
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Note
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingNote ? "Edit Note" : "New Note"}
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
                    placeholder="Note title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-400">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Content</Label>
                  <textarea
                    {...register("content")}
                    className="w-full h-32 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white resize-none"
                    placeholder="Write your notes here..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Course (optional)</Label>
                  <select
                    {...register("courseId", { valueAsNumber: true })}
                    className="w-full h-10 px-3 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                  >
                    <option value="">No course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
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
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingNote ? (
                      "Save Changes"
                    ) : (
                      "Create Note"
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
