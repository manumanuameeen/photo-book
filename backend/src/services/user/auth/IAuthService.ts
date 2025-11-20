import type {
  SignupDtoType,
  LoginDtoType,
  VerifyOtpDtoType,
  ResendOtpDtoType,
  ForgetPasswordDtoType,
  ResetPasswordDtoType,
} from "../../../dto/auth.dto.ts";
import type { IUser } from "../../../model/userModel.ts";

export interface IAuthService {
  signup(data: SignupDtoType): Promise<{ message: string }>;
  verifyOtp(
    data: VerifyOtpDtoType,
  ): Promise<{ accessToken: string; refreshToken: string; user: IUser }>;
  resendOtp(data: ResendOtpDtoType): Promise<{ message: string }>;
  login(data: LoginDtoType): Promise<{ accessToken: string; refreshToken: string; user: IUser }>;
  refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: IUser }>;
  logout(refreshToken: string): Promise<void>;
  forgetPassword(data: ForgetPasswordDtoType): Promise<{ message: string }>;
  verifyResetOtp(data: VerifyOtpDtoType): Promise<{ message: string }>;
  resetPassword(data: ResetPasswordDtoType): Promise<{ message: string }>;
}
