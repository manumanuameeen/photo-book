import axiosInstance from "../../../services/axiosInstance";
import type{ IAuthServise } from "../../../store/IAuthServise";
import type{ ISignupPayload } from "../types/auth.types";
import type{ IAuthResponse } from "../types/auth.types";
import type{ ILoginPayload } from "../types/auth.types";
import type{ IVerifyOtpPayload } from "../types/auth.types";

class AuthService implements IAuthServise{
    async signup(data: ISignupPayload): Promise<IAuthResponse> {
        const res = await axiosInstance.post("/auth/signup",data);
        return res.data
    }

    async verifyOtp(data:IVerifyOtpPayload):Promise<IAuthResponse>{
        let res = await axiosInstance.post("/auth/verify-otp",data)
        return res.data
    }

    async login(data:ILoginPayload):Promise<IAuthResponse>{
        let res = await axiosInstance.post("/auth/login",data);
        return res.data
    }   
}

export const authService = new AuthService()