import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";

import MainLayout from "@/layouts/MainLayout";
import LoadingPage from "@/pages/LoadingPage";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { SessionExpiryModal } from "@/components/common/SessionExpiryModal";
import { useAuthStore } from "@/stores/authStore";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CoursesPage = lazy(() => import("@/pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("@/pages/CourseDetailPage"));
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const NoteDetailPage = lazy(() => import("@/pages/NoteDetailPage"));
const TodosPage = lazy(() => import("@/pages/TodosPage"));
const CurriculumsPage = lazy(() => import("@/pages/CurriculumsPage"));
const OAuthCallbackPage = lazy(() => import("@/pages/OAuthCallbackPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading while checking auth to prevent redirect loops
  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
          }
        />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="notes/:id" element={<NoteDetailPage />} />
          <Route path="todos" element={<TodosPage />} />
          <Route path="curriculums" element={<CurriculumsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <SessionExpiryModal />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
