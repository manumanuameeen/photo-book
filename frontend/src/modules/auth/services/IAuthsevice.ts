import type { ISignupRequest, IAuthResponse, ILoginRequest, IVerifyOtpRequest, IForgetPassword, IVerifyResetOtp, IResetPassword } from "../types/auth.types";

export interface IAuthService {
  signup(data: ISignupRequest): Promise<IAuthResponse>;
  verifyOtp(data: IVerifyOtpRequest): Promise<IAuthResponse>;
  login(data: ILoginRequest): Promise<IAuthResponse>;
  getCurrentUser(): Promise<IAuthResponse | null>;
  forgetPassword(data:IForgetPassword): Promise<{ message: string }>
  verifyResetOtp(data:IVerifyResetOtp): Promise<{ message: string }>
  resetPassword(data:IResetPassword): Promise<{ message: string }>
}