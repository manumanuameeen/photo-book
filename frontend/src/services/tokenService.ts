import axios from "axios";
import { useAuthStore } from "../modules/auth/store/useAuthStore";

const rawClient = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    withCredentials: true,
});

export class TokenServise {
    
    async refreshAccessToken() {
        try {
            const res = await rawClient.post("/auth/refresh-token");
            
            if (res.data?.data?.user) {
                const cache = {
                    user: res.data.data.user,
                    expires: Date.now() + 5 * 60 * 1000, 
                };
                sessionStorage.setItem("auth-cache", JSON.stringify(cache));
            }
            
            return res.data;
        } catch (error) {
            sessionStorage.removeItem("auth-cache");
            throw error;
        }
    }

    async logout() {
        try {
            await rawClient.post("/auth/logout");
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            useAuthStore.getState().clearUser();
            sessionStorage.removeItem("auth-cache");
        }
    }
}

export const tokenService = new TokenServise();