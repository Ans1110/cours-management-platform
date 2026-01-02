import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/api/auth";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeOAuthLogin = async () => {
      try {
        // Cookies are already set by the backend, just fetch user info
        const user = await authApi.me();
        setUser(user);
        navigate("/", { replace: true });
      } catch {
        setError("Failed to complete sign in. Please try again.");
        // Redirect to login after a delay
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    };

    completeOAuthLogin();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-500 text-lg mb-2">{error}</p>
            <p className="text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-gray-700 text-lg">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
