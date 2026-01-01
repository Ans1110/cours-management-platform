import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from "@/hooks";
import { courseSchema, type CourseInput } from "@/schemas";
import type { Course } from "@/types";

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const { data: courses = [], isLoading } = useCourses();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
  });

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      reset({
        title: course.title,
        description: course.description || "",
        category: course.category || "",
        status: course.status,
        progress: course.progress,
        coverUrl: course.coverUrl || "",
      });
    } else {
      setEditingCourse(null);
      reset({
        title: "",
        description: "",
        category: "",
        status: "not_started",
        progress: 0,
        coverUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    reset();
  };

  const onSubmit = (data: CourseInput) => {
    if (editingCourse) {
      updateMutation.mutate(
        { id: editingCourse.id, data },
        { onSuccess: closeModal }
      );
    } else {
      createMutation.mutate(data, { onSuccess: closeModal });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-yellow-500";
      default:
        return "bg-slate-500";
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
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-slate-400">Manage your learning courses</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <Link to={`/courses/${course.id}`}>
                    <CardTitle className="text-lg text-white truncate hover:text-purple-400 transition-colors cursor-pointer">
                      {course.title}
                    </CardTitle>
                  </Link>
                  <p className="text-sm text-slate-400 mt-1">
                    {course.category || "Uncategorized"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(course)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(course.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {course.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {course.description}
                </p>
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        course.status
                      )}`}
                    />
                    <span className="text-sm text-slate-400 capitalize">
                      {course.status.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">
            No courses yet. Create your first course!
          </p>
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingCourse ? "Edit Course" : "New Course"}
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
                    placeholder="Course title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-400">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Description</Label>
                  <Input
                    {...register("description")}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Course description"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Category</Label>
                  <Input
                    {...register("category")}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="e.g., Programming, Design"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Status</Label>
                    <select
                      {...register("status")}
                      className="w-full h-10 px-3 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Progress (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...register("progress", { valueAsNumber: true })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
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
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingCourse ? (
                      "Save Changes"
                    ) : (
                      "Create Course"
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
