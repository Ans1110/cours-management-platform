import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Plus,
  FileText,
  Trash2,
  Pencil,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coursesApi, notesApi } from "@/api";
import { noteSchema, type NoteInput } from "@/schemas";
import type { Note } from "@/types";

// Helper functions for date-based progress
function calculateProgress(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const queryClient = useQueryClient();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesApi.getById(courseId),
    enabled: !!courseId,
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["notes", { courseId }],
    queryFn: () => notesApi.list(courseId),
    enabled: !!courseId,
  });

  const createNoteMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", { courseId }] });
      closeNoteModal();
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Note> }) =>
      notesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", { courseId }] });
      closeNoteModal();
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", { courseId }] });
    },
  });

  const updateDatesMutation = useMutation({
    mutationFn: (dates: { startDate?: string; endDate?: string }) =>
      coursesApi.update(courseId, dates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
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

  const openNoteModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      reset({ title: note.title, content: note.content || "", courseId });
    } else {
      setEditingNote(null);
      reset({ title: "", content: "", courseId });
    }
    setIsNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setEditingNote(null);
    reset();
  };

  const onNoteSubmit = (data: NoteInput) => {
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data });
    } else {
      createNoteMutation.mutate({ ...data, courseId });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/20";
      case "in_progress":
        return "text-yellow-400 bg-yellow-500/20";
      default:
        return "text-slate-400 bg-slate-500/20";
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Course not found</p>
        <Link to="/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          to="/courses"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            <span
              className={`px-2 py-1 rounded-md text-sm capitalize ${getStatusColor(
                course.status
              )}`}
            >
              {course.status.replace("_", " ")}
            </span>
          </div>
          {course.description && (
            <p className="text-slate-400">{course.description}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            {course.category || "Uncategorized"}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Course Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-calculated progress bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">Progress</span>
              <span className="text-sm font-medium text-white">
                {calculateProgress(course.startDate, course.endDate)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${calculateProgress(
                    course.startDate,
                    course.endDate
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Start Date</Label>
              <Input
                type="date"
                value={course.startDate || ""}
                onChange={(e) =>
                  updateDatesMutation.mutate({ startDate: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">End Date</Label>
              <Input
                type="date"
                value={course.endDate || ""}
                onChange={(e) =>
                  updateDatesMutation.mutate({ endDate: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Status info */}
          {course.startDate && course.endDate && (
            <p className="text-sm text-slate-500">
              {new Date(course.startDate).toLocaleDateString()} →{" "}
              {new Date(course.endDate).toLocaleDateString()} (
              {getDaysRemaining(course.endDate)} days remaining)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Course Notes</h2>
          <Button
            onClick={() => openNoteModal()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>

        {notesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-400" />
                      <CardTitle className="text-lg text-white">
                        {note.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openNoteModal(note)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg"
                      >
                        <Trash2 size={14} />
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
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 border-dashed">
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-3">
                No notes yet for this course
              </p>
              <Button
                onClick={() => openNoteModal()}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Note
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingNote ? "Edit Note" : "New Note"}
              </CardTitle>
              <button
                onClick={closeNoteModal}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onNoteSubmit)} className="space-y-4">
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
                    className="w-full h-40 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white resize-none"
                    placeholder="Write your notes here..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeNoteModal}
                    className="flex-1 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600"
                    disabled={
                      createNoteMutation.isPending ||
                      updateNoteMutation.isPending
                    }
                  >
                    {createNoteMutation.isPending ||
                    updateNoteMutation.isPending ? (
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
