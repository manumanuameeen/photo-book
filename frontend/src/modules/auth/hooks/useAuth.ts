import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import type {
  ILoginRequest,
  ISignupRequest,
  IVerifyOtpRequest,
} from "../types/auth.types";
import type { IAuthResponse } from "../types/user.types";

export function useSignup() {
  return useMutation<IAuthResponse, Error, ISignupRequest>({
    mutationFn: (data) => authService.signup(data),
  });
}

export function useVerifyOtp() {
  return useMutation<IAuthResponse, Error, IVerifyOtpRequest>({
    mutationFn: (data) => authService.verifyOtp(data),
  });
}

export function useLogin() {
  return useMutation<IAuthResponse, Error, ILoginRequest>({
    mutationFn: (data) => authService.login(data),
  });
}

export function useResendOtp() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (email) => authService.resendOtp(email),
  });
}