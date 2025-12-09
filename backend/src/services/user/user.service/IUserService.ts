import { UserProfileResponseDto } from "../../../dto/user.dto";
import type { UpdateProfileDtoType, ChangePasswordDtoType } from "../../../dto/user.dto";

export interface IUserService {
  getProfile(userId: string): Promise<UserProfileResponseDto>;
  updateProfile(userId: string, data: UpdateProfileDtoType): Promise<UserProfileResponseDto>;
  changePassword(userId: string, data: ChangePasswordDtoType): Promise<void>;
}
