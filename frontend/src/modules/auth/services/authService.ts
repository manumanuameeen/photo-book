import { authRepository } from "../repositories/implementation/authRepository";
import type { ISignupRequest, IAuthResponse, ILoginRequest, IVerifyOtpRequest } from "../types/auth.types";

class AuthService {
  async signup(data: ISignupRequest): Promise<IAuthResponse> {
    return authRepository.signup(data);
  }
  async verifyOtp(data: IVerifyOtpRequest): Promise<IAuthResponse> {
    return authRepository.verifyOtp(data);
  }
  async login(data: ILoginRequest): Promise<IAuthResponse> {
    return authRepository.login(data);
  }
  async resendOtp(email: string): Promise<{ message: string }> {
    return authRepository.resendOtp(email);
  }
}
export const authService = new AuthService();
