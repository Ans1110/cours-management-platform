import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useUpdateTodoStatus,
} from "@/hooks";
import { todoSchema, type TodoInput } from "@/schemas";
import type { Todo } from "@/types";

export default function TodosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: todos = [], isLoading } = useTodos();
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();
  const statusMutation = useUpdateTodoStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoInput>({
    resolver: zodResolver(todoSchema),
  });

  const openModal = (todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo);
      reset({
        title: todo.title,
        description: todo.description || "",
        priority: todo.priority,
        status: todo.status,
        dueDate: todo.dueDate?.split("T")[0] || "",
      });
    } else {
      setEditingTodo(null);
      reset({
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        dueDate: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTodo(null);
    reset();
  };

  const onSubmit = (data: TodoInput) => {
    if (editingTodo) {
      updateMutation.mutate(
        { id: editingTodo.id, data },
        { onSuccess: closeModal }
      );
    } else {
      createMutation.mutate(data, { onSuccess: closeModal });
    }
  };

  const toggleStatus = (todo: Todo) => {
    const nextStatus = todo.status === "completed" ? "pending" : "completed";
    statusMutation.mutate({ id: todo.id, status: nextStatus });
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    return todo.status === filter;
  });

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          dot: "bg-red-400",
          badge: "bg-red-100 text-red-700",
        };
      case "medium":
        return {
          dot: "bg-amber-400",
          badge: "bg-amber-100 text-amber-700",
        };
      default:
        return {
          dot: "bg-green-400",
          badge: "bg-green-100 text-green-700",
        };
    }
  };

  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const completedCount = todos.filter((t) => t.status === "completed").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
          <p className="text-gray-500 mt-1">Track your learning tasks</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-5 h-11"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Stats & Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <div className="pastel-orange-gradient rounded-2xl p-5 soft-shadow">
          <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-800">{todos.length}</p>
        </div>
        <div className="pastel-yellow-gradient rounded-2xl p-5 soft-shadow">
          <p className="text-gray-600 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
        </div>
        <div className="pastel-green-gradient rounded-2xl p-5 soft-shadow">
          <p className="text-gray-600 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-gray-800">{completedCount}</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 soft-shadow flex items-center">
          <Filter size={18} className="text-gray-400 mr-3" />
          <div className="flex gap-2 flex-1">
            {["all", "pending", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === status
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="bg-white rounded-3xl soft-shadow overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredTodos.map((todo) => {
            const priorityStyles = getPriorityStyles(todo.priority);
            return (
              <div
                key={todo.id}
                className={`p-5 hover:bg-gray-50 transition-colors ${
                  todo.status === "completed" ? "bg-gray-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleStatus(todo)}
                    className="shrink-0 mt-0.5 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {todo.status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className={`font-semibold text-gray-800 ${
                          todo.status === "completed"
                            ? "line-through text-gray-400"
                            : ""
                        }`}
                      >
                        {todo.title}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${priorityStyles.badge}`}
                      >
                        {todo.priority}
                      </span>
                    </div>
                    {todo.description && (
                      <p
                        className={`text-sm mb-2 ${
                          todo.status === "completed"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {todo.description}
                      </p>
                    )}
                    {todo.dueDate && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock size={14} />
                        <span>
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(todo)}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(todo.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTodos.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-gray-500 mb-4">
              {filter === "all"
                ? "No tasks yet. Create your first task!"
                : filter === "pending"
                ? "All caught up! No pending tasks."
                : "No completed tasks yet."}
            </p>
            {filter === "all" && (
              <Button
                onClick={() => openModal()}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl soft-shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTodo ? "Edit Task" : "New Task"}
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
                    placeholder="Task title"
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
                  <textarea
                    {...register("description")}
                    className="w-full h-20 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Task description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Priority
                    </Label>
                    <select
                      {...register("priority")}
                      className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Due Date
                    </Label>
                    <Input
                      type="date"
                      {...register("dueDate")}
                      className="bg-gray-50 border-gray-200 rounded-xl h-11"
                    />
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
                    className="flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingTodo ? (
                      "Save Changes"
                    ) : (
                      "Create Task"
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
