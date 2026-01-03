const API_BASE_URL = `${
  import.meta.env.VITE_API_BASE_URL || window.location.origin
}/api/v1`;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { body, headers = {}, skipAuth = false, ...rest } = options;

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...rest,
      headers: requestHeaders,
      credentials: "include", // Send cookies with requests
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && !skipAuth) {
      // Try to refresh token (with mutex to prevent race conditions)
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry the request
        return this.request(endpoint, options);
      }
      // Redirect to login
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "Request failed");
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private async tryRefreshToken(): Promise<boolean> {
    // Use mutex to prevent concurrent refresh requests
    if (this.isRefreshing) {
      return this.refreshPromise!;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefreshToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send refresh token cookie
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  get<T>(endpoint: string, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", skipAuth });
  }

  post<T>(endpoint: string, body?: unknown, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, skipAuth });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (response.status === 401) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry the request
        return this.postFormData(endpoint, formData);
      }
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || "Upload failed");
    }

    return response.json();
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
