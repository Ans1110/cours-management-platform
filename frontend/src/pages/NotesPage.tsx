import { useState, useRef } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  FileText,
  Upload,
  File,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useCourses,
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "@/hooks";
import { noteSchema, type NoteInput } from "@/schemas";
import type { Note, Attachment } from "@/types";

const pastelGradients = [
  "pastel-mint-gradient",
  "pastel-lavender-gradient",
  "pastel-yellow-gradient",
  "pastel-pink-gradient",
  "pastel-blue-gradient",
  "pastel-orange-gradient",
  "pastel-green-gradient",
  "pastel-purple-gradient",
];

export default function NotesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data hooks
  const { data: notes = [], isLoading } = useNotes();
  const { data: courses = [] } = useCourses();
  const { data: attachments = [] } = useAttachments(editingNote?.id);

  // Mutation hooks
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
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

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setPendingFiles([]);
    reset();
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: NoteInput) => {
    if (editingNote) {
      updateMutation.mutate(
        { id: editingNote.id, data },
        { onSuccess: closeModal }
      );
    } else {
      try {
        const newNote = await createMutation.mutateAsync(data);
        if (pendingFiles.length > 0 && newNote?.id) {
          for (const file of pendingFiles) {
            await uploadMutation.mutateAsync({ file, noteId: newNote.id });
          }
        }
        closeModal();
      } catch (error) {
        console.error("Failed to create note:", error);
      }
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notes</h1>
          <p className="text-gray-500 mt-1">Capture your learning insights</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-11"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 soft-shadow">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNotes.map((note, index) => (
          <div
            key={note.id}
            className={`${
              pastelGradients[index % pastelGradients.length]
            } rounded-3xl p-5 soft-shadow hover:scale-[1.02] transition-transform relative group`}
          >
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openModal(note)}
                className="p-2 bg-white/80 hover:bg-white rounded-xl text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => deleteMutation.mutate(note.id)}
                className="p-2 bg-white/80 hover:bg-white rounded-xl text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <Link to={`/notes/${note.id}`} className="block">
              {/* Icon and Date */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                  <FileText size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    {getCourseTitle(note.courseId)}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 hover:text-emerald-700 transition-colors">
                {note.title}
              </h3>

              {/* Content Preview */}
              {note.content && (
                <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">
                  {note.content}
                </p>
              )}
            </Link>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="bg-white rounded-3xl p-12 soft-shadow text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No notes found matching your search"
              : "No notes yet. Create your first note!"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => openModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl soft-shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Write your notes here..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Course (optional)
                  </Label>
                  <select
                    {...register("courseId", { valueAsNumber: true })}
                    className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                  >
                    <option value="">No course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
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
                      id="file-upload"
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
                    onClick={closeModal}
                    className="flex-1 h-11 rounded-xl text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
