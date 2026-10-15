import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

/**
 * Resolves media/evidence URLs into absolute URLs.
 * Handles relative paths (/uploads/...) pointing to the Render backend in production.
 */
export function getMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : process.env.NODE_ENV === "production"
      ? "https://sportrise-backend.onrender.com"
      : "http://localhost:5000");

  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase.replace(/\/+$/, "")}${cleanPath}`;
}
