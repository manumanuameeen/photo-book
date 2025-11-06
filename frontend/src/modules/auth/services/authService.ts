import { authRepository } from "../repositories/implementation/authRepository";
import type { ISignupRequest, IAuthResponse, ILoginRequest, IVerifyOtpRequest } from "../types/auth.types";
import type { IAuthService } from "./IAuthsevice";

class AuthService implements IAuthService {
  async signup(data: ISignupRequest): Promise<IAuthResponse> {
  return authRepository.signup(data)
  }

  async verifyOtp(data: IVerifyOtpRequest): Promise<IAuthResponse> {
  return authRepository.verifyOtp(data)
  }

  async login(data: ILoginRequest): Promise<IAuthResponse> {
   return authRepository.login(data)
  }
}

export const authService = new AuthService();