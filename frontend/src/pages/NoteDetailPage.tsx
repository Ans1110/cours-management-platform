import { useState, useRef } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  X,
  Loader2,
  FileText,
  Upload,
  File,
  Download,
  Calendar,
  BookOpen,
  Paperclip,
  Image,
  FileVideo,
  FileAudio,
  Archive,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notesApi, coursesApi, filesApi } from "@/api";
import { noteSchema, type NoteInput } from "@/schemas";
import type { Attachment } from "@/types";

export default function NoteDetailPage() {
  const { id } = useParams();
  const noteId = Number(id);
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: note, isLoading: noteLoading } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => notesApi.getById(noteId),
    enabled: !!noteId,
  });

  const { data: course } = useQuery({
    queryKey: ["course", note?.courseId],
    queryFn: () => coursesApi.getById(note!.courseId!),
    enabled: !!note?.courseId,
  });

  const { data: attachments = [], isLoading: attachmentsLoading } = useQuery({
    queryKey: ["attachments", noteId],
    queryFn: () => filesApi.getByNoteId(noteId),
    enabled: !!noteId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  });

  const updateNoteMutation = useMutation({
    mutationFn: (data: Partial<NoteInput>) => notesApi.update(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setIsEditModalOpen(false);
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: filesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", noteId] });
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

  const openEditModal = () => {
    if (note) {
      reset({
        title: note.title,
        content: note.content || "",
        courseId: note.courseId,
      });
    }
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    reset();
  };

  const onSubmit = (data: NoteInput) => {
    updateNoteMutation.mutate(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await filesApi.upload(file, noteId);
      }
      queryClient.invalidateQueries({ queryKey: ["attachments", noteId] });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/"))
      return <Image size={20} className="text-pink-500" />;
    if (fileType.includes("pdf"))
      return <FileText size={20} className="text-red-500" />;
    if (fileType.includes("word") || fileType.includes("document"))
      return <FileText size={20} className="text-blue-500" />;
    if (fileType.includes("sheet") || fileType.includes("excel"))
      return <FileSpreadsheet size={20} className="text-green-500" />;
    if (fileType.includes("video"))
      return <FileVideo size={20} className="text-purple-500" />;
    if (fileType.includes("audio"))
      return <FileAudio size={20} className="text-amber-500" />;
    if (fileType.includes("zip") || fileType.includes("archive"))
      return <Archive size={20} className="text-gray-500" />;
    return <File size={20} className="text-gray-400" />;
  };

  if (noteLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="bg-white rounded-3xl p-12 soft-shadow text-center">
        <p className="text-gray-500 mb-4">Note not found</p>
        <Link to="/notes">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            Back to Notes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/notes"
          className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 truncate">
                {note.title}
              </h1>
            </div>
            <Button
              onClick={openEditModal}
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl shrink-0"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            {course && (
              <Link
                to={`/courses/${course.id}`}
                className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
              >
                <BookOpen size={14} />
                <span>{course.title}</span>
              </Link>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>
                Updated {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Note Content Card */}
      <div className="bg-white rounded-3xl soft-shadow overflow-hidden">
        <div className="pastel-mint-gradient px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Content</h2>
        </div>
        <div className="p-6">
          {note.content ? (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 italic">
              No content yet. Click Edit to add content.
            </p>
          )}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-white rounded-3xl soft-shadow overflow-hidden">
        <div className="pastel-lavender-gradient px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Paperclip size={18} className="text-purple-600" />
              Attachments ({attachments.length})
            </h2>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {attachmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : attachments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attachments.map((attachment: Attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      {getFileIcon(attachment.fileType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)} •{" "}
                        {new Date(attachment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL}${
                        attachment.fileUrl
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                    <button
                      onClick={() =>
                        deleteAttachmentMutation.mutate(attachment.id)
                      }
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Paperclip className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-gray-500 mb-4">No attachments yet</p>
              <Button
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload First File
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl soft-shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">Edit Note</h2>
              <button
                onClick={closeEditModal}
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
                    className="w-full h-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeEditModal}
                    className="flex-1 h-11 rounded-xl text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={updateNoteMutation.isPending}
                  >
                    {updateNoteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Changes"
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
