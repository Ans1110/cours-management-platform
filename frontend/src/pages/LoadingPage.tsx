import { Loader2, BookOpen } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA]">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="w-16 h-16 bg-linear-to-br from-lime-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <BookOpen className="h-8 w-8 text-white" />
        </div>

        {/* Loading spinner */}
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />

        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
