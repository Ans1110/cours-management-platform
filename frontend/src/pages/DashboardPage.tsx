import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  FileText,
  CheckSquare,
  Layers,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coursesApi, notesApi, todosApi, curriculumsApi } from "@/api";
import { useAuthStore } from "@/stores/authStore";

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
  const inProgressCourses = courses.filter(
    (c) => c.status === "in_progress"
  ).length;
  const pendingTodos = todos.filter((t) => t.status === "pending").length;
  const averageProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce((sum, c) => sum + c.progress, 0) / courses.length
        )
      : 0;

  const stats = [
    {
      title: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "from-purple-500 to-indigo-500",
      subtitle: `${inProgressCourses} in progress`,
    },
    {
      title: "Notes",
      value: notes.length,
      icon: FileText,
      color: "from-emerald-500 to-teal-500",
      subtitle: "Total notes",
    },
    {
      title: "Pending Todos",
      value: pendingTodos,
      icon: CheckSquare,
      color: "from-orange-500 to-amber-500",
      subtitle: `${todos.length} total tasks`,
    },
    {
      title: "Curriculums",
      value: curriculums.length,
      icon: Layers,
      color: "from-pink-500 to-rose-500",
      subtitle: "Learning paths",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl p-6 border border-purple-500/20">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-slate-400">
          You've completed {completedCourses} courses with an average progress
          of {averageProgress}%
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Recent Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {course.category || "Uncategorized"}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8">
                      {course.progress}%
                    </span>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">
                  No courses yet. Create your first course!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckSquare className="h-5 w-5 text-orange-400" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todos
                .filter((t) => t.status !== "completed")
                .slice(0, 5)
                .map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        todo.priority === "high"
                          ? "bg-red-500"
                          : todo.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {todo.title}
                      </p>
                      {todo.dueDate && (
                        <p className="text-xs text-slate-400">
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              {todos.filter((t) => t.status !== "completed").length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">
                  All caught up! 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
