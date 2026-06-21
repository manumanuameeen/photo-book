import { z } from "zod";

export const UpdateProfileDto = z.object({
  name: z.string().min(2).trim().optional(),
  phone: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), "Phone number can only contain digits.")
    .refine((value) => value.length === 10, "Phone number must be exactly 10 digits.")
    .optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
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
  _id!: string;
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
    _id: string;
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export class UserProfileResponseDto {
  name!: string;
  email!: string;
  phone!: string;
  role!: string;
  walletBalance!: number;
  bio?: string;
  location?: string;
  lat?: number;
  lng?: number;
  profileImage?: string;
  applicationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NONE";
  rejectionReason?: string;
  approvalMessage?: string;
  createdAt!: Date;
}

export type UpdateProfileDtoType = z.infer<typeof UpdateProfileDto>;
export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
