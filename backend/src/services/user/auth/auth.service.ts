import type { IUser } from "../../../models/user.model";
import type { IUserRepository } from "../../../interfaces/repositories/IUserRepository";
import { AppError } from "../../../utils/AppError";
import { HttpStatus } from "../../../constants/httpStatus";
import redisClient from "../../../config/redis";
import { createAccessToken, createRefreshToken } from "../../../utils/token";
import dotenv from "dotenv";
dotenv.config();
import type { IAuthService } from "../../../interfaces/services/IAuthService";
import type { IEmailService } from "../../../interfaces/services/IEmailService";
import type { IOtpService } from "../otp/IOtpservice";
import type {
  ForgetPasswordDtoType,
  LoginDtoType,
  ResendOtpDtoType,
  ResetPasswordDtoType,
  SignupDtoType,
  VerifyOtpDtoType,
} from "../../../dto/auth.dto";
import type { IWalletService } from "../../../interfaces/services/IWalletService";
import { Messages } from "../../../constants/messages";
import { AuthMapper } from "../../../mappers/auth.mapper";
import bcrypt from "bcrypt";
import logger from "../../../config/logger";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "../../../constants/env";

export class AuthService implements IAuthService {
  private readonly _userRepo: IUserRepository;
  private readonly _emailService: IEmailService;
  private readonly _otpService: IOtpService;
  private readonly _walletService: IWalletService;

  constructor(
    useRepo: IUserRepository,
    emailRepo: IEmailService,
    otpRepo: IOtpService,
    walletService: IWalletService,
  ) {
    this._userRepo = useRepo;
    this._emailService = emailRepo;
    this._otpService = otpRepo;
    this._walletService = walletService;
  }

  async signup(data: SignupDtoType) {
    const existingUser = await this._userRepo.findByEmail(data.email);
    if (existingUser) throw new Error(Messages.USER_EXISTS);

    
    const pendingSignup = await redisClient.get(`otp:${data.email}`);
    if (pendingSignup) {
      throw new AppError(
        "Signup already in progress. Check your email or wait for the OTP to expire.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = this._otpService.generateOtp();
    const expiry = this._otpService.getOtpExpire();

    const userData = AuthMapper.toUserFromSignup(data);

    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const safeUserData = { ...userData, password: hashedPassword };

    try {
      await redisClient.setEx(
        `otp:${data.email}`,
        Number.parseInt(process.env.OTP_EXPIRY_SECONDS || "120", 10),
        JSON.stringify({ ...safeUserData, otp, expiry }),
      );

      await this._emailService.sendOtp(data.email, otp, data.name);
      return { message: Messages.OTP_SENT };
    } catch (error) {
      
      await redisClient.del(`otp:${data.email}`);
      throw error;
    }
  }

  async verifyOtp(data: VerifyOtpDtoType) {
    const cached = await redisClient.get(`otp:${data.email}`);

    if (!cached) throw new Error(Messages.INVALID_OTP);

    const payload = JSON.parse(cached);
    const isValid = this._otpService.isOtpValidate(payload.otp, data.otp, payload.expiry);
    if (!isValid) throw new Error(Messages.INVALID_OTP);

    
    const user = await this._userRepo.create(payload);

    try {
      await this._walletService.ensureWalletExists(String(user._id), user.role);
    } catch (error) {
      logger.error("Failed to create wallet for user:", { userId: user._id, error });
    }

    await redisClient.del(`otp:${data.email}`);
    await this._emailService.sendWelcomeEmail(user.email, user.name);

    return this._issueTokens(user);
  }

  async resendOtp(data: ResendOtpDtoType) {
    const cached = await redisClient.get(`otp:${data.email}`);
    if (!cached) throw new Error(Messages.SIGNUP_REQUEST_EXPIRED);

    const payload = JSON.parse(cached);
    const newOtp = this._otpService.generateOtp();

    await redisClient.setEx(
      `otp:${data.email}`,
      Number(process.env.OTP_EXPIRY_SECONDS || 120),
      JSON.stringify({ ...payload, otp: newOtp }),
    );
    await this._emailService.sendOtp(data.email, newOtp, payload.name);

    return { message: Messages.OTP_SENT };
  }

  async login(data: LoginDtoType) {
    const user = await this._userRepo.findByEmail(data.email);
    if (!user) throw new Error(Messages.USER_ACCOUNT_NOT_FOUND);

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) throw new Error(Messages.INVALID_CREDENTIALS);

    if (user.isBlocked) throw new Error(Messages.USER_BLOCKED);

    try {
      await this._walletService.ensureWalletExists(String(user._id), user.role);
    } catch (err) {
      console.error("Error creating wallet on login", err);
    }

    return this._issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const userId = await redisClient.get(`rt:${refreshToken}`);
    if (!userId) {
      throw new AppError(Messages.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const user = await this._userRepo.findById(userId);
    if (!user) {
      await redisClient.del(`rt:${refreshToken}`);
      throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);
    }

    if (user.isBlocked) {
      await redisClient.del(`rt:${refreshToken}`);
      throw new AppError(Messages.USER_BLOCKED, HttpStatus.FORBIDDEN);
    }

    
    
    const GRACE_PERIOD_SECONDS = 30;
    await redisClient.expire(`rt:${refreshToken}`, GRACE_PERIOD_SECONDS);

    return this._issueTokens(user);
  }

  async logout(refreshToken: string) {
    try {
      
      
      await redisClient.del(`rt:${refreshToken}`);
      logger.info("User logged out successfully");
    } catch (error) {
      logger.error("logout error", { error });
      
    }
  }

  async forgetPassword(data: ForgetPasswordDtoType): Promise<{ message: string }> {
    const user = await this._userRepo.findByEmail(data.email.trim());

    if (!user) {
      throw new AppError(Messages.EMAIL_NOT_FOUND, HttpStatus.NOT_FOUND);
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

  async googleLogin(token: string) {
    console.log("🚀 Starting Google Login verification...");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      console.error("❌ Google Token missing email payload");
      throw new Error("Invalid Google Token");
    }
    console.log("✅ Google payload verified for:", payload.email);

    let user = await this._userRepo.findByEmail(payload.email);
    if (!user) {
      const userData = {
        name: payload.name || "Google User",
        email: payload.email,
        authProvider: "google" as const,
        role: "user" as const,
        isBlocked: false,
        walletBalance: 0,
        status: "active" as const,
        profileImage: payload.picture,
        phone: "",
      };

      user = await this._userRepo.create(userData);

      try {
        await this._walletService.ensureWalletExists(String(user._id), user.role);
      } catch (error) {
        console.error("Failed to create wallet for google user:", user._id, error);
      }

      await this._emailService.sendWelcomeEmail(user.email, user.name);
    } else if (user.authProvider !== "google") {
      
      
      logger.info("Local user logging in via Google - allowing authentication merge.");
    }

    if (user.isBlocked) throw new Error(Messages.USER_BLOCKED);

    return this._issueTokens(user);
  }

  private async _issueTokens(user: IUser) {
    const accessToken = createAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });
    const refreshToken = createRefreshToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    
    const expirySeconds = Math.floor(ENV.REFRESH_TOKEN_MAX_AGE / 1000);

    await redisClient.setEx(`rt:${refreshToken}`, expirySeconds, String(user._id));

    return { accessToken, refreshToken, user };
  }
}
