import axios from "axios";

function getNormalizedApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) {
    return process.env.NODE_ENV === "production"
      ? "https://sportrise-backend.onrender.com/api"
      : "http://localhost:5000/api";
  }

  // Remove trailing slashes
  const cleanUrl = envUrl.replace(/\/+$/, "");

  // If already ends in /api, return as is
  if (cleanUrl.endsWith("/api")) {
    return cleanUrl;
  }

  // Otherwise append /api
  return `${cleanUrl}/api`;
}

export const API_BASE_URL = getNormalizedApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    if (!config.headers.Authorization) {
      const instToken = localStorage.getItem("sportrise_inst_token");
      const userToken = localStorage.getItem("sportrise_token");
      const isInstRoute =
        config.url?.includes("/institution") ||
        config.url?.includes("/events/create") ||
        config.url?.includes("/events/institution-events") ||
        config.url?.includes("/applications/institution-list");

      const token = isInstRoute ? (instToken || userToken) : (userToken || instToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Response interceptor for unified error extraction while preserving response metadata
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An unexpected error occurred.";
    const err = new Error(message);
    (err as any).response = error.response;
    (err as any).status = error.response?.status;
    return Promise.reject(err);
  }
);

export default api;
