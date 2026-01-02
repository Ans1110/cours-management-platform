import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  BookOpen,
  FileText,
  CheckSquare,
  Layers,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { coursesApi, notesApi, todosApi, curriculumsApi } from "@/api";
import { useAuthStore } from "@/stores/authStore";

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

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: () => notesApi.list(),
  });

  const { data: todos = [] } = useQuery({
    queryKey: ["todos"],
    queryFn: () => todosApi.list(),
  });

  const { data: curriculums = [] } = useQuery({
    queryKey: ["curriculums"],
    queryFn: curriculumsApi.list,
  });

  const completedCourses = courses.filter(
    (c) => c.status === "completed"
  ).length;
  const pendingTodos = todos.filter((t) => t.status === "pending").length;
  const averageProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce(
            (sum, c) => sum + calculateProgress(c.startDate, c.endDate),
            0
          ) / courses.length
        )
      : 0;

  const stats = [
    {
      title: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      gradient: "pastel-purple-gradient",
      iconBg: "bg-purple-500",
    },
    {
      title: "Notes",
      value: notes.length,
      icon: FileText,
      gradient: "pastel-green-gradient",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Pending Tasks",
      value: pendingTodos,
      icon: CheckSquare,
      gradient: "pastel-orange-gradient",
      iconBg: "bg-orange-500",
    },
    {
      title: "Schedules",
      value: curriculums.length,
      icon: Layers,
      gradient: "pastel-pink-gradient",
      iconBg: "bg-pink-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white rounded-3xl p-8 soft-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Hi, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-gray-500 text-lg">What are we learning today?</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                <BookOpen size={16} />
                View Courses
              </Link>
              <Link
                to="/notes"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                <FileText size={16} />
                My Notes
              </Link>
              <Link
                to="/todos"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                <CheckSquare size={16} />
                Tasks
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">
                {averageProgress}%
              </div>
              <div className="text-sm text-gray-500">Avg Progress</div>
            </div>
            <div className="h-16 w-px bg-gray-200" />
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">
                {completedCourses}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.gradient} rounded-3xl p-5 soft-shadow hover:scale-[1.02] transition-transform cursor-default`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div
                className={`${stat.iconBg} w-10 h-10 rounded-xl flex items-center justify-center`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 soft-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              My Courses
            </h2>
            <Link
              to="/courses"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.slice(0, 4).map((course, index) => {
              const progress = calculateProgress(
                course.startDate,
                course.endDate
              );
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className={`${
                    pastelGradients[index % pastelGradients.length]
                  } rounded-2xl p-4 hover:scale-[1.02] transition-transform`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/60 text-xs font-medium text-gray-700">
                      {course.category || "Course"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex-1 mr-3">
                      <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-800/30 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {progress}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          {courses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No courses yet</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Create your first course
              </Link>
            </div>
          )}
        </div>

        {/* Pending Tasks - Takes 1 column */}
        <div className="bg-white rounded-3xl p-6 soft-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-orange-500" />
              Tasks
            </h2>
            <Link
              to="/todos"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {todos
              .filter((t) => t.status !== "completed")
              .slice(0, 5)
              .map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                      todo.priority === "high"
                        ? "bg-red-400"
                        : todo.priority === "medium"
                        ? "bg-amber-400"
                        : "bg-green-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {todo.title}
                    </p>
                    {todo.dueDate && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            {todos.filter((t) => t.status !== "completed").length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="bg-white rounded-3xl p-6 soft-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            Recent Notes
          </h2>
          <Link
            to="/notes"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.slice(0, 3).map((note, index) => (
            <Link
              key={note.id}
              to={`/notes/${note.id}`}
              className={`${
                pastelGradients[(index + 4) % pastelGradients.length]
              } rounded-2xl p-4 hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
                  <FileText size={16} className="text-gray-600" />
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 truncate">
                {note.title}
              </h3>
              {note.content && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {note.content}
                </p>
              )}
            </Link>
          ))}
        </div>
        {notes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No notes yet</p>
            <Link
              to="/notes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Create your first note
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
