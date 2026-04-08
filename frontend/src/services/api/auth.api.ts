import { authRepository } from "@/modules/auth/repositories/implementation/authRepository";
import type { ISignupRequest, IAuthResponse, ILoginRequest, IVerifyOtpRequest, IForgetPassword, IVerifyResetOtp, IResetPassword } from "@/modules/auth/types/auth.types";
import type { IAuthService } from "@/interfaces/services/IAuthService";

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

  async forgetPassword(data: IForgetPassword): Promise<{ message: string; }> {
    return authRepository.forgetPassword(data);
  }

  async verifyResetOtp(data: IVerifyResetOtp): Promise<{ message: string; }> {
    return authRepository.verifyResetOtp(data)
  }

  async resetPassword(data: IResetPassword): Promise<{ message: string; }> {
    return authRepository.resetPassword(data)
  }

  async googleLogin(token: string): Promise<IAuthResponse> {
    return authRepository.googleLogin(token);
  }

  async getCurrentUser(): Promise<IAuthResponse | null> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000/api/v1" : "/api/v1");
      const res = await fetch(`${baseUrl}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      })

      if (!res.ok) {
        return null
      }

      return await res.json();
    } catch (error: unknown) {
      console.log("Error in refreshing Token", error);
      return null;
    }

  }
}
export const authService = new AuthService();
