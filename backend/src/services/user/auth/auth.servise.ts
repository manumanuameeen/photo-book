import { UserRepositery } from "../../../repositories/implementaion/user/user.repositery.ts";

import type { IUser } from "model/userModel.ts";
import type { IUserRepository } from "../../../repositories/interface/IuserRepository.ts";
import redisClient from "../../../config/redis.ts";
import { createAccessToken,createRefreshToken } from "../../../utils/token.ts";
import { Otpservice } from "../otp/otp.service.ts";
import  { NodeMailerService } from "../email/nodemailer.service.ts";

export class AuthService {
  private userRepository: UserRepositery;
  private emailService: NodeMailerService;
  private otpService: Otpservice;

  constructor(
    userRepo: IUserRepository = new UserRepositery(),
    emailService: NodeMailerService,
    otpService: Otpservice = new Otpservice(),
  ) {
    this.userRepository = userRepo as UserRepositery;
    this.emailService = emailService;
    this.otpService = otpService;
  }

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
    const otpExpiry = this.otpService.getOtpExpire();
    await redisClient.setEx(
      `otp:${email}`,
      300,
      JSON.stringify({ name, email, password, phone, otp, otpExpiry }),
    );

    await this.emailService.sendOtp(email, otp, name);

    return {
      message: "OTP sent to email",
    };
  }

  async verifyOtp(email: string, otp: string) {
    const cachedData = await redisClient.get(`otp:${email}`);

    if (!cachedData) throw new Error("Otp expired or not found");

    const userData = JSON.parse(cachedData);
    const expiry = new Date(userData.otpExpiry);
    const isValid = this.otpService.isOtpValidate(userData.otp, otp, expiry);
    if (!isValid) throw new Error("Invalid OTP");

    const newUser = await this.userRepository.createUser({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
    });

    await redisClient.del(`otp:${email}`);
    await this.emailService.sendWelcomeEmail(newUser.email, newUser.name);

    return this.issueTokens(newUser);
  }

  async resendOtp(email: string) {
    const cachedData = await redisClient.get(`otp:${email}`);
    if (!cachedData) throw new Error("No signup data found. Please signup again.");

    const userData = JSON.parse(cachedData);
    const newOtp = this.otpService.generateOtp();

    await redisClient.setEx(`otp:${email}`, 300, JSON.stringify({ ...userData, otp: newOtp }));

    await this.emailService.sendOtp(email, newOtp, userData.name);
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
