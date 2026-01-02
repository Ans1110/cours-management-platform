import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, X, Loader2, Filter, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks";
import { courseSchema, type CourseInput } from "@/schemas";
import type { Course } from "@/types";

// Helper function for date-based progress calculation
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

const pastelGradients = [
  "pastel-pink-gradient",
  "pastel-purple-gradient",
  "pastel-blue-gradient",
  "pastel-green-gradient",
  "pastel-yellow-gradient",
  "pastel-orange-gradient",
  "pastel-mint-gradient",
  "pastel-lavender-gradient",
];

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const { data: courses = [], isLoading } = useCourses();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      reset({
        title: course.title,
        description: course.description || "",
        category: course.category || "",
        status: course.status,
        progress: course.progress,
        startDate: course.startDate || "",
        endDate: course.endDate || "",
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
        startDate: "",
        endDate: "",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          <p className="text-gray-500 mt-1">Manage your learning courses</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-11"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-2xl p-4 soft-shadow">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={18} className="text-gray-400" />
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === "All"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <div key={category.id} className="relative group/cat">
              <button
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.name
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
              <span
                onClick={() => {
                  if (selectedCategory === category.name) {
                    setSelectedCategory("All");
                  }
                  deleteCategoryMutation.mutate(category.id);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs items-center justify-center cursor-pointer hidden group-hover/cat:flex"
              >
                ×
              </span>
            </div>
          ))}
          {isAddingCategory ? (
            <div className="flex items-center gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="h-9 w-32 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCategoryName.trim()) {
                    createCategoryMutation.mutate(newCategoryName.trim(), {
                      onSuccess: () => {
                        setNewCategoryName("");
                        setIsAddingCategory(false);
                      },
                    });
                  } else if (e.key === "Escape") {
                    setNewCategoryName("");
                    setIsAddingCategory(false);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (newCategoryName.trim()) {
                    createCategoryMutation.mutate(newCategoryName.trim(), {
                      onSuccess: () => {
                        setNewCategoryName("");
                        setIsAddingCategory(false);
                      },
                    });
                  }
                }}
                disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                className="h-9 px-3"
              >
                {createCategoryMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
              <button
                onClick={() => {
                  setNewCategoryName("");
                  setIsAddingCategory(false);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1"
            >
              <Plus size={14} />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => {
          const progress = calculateProgress(course.startDate, course.endDate);
          return (
            <div
              key={course.id}
              className={`${
                pastelGradients[index % pastelGradients.length]
              } rounded-3xl p-5 soft-shadow hover:scale-[1.02] transition-transform relative group`}
            >
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(course)}
                  className="p-2 bg-white/80 hover:bg-white rounded-xl text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(course.id)}
                  className="p-2 bg-white/80 hover:bg-white rounded-xl text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <Link to={`/courses/${course.id}`} className="block">
                {/* Category & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/60 text-xs font-medium text-gray-700">
                    {course.category || "Uncategorized"}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 hover:text-indigo-700 transition-colors">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusBadge(
                      course.status
                    )}`}
                  >
                    {course.status.replace("_", " ")}
                  </span>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2.5 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-800/30 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {progress}%
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-3xl p-12 soft-shadow text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-gray-500 mb-4">
            {selectedCategory === "All"
              ? "No courses yet. Create your first course!"
              : `No courses in ${selectedCategory}`}
          </p>
          <Button
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl soft-shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCourse ? "Edit Course" : "New Course"}
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
                    className="bg-gray-50 border-gray-200 rounded-xl h-11 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Course title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Description
                  </Label>
                  <Input
                    {...register("description")}
                    className="bg-gray-50 border-gray-200 rounded-xl h-11"
                    placeholder="Course description"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Category</Label>
                  <select
                    {...register("category")}
                    className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Status</Label>
                    <select
                      {...register("status")}
                      className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Progress (%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...register("progress", { valueAsNumber: true })}
                      className="bg-gray-50 border-gray-200 rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal bg-gray-50 border-gray-200 rounded-xl",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(new Date(startDate), "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate ? new Date(startDate) : undefined}
                          onSelect={(date) =>
                            setValue("startDate", date ? format(date, "yyyy-MM-dd") : "")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      End Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal bg-gray-50 border-gray-200 rounded-xl",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(new Date(endDate), "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate ? new Date(endDate) : undefined}
                          onSelect={(date) =>
                            setValue("endDate", date ? format(date, "yyyy-MM-dd") : "")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
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
                    className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
