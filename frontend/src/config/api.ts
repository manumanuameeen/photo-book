export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api/v1"
    : "/api/v1");

export const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  API_BASE_URL.replace(/\/api\/v1\/?$/, "");
