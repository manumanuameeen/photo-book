import axios from "axios";
import { useAuthStore } from "../modules/auth/store/useAuthStore";
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
        useAuthStore.getState().clearUser();
    }

}

export const tokenService = new TokenServise()