import apiClient from "./apiClient";

export class TokenServise{
    
    async refreshAccessToken(){
        const res = await apiClient.post("/user/refresh")
        return res.data
    }

    async logout(){
        await apiClient.post("/user/logout");
        const {useAuthStore} = await import("../modules/auth/store/useAuthStore")
        useAuthStore.getState().clearUser();
    }

}

export const tokenService = new TokenServise()