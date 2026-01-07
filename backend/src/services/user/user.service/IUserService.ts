import { UserProfileResponseDto } from "../../../dto/user.dto";
import type { UpdateProfileDtoType, ChangePasswordDtoType } from "../../../dto/user.dto";

export interface IUserService {
  getProfile(userId: string): Promise<UserProfileResponseDto>;
  updateProfile(userId: string, data: UpdateProfileDtoType): Promise<UserProfileResponseDto>;
  changePassword(userId: string, data: ChangePasswordDtoType): Promise<void>;
  initiateChangePassword(userId: string): Promise<void>;
  verifyOtp(userId: string, otp: string): Promise<boolean>;
  uploadProfileImage(userId: string, file: Express.Multer.File): Promise<string>;
}
