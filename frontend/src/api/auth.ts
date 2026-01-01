import apiClient from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types";

export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/login", data);
  },

  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/register", data);
  },

  logout: (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/logout");
  },

  refresh: (refreshToken: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>("/auth/refresh", { refreshToken });
  },

  me: (): Promise<User> => {
    return apiClient.get<User>("/auth/me");
  },
};

export default authApi;
