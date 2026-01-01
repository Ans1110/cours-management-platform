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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      updateMutation.mutate({ id: editingTodo.id, data });
    } else {
      createMutation.mutate(data);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Todos</h1>
          <p className="text-slate-400">Track your learning tasks</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {["all", "pending", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Todo
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTodos.map((todo) => (
          <Card
            key={todo.id}
            className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 ${
              todo.status === "completed" ? "opacity-60" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleStatus(todo)}
                  className="flex-shrink-0 text-slate-400 hover:text-orange-400 transition-colors"
                >
                  {todo.status === "completed" ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-medium text-white ${
                        todo.status === "completed"
                          ? "line-through text-slate-400"
                          : ""
                      }`}
                    >
                      {todo.title}
                    </h3>
                    <div
                      className={`w-2 h-2 rounded-full ${getPriorityColor(
                        todo.priority
                      )}`}
                    />
                  </div>
                  {todo.description && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                      {todo.description}
                    </p>
                  )}
                  {todo.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                      <Clock size={12} />
                      {new Date(todo.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(todo)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(todo.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTodos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">
            {filter === "all"
              ? "No todos yet. Create your first task!"
              : `No ${filter} tasks`}
          </p>
          {filter === "all" && (
            <Button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-orange-500 to-amber-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Todo
            </Button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {editingTodo ? "Edit Todo" : "New Todo"}
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
                    placeholder="Task title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-400">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Description</Label>
                  <textarea
                    {...register("description")}
                    className="w-full h-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white resize-none"
                    placeholder="Task description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Priority</Label>
                    <select
                      {...register("priority")}
                      className="w-full h-10 px-3 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Due Date</Label>
                    <Input
                      type="date"
                      {...register("dueDate")}
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
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingTodo ? (
                      "Save Changes"
                    ) : (
                      "Create Todo"
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
