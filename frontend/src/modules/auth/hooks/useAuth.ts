import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import type {
  ILoginRequest,
  ISignupRequest,
  IVerifyOtpRequest,
  IAuthResponse,
  IForgetPassword,
  IResetPassword,
  IVerifyResetOtp
} from "../types/auth.types";

export function useSignup() {
  return useMutation<IAuthResponse, Error, ISignupRequest>({
    mutationFn: async(data) => {
      const res =await authService.signup(data)
      console.log("res in useAUth hook", res)
      return res;
    }
  });
}

export function useVerifyOtp() {
  return useMutation<IAuthResponse, Error, IVerifyOtpRequest>({
    mutationFn: (data) => authService.verifyOtp(data),
  });
}

export function useLogin() {
  return useMutation<IAuthResponse, Error, ILoginRequest>({
    mutationFn: (data) => {
      // console.log(data)
      return authService.login(data)
    }
    ,
  });
}

export function useResendOtp() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (email) => authService.resendOtp(email),
  });
}


export function useForgetPassword() {
  return useMutation<{ message: string }, Error, IForgetPassword>({
    mutationFn: (data) => authService.forgetPassword(data)
  })
}

export function useVerifyResetOtp() {
  return useMutation<{ message: string }, Error, IVerifyResetOtp>({
    mutationFn: (data) => authService.verifyResetOtp(data)
  })
}

export function useResetPassword() {
  return useMutation<{ message: string }, Error, IResetPassword>({
    mutationFn: (data) => authService.resetPassword(data)
  })
}
