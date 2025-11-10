import apiClient from "../../../services/apiClient";
import { authRepository } from "../repositories/implementation/authRepository";
import type { ISignupRequest, IAuthResponse, ILoginRequest, IVerifyOtpRequest } from "../types/auth.types";
import type { IAuthService } from "./IAuthsevice";

class AuthService implements IAuthService {
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
  async logout(): Promise<{ message: string }> {
    return authRepository.logout();
  }

  async getCurrentUser(): Promise<IAuthResponse | null> {
    try {
      const res = await apiClient.post<IAuthResponse>("/user/refresh-token");
      return res.data;
    } catch (error: unknown) {
      console.log("Error in refreshing Token", error);
      return null;
    }

  }
}
export const authService = new AuthService();
