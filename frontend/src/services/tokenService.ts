import axiosInstance from "./axiosInstance";


 export const TokenServise={
    async refreshAccessToken(){
        try {
            const {data} = await axiosInstance.get("/auth/refresh-token")
            return data;
        } catch (error) {
            console.error("ERROR refreshing access Token",error)
            throw error;
        }
    }
 }