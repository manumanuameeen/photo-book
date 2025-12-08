import { tokenService } from "./tokenService";
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { router } from "../router";
import toast from "react-hot-toast";
import { useAuthStore } from "../modules/auth/store/useAuthStore";
import { ROUTES } from "../constants/routes";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    withCredentials: true,
});

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<{ user?: unknown }> | null = null;

apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const original = error.config as ExtendedAxiosRequestConfig;

        if (status === 401 && original && !original._retry) {
            original._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = tokenService.refreshAccessToken()
                    .then((data) => {
                        if (data?.user) {
                            useAuthStore.getState().setUser(data.user as never);
                        }
                        return data;
                    })
                    .catch((err) => {
                        useAuthStore.getState().clearUser();
                        sessionStorage.removeItem("auth-cache");
                        throw err;
                    })
                    .finally(() => {
                        isRefreshing = false;
                        refreshPromise = null;
                    });
            }

            try {
                await refreshPromise;
                return apiClient(original);
            } catch (err) {
                const currentPath = window.location.pathname;
                if (!currentPath.includes(ROUTES.AUTH.LOGIN)) {
                    toast.error("Session expired. Please login again.");
                    router.navigate({ to: ROUTES.AUTH.LOGIN });
                }
                return Promise.reject(err);
            }
        }

        if (status === 403) {
            const message = (error.response?.data as { message?: string })?.message;
            toast.error(message || "Access denied.");

            if (message?.toLowerCase().includes('block')) {
                useAuthStore.getState().clearUser();
                sessionStorage.removeItem("auth-cache");
                router.navigate({ to: ROUTES.AUTH.LOGIN });
            }
        }

        if (error.response?.data) {
            const message = (error.response.data as { message?: string })?.message;
            if (message && status !== 401) {
                toast.error(message);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;