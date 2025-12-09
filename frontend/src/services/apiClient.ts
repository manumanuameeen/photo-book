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
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];


apiClient.interceptors.request.use(
    async (config) => {
        const authState = useAuthStore.getState();
        
        if (!authState.user) {
            const cache = sessionStorage.getItem("auth-cache");
            if (cache) {
                try {
                    const { user, expires } = JSON.parse(cache);
                    if (Date.now() < expires) {
                        authState.setUser(user);
                    } else {
                        sessionStorage.removeItem("auth-cache");
                    }
                } catch (error) {
                    console.error("Error parsing auth cache:", error);
                    sessionStorage.removeItem("auth-cache");
                }
            }
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const original = error.config as ExtendedAxiosRequestConfig;

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
                
                if (data?.user) {
                    useAuthStore.getState().setUser(data.user as never);
                }
                
                return apiClient(original);
                
            } catch (err) {
                useAuthStore.getState().clearUser();
                sessionStorage.removeItem("auth-cache");
                
                const currentPath = window.location.pathname;
                if (!currentPath.includes(ROUTES.AUTH.LOGIN)) {
                    toast.error("Session expired. Please login again.");
                    router.navigate({ to: ROUTES.AUTH.LOGIN });
                }
                
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
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