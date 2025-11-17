
import apiClient from "../../../../services/apiClient";
import type{ ISignupRequest,IAuthResponse,ILoginRequest,IVerifyOtpRequest, IForgetPassword, IVerifyResetOtp, IResetPassword } from "../../types/auth.types";
import type {IAuthRespository} from "../interface/IAuthRepository"

export class AuthRepository implements IAuthRespository{
  async signup(data: ISignupRequest): Promise<IAuthResponse> {
    const res = await apiClient.post<IAuthResponse>("/user/signup", data);
    return res.data;
  }
  async verifyOtp(data: IVerifyOtpRequest): Promise<IAuthResponse> {
    const res = await apiClient.post<IAuthResponse>("/user/verify-otp", data);
    return res.data;
  }
  async login(data: ILoginRequest): Promise<IAuthResponse> {
    const res = await apiClient.post<IAuthResponse>("/user/login", data);
    // console.log("from authrespository",res.data)
    return res.data;

  }
  async resendOtp(email: string): Promise<{ message: string }> {
    console.log("from repo frontend",email)
    const res = await apiClient.post<{ message: string }>("/user/resend-otp",{email} );

    return res.data;
  }

  async logout(): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>("/user/logout");
    return res.data;
  }

   async forgetPassword(data:IForgetPassword): Promise<{ message: string; }> {
    const res  = await apiClient.post<{message:string}>("/user/forget-password",data)
    return res.data
  }

  async verifyResetOtp(data:IVerifyResetOtp): Promise<{ message: string; }> {
    const res = await apiClient.post<{message:string}>("/user/verify-reset-otp",data)
    return res.data
  }

  async resetPassword(data:IResetPassword): Promise<{ message: string; }> {
    const res = await apiClient.post<{message:string}>("/user/reset-password",data)
    return res.data
  }
}

export const authRepository = new AuthRepository();


