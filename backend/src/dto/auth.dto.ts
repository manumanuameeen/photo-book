import { string, z } from "zod";
import { Messages } from "../constants/messages.ts";

export const SignupDto = z.object({
  name: z.string().min(2).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  phone: z.string().regex(/^\d{10}$/),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const VerifyOtpDto = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const ResendOtpDto = z.object({
  email: z.string().email(),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const ForgetPasswordDto = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export const VerifyResetOtpDto = z.object({
  email: z.string().email().toLowerCase(),
  otp: z.string().length(6),
});

export const ResetPasswordDto = z
  .object({
    email: z.string().email().toLowerCase(),
    newPassword: string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: Messages.PASSWORDS_DONT_MATCH,
    path: ["confirmPassword"],
  });

export type SignupDtoType = z.infer<typeof SignupDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;
export type VerifyOtpDtoType = z.infer<typeof VerifyOtpDto>;
export type ResendOtpDtoType = z.infer<typeof ResendOtpDto>;
export type RefreshTokenDtoType = z.infer<typeof RefreshTokenDto>;
export type ForgetPasswordDtoType = z.infer<typeof ForgetPasswordDto>;
export type VerifyResetOtpDtoType = z.infer<typeof VerifyResetOtpDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
