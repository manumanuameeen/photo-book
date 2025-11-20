import { z } from "zod";

export const UpdateProfileDto = z.object({
  name: z.string().min(2).trim().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
});

export const ChangePasswordDto = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  phone!: string;
  role!: string;
  walletBalance!: number;
  isBlocked!: boolean;
  createdAt!: Date;
}

export class AuthResponseDto {
  user!: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class UserProfileResponseDto {
  name!: string;
  email!: string;
  phone!: string;
  role!: string;
  walletBalance!: number;
}

export type UpdateProfileDtoType = z.infer<typeof UpdateProfileDto>;
export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
