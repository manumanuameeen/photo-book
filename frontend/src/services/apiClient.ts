import { tokenService } from "./tokenService";
import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (!original) return Promise.reject(error);

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const data = await tokenService.refreshAccessToken();
                if (data?.user) {
                    const { useAuthStore } = await import("../modules/auth/store/useAuthStore");
                    useAuthStore.getState().setUser(data.user);
                }
                return apiClient(original);
            } catch (err) {
                await tokenService.logout();
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);
export default apiClient;