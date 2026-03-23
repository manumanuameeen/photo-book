import type { IUser } from "../models/user.model";
import { UserResponseDto, UserProfileResponseDto, AuthResponseDto } from "../dto/user.dto";

export class UserMapper {
  static toUserResponse(user: IUser): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.phone = user.phone || "";
    dto.role = user.role;
    dto.walletBalance = user.walletBalance;
    dto.isBlocked = user.isBlocked;
    return dto;
  }

  static toProfileResponse(
    user: IUser,
    applicationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NONE",
    rejectionReason?: string,
    approvalMessage?: string,
  ): UserProfileResponseDto {
    const dto = new UserProfileResponseDto();
    dto.name = user.name;
    dto.email = user.email;
    dto.phone = user.phone || "";
    dto.role = user.role;
    dto.walletBalance = user.walletBalance;
    dto.bio = user.bio;
    dto.location = user.location;
    dto.lat = user.lat;
    dto.lng = user.lng;
    dto.profileImage = user.profileImage;
    dto.applicationStatus = applicationStatus || "NONE";
    dto.rejectionReason = rejectionReason;
    dto.approvalMessage = approvalMessage;
    dto.createdAt = user.createdAt;
    return dto;
  }

  static toAuthResponse(user: IUser): AuthResponseDto["user"] {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
