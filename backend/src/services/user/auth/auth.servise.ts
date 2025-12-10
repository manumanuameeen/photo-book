import type { IUser } from "model/userModel.ts";
import type { IUserRepository } from "../../../repositories/interface/IUserRespository.ts";
import redisClient from "../../../config/redis.ts";
import { createAccessToken, createRefreshToken } from "../../../utils/token.ts";
import dotenv from "dotenv";
dotenv.config();
import type { IAuthService } from "./IAuthService.ts";
import type { IEmailService } from "../email/IEmailServise.ts";
import type { IOtpService } from "../otp/IOtpservice.ts";
import type {
  ForgetPasswordDtoType,
  LoginDtoType,
  ResendOtpDtoType,
  ResetPasswordDtoType,
  SignupDtoType,
  VerifyOtpDtoType,
} from "../../../dto/auth.dto.ts";
import { Messages } from "../../../constants/messages.ts";
import { AuthMapper } from "../../../mappers/auth.mapper.ts";
import bcrypt from "bcrypt";
import { tokenBlacklistService } from "../../token/tokenBalcklist.service.ts";
import jwt from "jsonwebtoken";
import logger from "../../../config/logger.ts";

export class AuthService implements IAuthService {
  private readonly _userRepo: IUserRepository;
  private readonly _emailService: IEmailService;
  private readonly _otpService: IOtpService;

  constructor(useRepo: IUserRepository, emailRepo: IEmailService, otpRepo: IOtpService) {
    this._userRepo = useRepo;
    this._emailService = emailRepo;
    this._otpService = otpRepo;
  }

  async signup(data: SignupDtoType) {
    const existingUser = await this._userRepo.findByEmail(data.email);
    if (existingUser) throw new Error(Messages.USER_EXISTS);

    const otp = this._otpService.generateOtp();
    console.log("signup OTP:", otp);
    const expiry = this._otpService.getOtpExpire();

    const userData = AuthMapper.toUserFromSignup(data);

    await redisClient.setEx(
      `otp:${data.email}`,
      Number.parseInt(process.env.OTP_EXPIRY_SECONDS || "120", 10),
      JSON.stringify({ ...userData, otp, expiry }),
    );

    await this._emailService.sendOtp(data.email, otp, data.name);

    return { message: Messages.OTP_SENT };
  }

  async verifyOtp(data: VerifyOtpDtoType) {
    const cached = await redisClient.get(`otp:${data.email}`);

    if (!cached) throw new Error(Messages.INVALID_OTP);

    const payload = JSON.parse(cached);
    const isValid = this._otpService.isOtpValidate(payload.otp, data.otp, payload.expiry);
    if (!isValid) throw new Error(Messages.INVALID_OTP);

    const user = await this._userRepo.create(payload);

    await redisClient.del(`otp:${data.email}`);
    await this._emailService.sendWelcomeEmail(user.email, user.name);

    return this._issueTokens(user);
  }

  async resendOtp(data: ResendOtpDtoType) {
    const cached = await redisClient.get(`otp:${data.email}`);
    if (!cached) throw new Error(Messages.USER_EXISTS);

    const payload = JSON.parse(cached);
    const newOtp = this._otpService.generateOtp();

    await redisClient.setEx(
      `otp:${data.email}`,
      Number(process.env.OTP_EXPIRY_SECONDS),
      JSON.stringify({ ...payload, otp: newOtp }),
    );
    await this._emailService.sendOtp(data.email, newOtp, payload.name);

    return { message: Messages.OTP_SENT };
  }

  async login(data: LoginDtoType) {
    const user = await this._userRepo.findByEmail(data.email);
    if (!user || !(await user.comparePassword(data.password)))
      throw new Error(Messages.INVALID_CREDENTIALS);
    if (user.isBlocked) throw new Error(Messages.USER_BLOCKED);

    return this._issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const userId = await redisClient.get(`rt:${refreshToken}`);
    if (!userId) throw new Error(Messages.INVALID_REFRESH_TOKEN);

    const user = await this._userRepo.findById(userId);
    if (!user || user.isBlocked) throw new Error(Messages.USER_BLOCKED);

    await redisClient.del(`rt:${refreshToken}`);
    return this._issueTokens(user);
  }

  async logout(refreshToken: string) {
    try {
      const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
      const expiresIn = decoded?.exp
        ? decoded.exp - Math.floor(Date.now() / 1000)
        : 7 * 24 * 60 * 60;

      await tokenBlacklistService.addToBlackList(refreshToken, expiresIn);
      await redisClient.del(`rt:${refreshToken}`);
    } catch (error) {
      logger.error("logout error", { error });
      throw new Error("Logout failed");
    }
  }

  async forgetPassword(data: ForgetPasswordDtoType): Promise<{ message: string }> {
    const user = await this._userRepo.findByEmail(data.email.trim());

    if (!user) {
      return { message: Messages.FORGET_PASSWORD_SENT };
    }

    const otp = this._otpService.generateOtp();
    const expiry = this._otpService.getOtpExpire();
    console.log("Generated reset OTP:", otp);

    await redisClient.setEx(
      `fp:${data.email.toLowerCase().trim()}`,
      300,
      JSON.stringify({ otp, expiry }),
    );
    await this._emailService.sendResetCode(data.email, otp, user.name);

    return { message: Messages.FORGET_PASSWORD_SENT };
  }

  async verifyResetOtp(data: VerifyOtpDtoType): Promise<{ message: string }> {
    const cached = await redisClient.get(`fp:${data.email.toLowerCase().trim()}`);
    if (!cached) throw new Error(Messages.INVALID_RESET_OTP);

    const payload = JSON.parse(cached);
    const isValid = this._otpService.isOtpValidate(payload.otp, data.otp, payload.expiry);
    if (!isValid) throw new Error(Messages.INVALID_RESET_OTP);

    await redisClient.setEx(`fp:verified:${data.email}`, 600, "true");
    await redisClient.del(`fp:${data.email}`);

    return { message: Messages.RESET_OTP_VERIFIED };
  }

  async resetPassword(data: ResetPasswordDtoType): Promise<{ message: string }> {
    const isVerified = await redisClient.get(`fp:verified:${data.email.toLowerCase().trim()}`);
    if (!isVerified) throw new Error(Messages.VERIFY_FIRST);

    const user = await this._userRepo.findByEmail(data.email.trim());
    if (!user) throw new Error(Messages.USER_NOTFOUND);

    const hashed = await bcrypt.hash(data.newPassword, 10);
    await this._userRepo.update(user.id!.toString(), { password: hashed });

    await redisClient.del(`fp:verified:${data.email.toLowerCase().trim()}`);
    return { message: Messages.PASSWORD_RESET_SUCCESS };
  }

  private async _issueTokens(user: IUser) {
    const accessToken = createAccessToken(user._id!.toString(), user.email, user.role);
    const refreshToken = createRefreshToken(user._id!.toString(), user.email, user.role);

    await redisClient.setEx(
      `rt:${refreshToken}`,
      Number(process.env.REFRESH_TOKEN_MAX_AGE),
      user._id!.toString(),
    );

    return { accessToken, refreshToken, user };
  }
}
