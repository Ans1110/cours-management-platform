import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authApi } from "@/api/auth";
import { useSessionStore } from "@/stores/sessionStore";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          // Tokens are now stored in httpOnly cookies by the server
          // Set session expiration time
          if (response.expiresIn) {
            useSessionStore
              .getState()
              .setExpiresAt(Date.now() + response.expiresIn);
          }
          set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ email, password, name });
          // Tokens are now stored in httpOnly cookies by the server
          // Set session expiration time
          if (response.expiresIn) {
            useSessionStore
              .getState()
              .setExpiresAt(Date.now() + response.expiresIn);
          }
          set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          // Server clears httpOnly cookies
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Try to fetch current user - cookies will be sent automatically
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Not authenticated or token expired
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
