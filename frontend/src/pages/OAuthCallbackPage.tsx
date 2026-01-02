import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Decode JWT to get user info (basic approach)
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          name: payload.email?.split("@")[0] || "User",
          provider: "oauth",
        });
      } catch {
        // If we can't decode, just set basic user
        setUser({
          id: 0,
          email: "user@example.com",
          name: "User",
          provider: "oauth",
        });
      }

      // Redirect to dashboard
      navigate("/", { replace: true });
    } else {
      // No tokens, redirect to login
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}
