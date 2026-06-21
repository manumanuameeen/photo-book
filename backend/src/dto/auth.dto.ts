import { z } from "zod";
import { Messages } from "../constants/messages";

export const SignupDto = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      "Use 8+ characters with uppercase, lowercase, number, and symbol.",
    ),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .refine((value) => /^\d+$/.test(value), "Phone number can only contain digits.")
    .refine((value) => value.length === 10, "Phone number must be exactly 10 digits."),
});

export const LoginDto = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string(),
});

export const UpdateReviewDto = z
  .object({
    comment: z.string().min(1, "Comment cannot be empty").optional(),
    rating: z.number().min(1).max(5, "Rating must be between 1 and 5").optional(),
  })
  .refine((data) => data.comment !== undefined || data.rating !== undefined, {
    message: "At least comment or rating must be provided",
  });

export const VerifyOtpDto = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  otp: z.string().length(6, "Enter the 6-digit OTP."),
});

export const ResendOtpDto = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
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
    newPassword: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Use 8+ characters with uppercase, lowercase, number, and symbol.",
      ),
    confirmPassword: z.string().min(1, "Confirm your password."),
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
