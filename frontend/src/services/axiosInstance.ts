import axios from "axios";
import { TokenServise } from "./tokenService";

const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_API_URL
    ,withCredentials:true
})


axiosInstance.interceptors.response.use(
    (res)=>res,
    async (error)=>{
        
        const originalRequest = error.config;
        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry  = true;
            
            try {
                await TokenServise.refreshAccessToken();
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error("Refresh failed. Logging out user...")

            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance

