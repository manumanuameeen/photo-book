import { tokenService } from "./tokenService";
import axios from "axios";
import { router } from "../main";
import toast from "react-hot-toast";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
});


let isRefreshing = false;
let refreshPromise: any = null;

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error.response?.status;
        const original = error.config;

        if (status === 401 && original && !original._retry) {
            original._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = tokenService.refreshAccessToken()
                    .finally(() => {
                        isRefreshing = false;
                    });
            }

            try {
                const data = await refreshPromise;
                if (data?.user) {
                    const { useAuthStore } = await import("../modules/auth/store/useAuthStore");
                    useAuthStore.getState().setUser(data.user);
                }
                return apiClient(original);
            } catch (err) {
                await tokenService.logout();
                toast.error("Session expired. Please login again.");
                router.navigate({ to: "/auth/login" });
                return Promise.reject(err);
            }
        }

        if (status === 403) {
            toast.error(error.response?.data?.message || "Access denied.");
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;