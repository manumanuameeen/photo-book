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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      })

      if(!res.ok){
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
