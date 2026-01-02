import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  BookOpen,
  FileText,
  CheckSquare,
  Layers,
  Home,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/courses", icon: BookOpen, label: "Courses" },
  { path: "/notes", icon: FileText, label: "Notes" },
  { path: "/todos", icon: CheckSquare, label: "Todos" },
  { path: "/curriculums", icon: Layers, label: "Schedule" },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-2xl shadow-md text-gray-600 hover:text-gray-900"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar - Icon only style like reference */}
      <aside
        className={`fixed left-0 top-0 h-full w-20 bg-white/80 backdrop-blur-xl border-r border-gray-100 transform transition-transform duration-300 z-40 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center py-6 gap-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title={item.label}
              >
                <item.icon size={22} />
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="pb-6 flex flex-col items-center gap-2">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings size={22} />
          </button>
          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
          {/* User Avatar */}
          <div className="mt-2 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:scale-105 transition-transform">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-20 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
