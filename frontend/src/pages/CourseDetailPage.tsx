import { useState, useRef } from "react";
import { useParams, Link } from "react-router";
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
  Upload,
  File,
  Calendar,
  Clock,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCourse,
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useUpdateCourse,
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "@/hooks";
import { noteSchema, type NoteInput } from "@/schemas";
import type { Note, Attachment } from "@/types";

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

const pastelGradients = [
  "pastel-mint-gradient",
  "pastel-lavender-gradient",
  "pastel-yellow-gradient",
  "pastel-pink-gradient",
  "pastel-blue-gradient",
  "pastel-orange-gradient",
];

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data hooks
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: notes = [], isLoading: notesLoading } = useNotes(courseId);
  const { data: attachments = [] } = useAttachments(editingNote?.id);

  // Mutation hooks
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const updateCourseMutation = useUpdateCourse();
  const uploadMutation = useUploadAttachment();
  const deleteAttachmentMutation = useDeleteAttachment(editingNote?.id);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    if (editingNote) {
      for (const file of fileArray) {
        await uploadMutation.mutateAsync({ file, noteId: editingNote.id });
      }
    } else {
      setPendingFiles((prev) => [...prev, ...fileArray]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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
    setPendingFiles([]);
    reset();
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onNoteSubmit = async (data: NoteInput) => {
    if (editingNote) {
      updateNoteMutation.mutate(
        { id: editingNote.id, data },
        { onSuccess: closeNoteModal }
      );
    } else {
      try {
        const newNote = await createNoteMutation.mutateAsync({
          ...data,
          courseId,
        });
        if (pendingFiles.length > 0 && newNote?.id) {
          for (const file of pendingFiles) {
            await uploadMutation.mutateAsync({ file, noteId: newNote.id });
          }
        }
        closeNoteModal();
      } catch (error) {
        console.error("Failed to create note:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "in_progress":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-white rounded-3xl p-12 soft-shadow text-center">
        <p className="text-gray-500 mb-4">Course not found</p>
        <Link to="/courses">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  const progress = calculateProgress(course.startDate, course.endDate);
  const daysRemaining = course.endDate
    ? getDaysRemaining(course.endDate)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/courses"
          className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
            <span
              className={`px-3 py-1 rounded-xl text-sm font-medium capitalize ${getStatusBadge(
                course.status
              )}`}
            >
              {course.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {course.category || "Uncategorized"}
            </span>
            {course.description && <span className="text-gray-400">|</span>}
            {course.description && (
              <span className="truncate max-w-md">{course.description}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-3xl p-6 soft-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Course Progress
          </h2>
          <span className="text-2xl font-bold text-indigo-600">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div className="pastel-blue-gradient rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Start Date
              </span>
            </div>
            <Input
              type="date"
              value={course.startDate || ""}
              onChange={(e) =>
                updateCourseMutation.mutate({
                  id: courseId,
                  data: { startDate: e.target.value },
                })
              }
              className="bg-white/60 border-0 rounded-xl h-10 text-gray-800"
            />
          </div>

          {/* End Date */}
          <div className="pastel-pink-gradient rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-pink-600" />
              <span className="text-sm font-medium text-gray-600">
                End Date
              </span>
            </div>
            <Input
              type="date"
              value={course.endDate || ""}
              onChange={(e) =>
                updateCourseMutation.mutate({
                  id: courseId,
                  data: { endDate: e.target.value },
                })
              }
              className="bg-white/60 border-0 rounded-xl h-10 text-gray-800"
            />
          </div>

          {/* Days Remaining */}
          <div className="pastel-yellow-gradient rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-gray-600">
                Days Left
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {daysRemaining !== null ? daysRemaining : "—"}
            </p>
          </div>

          {/* Notes Count */}
          <div className="pastel-green-gradient rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">Notes</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{notes.length}</p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-3xl p-6 soft-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            Course Notes
          </h2>
          <Button
            onClick={() => openNoteModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>

        {notesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note, index) => (
              <div
                key={note.id}
                className={`${
                  pastelGradients[index % pastelGradients.length]
                } rounded-2xl p-5 relative group hover:scale-[1.02] transition-transform`}
              >
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openNoteModal(note)}
                    className="p-2 bg-white/80 hover:bg-white rounded-xl text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    className="p-2 bg-white/80 hover:bg-white rounded-xl text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Link to={`/notes/${note.id}`} className="block">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
                      <FileText size={16} className="text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-1 hover:text-emerald-700 transition-colors">
                    {note.title}
                  </h3>
                  {note.content && (
                    <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-gray-500 mb-4">No notes yet for this course</p>
            <Button
              onClick={() => openNoteModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Note
            </Button>
          </div>
        )}
      </div>

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl soft-shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
              <button
                onClick={closeNoteModal}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit(onNoteSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Title *</Label>
                  <Input
                    {...register("title")}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11"
                    placeholder="Note title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Content</Label>
                  <textarea
                    {...register("content")}
                    className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Write your notes here..."
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">
                    Attachments
                  </Label>

                  {/* Upload Button */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="course-note-file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {uploadMutation.isPending
                        ? "Uploading..."
                        : "Upload Files"}
                    </Button>
                  </div>

                  {/* Pending Files (for new notes) */}
                  {!editingNote && pendingFiles.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {pendingFiles.map((file, index) => (
                        <div
                          key={`pending-${index}`}
                          className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <File className="h-4 w-4 text-amber-500 shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-400 shrink-0">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePendingFile(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing Attachments (for editing) */}
                  {editingNote && attachments.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {attachments.map((attachment: Attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <File className="h-4 w-4 text-gray-400 shrink-0" />
                            <a
                              href={`${import.meta.env.VITE_API_BASE_URL}/api/v1${
                                attachment.fileUrl
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-600 hover:text-emerald-600 truncate"
                            >
                              {attachment.fileName}
                            </a>
                            <span className="text-xs text-gray-400 shrink-0">
                              ({formatFileSize(attachment.fileSize)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteAttachmentMutation.mutate(attachment.id)
                            }
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeNoteModal}
                    className="flex-1 h-11 rounded-xl text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
