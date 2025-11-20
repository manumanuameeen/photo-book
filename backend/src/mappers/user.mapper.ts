import type { IUser } from "../model/userModel.ts";
import { UserResponseDto, UserProfileResponseDto, AuthResponseDto } from "../dto/user.dto.ts";

export class UserMapper {
  //this for admin

  static toUserResponse(user: IUser): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.role = user.role;
    dto.walletBalance = user.walletBalance;
    dto.isBlocked = user.isBlocked;
    return dto;
  }

  //this for user itsown profiles things
  static toProfileResponse(user: IUser): UserProfileResponseDto {
    const dto = new UserProfileResponseDto();
    dto.name = user.name;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.role = user.role;
    dto.walletBalance = user.walletBalance;
    return dto;
  }

  //this for user auth login signup
  static toAuthResponse(user: IUser): AuthResponseDto["user"] {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
