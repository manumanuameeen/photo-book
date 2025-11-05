import { UserRepositery } from "../../repositories/implementaion/user.repositery.ts";
import type { IUser } from "../../model/userModel.ts";
import type { IUserRepository } from "../../repositories/interface/IuserRepository.ts";
import redisClient from "../../config/redis.ts";
import { createAccessToken, createRefreshToken } from "../../utils/token.ts";
import { Otpservice } from "../opt/otp.service.ts"
import type { IEmailservice } from "../email/IEmail.servise.ts";


export class AuthService {
  private userRepository: UserRepositery;
  private emailService: IEmailservice;
  private otpService: Otpservice;

  constructor(
    userRepo: IUserRepository = new UserRepositery(),
    emailService: IEmailservice,
    otpService: Otpservice = new Otpservice(),
  ) {
    this.userRepository = userRepo as UserRepositery;
    this.emailService = emailService;
    this.otpService = otpService;
  }

  // private async sendOtp(email: string, otp: string): Promise<void> {
  //   console.log(`OTP for ${email}: ${otp}`);
  // }

  async signup(data: Partial<IUser>) {
    const { name, email, password, phone } = data;

    if (!name || !email || !password || !phone) {
      throw new Error("All fields are required");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const otp = this.otpService.generateOtp();
    const otpExpires = this.otpService.getOtpExpire();

    const newUser = await this.userRepository.createUser({
      name,
      email,
      password,
      phone,
      otp,
      otpExpires,
    });

    await this.emailService.sendOtp(email, otp, name);

    return {
      message: "OTP sent to email",
      user: {
        _id: newUser._id?.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    const isValid = this.otpService.isOtpValidate(user.otp!, otp, user.otpExpires);
    if (!isValid) {
      throw new Error("Invalid or Exipired OTP .Please request a new one");
    }

    await this.userRepository.updateUser(user._id!.toString(), {
      otp: undefined,
      otpExpires: undefined,
    });

    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return this.issueTokens(user);
  }

  async resendOtp(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = this.otpService.generateOtp();
    const otpExpires = this.otpService.getOtpExpire();

    await this.userRepository.updateUser(user._id!.toString(), {
      otp,
      otpExpires,
    });
    await this.emailService.sendOtp(email, otp, user.name);
    return { message: "New OTP sent to your email" };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const match = await user.comparePassword(password);
    if (!match) throw new Error("Invalid credentials");

    return this.issueTokens(user);
  }

  async refresh(oldRefreshToken: string) {
    const storedId = await redisClient.get(`rt:${oldRefreshToken}`);
    if (!storedId) throw new Error("Invalid refresh token");

    const user = await this.userRepository.findById(storedId);
    if (!user) throw new Error("User not found");

    await redisClient.del(`rt:${oldRefreshToken}`);
    const { accessToken, refreshToken } = this.issueTokens(user);
    await redisClient.setEx(`rt:${refreshToken}`, 7 * 24 * 60 * 60, user._id!.toString());

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    await redisClient.del(`rt:${refreshToken}`);
  }

  private issueTokens(user: IUser) {
    const accessToken = createAccessToken(user._id!.toString());
    const refreshToken = createRefreshToken(user._id!.toString());
    redisClient.setEx(`rt:${refreshToken}`, 7 * 24 * 60 * 60, user._id!.toString());
    return { accessToken, refreshToken, user };
  }
}
