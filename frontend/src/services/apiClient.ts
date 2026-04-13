import { tokenService } from "./tokenService";
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { router } from "../router";
import { toast } from "sonner";
import { useAuthStore } from "../modules/auth/store/useAuthStore";
import { ROUTES } from "../constants/routes";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    skipToast?: boolean; // Option to skip automatic error toasting
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000/api/v1" : "/api/v1"),
    withCredentials: true,
});

let isRefreshing = false;
const failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

apiClient.interceptors.request.use(
    async (config) => {
        // Auth state is managed via Zustand and persistence
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const original = error.config as CustomAxiosRequestConfig;
        const currentPath = window.location.pathname;
        const isAuthRoute = currentPath.includes('/auth');

        if (status === 401 && original && !original._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(original))
                    .catch(err => Promise.reject(err));
            }

            original._retry = true;
            isRefreshing = true;

            try {
                const data = await tokenService.refreshAccessToken();
                if (data?.data.user) {
                    useAuthStore.getState().setUser(data.data.user as never, data.data.accessToken || useAuthStore.getState().accessToken || "", true);
                }
                failedQueue.forEach(prom => prom.resolve());
                failedQueue.length = 0;
                return apiClient(original);
            } catch (err) {
                failedQueue.forEach(prom => prom.reject(err));
                failedQueue.length = 0;

                const wasAuthenticated = useAuthStore.getState().isAuthenticated;
                useAuthStore.getState().clearUser();
                sessionStorage.removeItem("auth-cache");

                // Only show session expired if we're not on an auth route and were previously logged in
                if (!isAuthRoute && wasAuthenticated && !original.skipToast) {
                    toast.error("Session expired. Please login again.", { id: "session-expired" });
                }

                if (!isAuthRoute) {
                    router.navigate({ to: ROUTES.AUTH.LOGIN });
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle blocked users
        if (status === 403) {
            const message = (error.response?.data as { message?: string })?.message || "Access denied.";
            if (!original.skipToast) {
                toast.error(message, { id: message });
            }

            if (message?.toLowerCase().includes('block')) {
                useAuthStore.getState().clearUser();
                sessionStorage.removeItem("auth-cache");
                router.navigate({ to: ROUTES.AUTH.LOGIN });
            }
        }

        // Global error toasting
        if (error.response?.data && status !== 401 && !original.skipToast) {
            const message = (error.response.data as { message?: string })?.message;
            if (message) {
                toast.error(message, { id: message });
            }
        } else if (!error.response && !original.skipToast) {
            toast.error("Network error. Please check your connection.", { id: "network-error" });
        }

        return Promise.reject(error);
    }
);

export default apiClient;