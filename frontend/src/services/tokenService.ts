import axios, { type AxiosResponse, AxiosError } from "axios";
import { useAuthStore } from "../modules/auth/store/useAuthStore";
import { router } from "../router";
import { ROUTES } from "../constants/routes";
import { authService } from "./api/auth.api";
import type { IAuthResponse } from "../modules/auth/types/auth.types";

const rawClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    withCredentials: true,
});


class TokenService {
    private refreshPromise: Promise<IAuthResponse> | null = null;
    private failureCount = 0;
    private readonly MAX_FAILURES = 3;

    async refreshAccessToken() {
        // Circuit breaker - stop trying if backend is dead
        if (this.failureCount >= this.MAX_FAILURES) {
            throw new Error('Auth service unavailable');
        }

        // Prevent concurrent refresh attempts
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = rawClient.post<IAuthResponse>("/auth/refresh-token")
            .then((res: AxiosResponse<IAuthResponse>) => {
                this.failureCount = 0; // Reset on success
                if (res.data?.data?.user) {
                    const cache = {
                        user: res.data.data.user,
                        expires: Date.now() + 5 * 60 * 1000,
                    };
                    sessionStorage.setItem("auth-cache", JSON.stringify(cache));
                }
                return res.data;
            })
            .catch((error: AxiosError) => {
                this.failureCount++;
                sessionStorage.removeItem("auth-cache");


                if (this.failureCount >= this.MAX_FAILURES) {
                    this.logout();
                }
                throw error;
            })
            .finally(() => {
                this.refreshPromise = null;
            });

        return this.refreshPromise;
    }

    async logout() {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            useAuthStore.getState().clearUser();
            sessionStorage.removeItem("auth-cache");
            router.navigate({ to: ROUTES.AUTH.LOGIN });
        }
    }
}

export const tokenService = new TokenService();