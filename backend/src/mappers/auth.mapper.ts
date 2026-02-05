import type { SignupDtoType } from "../dto/auth.dto.ts";
import type { IUser } from "../model/userModel.ts";

export class AuthMapper {
  static toUserFromSignup(dto: SignupDtoType): Partial<IUser> {
    return {
      name: dto.name.trim(),
      email: dto.email.toLowerCase(),
      password: dto.password,
      phone: dto.phone,
      role: "user",
      status: "active",
      isBlocked: false,
      walletBalance: 0,
    };
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
}
