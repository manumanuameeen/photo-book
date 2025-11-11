// import apiClient from "./apiClient";
import axios from "axios";

const rawClient = axios.create({
    baseURL:"http://localhost:5000/api",
    withCredentials:true,
})


export class TokenServise{
    
    async refreshAccessToken(){
        const res = await rawClient.post("/user/refresh-token")
        return res.data
    }

    async logout(){
        await rawClient.post("/user/logout");
        const {useAuthStore} = await import("../modules/auth/store/useAuthStore")
        useAuthStore.getState().clearUser();
    }

}

export const tokenService = new TokenServise()