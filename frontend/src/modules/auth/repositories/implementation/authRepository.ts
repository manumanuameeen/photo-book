
import apiClient from "../../../../services/apiClient";
import type { ISignupRequest, IAuthResponse, ILoginRequest, IVerifyOtpRequest } from "../../types/user.types";



export class AuthRepository {
    async signup(data: ISignupRequest): Promise<IAuthResponse> {
        const res = await apiClient.post<IAuthResponse>("/auth/signup", data);
        return res.data;
    }

    async verifyOtp(data: IVerifyOtpRequest): Promise<IAuthResponse> {
        const res = await apiClient.post<IAuthResponse>("/auth/verify-otp", data);
        return res.data;
    }

    async login(data: ILoginRequest): Promise<IAuthResponse> {
        const res = await apiClient.post<IAuthResponse>("/auth/login", data);
        return res.data;
    }
}

export const authRepository = new AuthRepository();

