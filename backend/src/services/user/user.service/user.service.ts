import bcrypt from "bcrypt";
import {
  ChangePasswordDtoType,
  UpdateProfileDtoType,
  UserProfileResponseDto,
} from "../../../dto/user.dto.ts";
import { IPhotographerRepository } from "../../../interfaces/repositories/IPhotographerRepository.ts";
import { IUserRepository } from "../../../interfaces/repositories/IUserRepository.ts";
import { IUserService } from "../../../interfaces/services/IUserService.ts";
import { UserMapper } from "../../../mappers/user.mapper.ts";
import { AppError } from "../../../utils/AppError.ts";
import { HttpStatus } from "../../../constants/httpStatus.ts";
import { Messages } from "../../../constants/messages.ts";
import { S3FileService } from "../../external/S3FileService.ts";
import { NodeMailerService } from "../email/nodemailer.service.ts";
import { OtpService } from "../otp/otp.service.ts";

export class UserService implements IUserService {
  private readonly _userRespository: IUserRepository;
  private readonly _photographerRepository: IPhotographerRepository;

  constructor(userRepo: IUserRepository, photographerRepo: IPhotographerRepository) {
    this._userRespository = userRepo;
    this._photographerRepository = photographerRepo;
  }

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this._userRespository.findById(userId);
    if (!user) throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);

    const application = await this._photographerRepository.findByUserId(userId);
    const applicationStatus = application ? application.status : "NONE";
    const rejectionReason = application ? application.rejectionReason : undefined;
    const approvalMessage = application ? application.approvalMessage : undefined;

    return UserMapper.toProfileResponse(user, applicationStatus, rejectionReason, approvalMessage);
  }

  async updateProfile(userId: string, data: UpdateProfileDtoType): Promise<UserProfileResponseDto> {
    const user = await this._userRespository.findById(userId);

    if (!user) {
      throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.location !== undefined) user.location = data.location;
    if (data.lat !== undefined && data.lat !== null) user.lat = data.lat;
    if (data.lng !== undefined && data.lng !== null) user.lng = data.lng;

    const updatedUser = await this._userRespository.update(userId, user);

    if (!updatedUser) {
      throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);
    }

    return UserMapper.toProfileResponse(updatedUser);
  }

  async initiateChangePassword(userId: string): Promise<void> {
    const user = await this._userRespository.findById(userId);
    if (!user) throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);

    const otpService = new OtpService();
    const otp = otpService.generateOtp();
    const expiry = otpService.getOtpExpire();

    user.otp = otp;
    user.otpExpiry = expiry;
    await this._userRespository.update(userId, user);

    const mailer = new NodeMailerService();
    await mailer.sendOtp(user.email, otp, user.name);
  }

  async changePassword(userId: string, data: ChangePasswordDtoType): Promise<void> {
    const user = await this._userRespository.findById(userId);
    if (!user) throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);

    const otpService = new OtpService();
    if (!data.otp || !otpService.isOtpValidate(user.otp || "", data.otp, user.otpExpiry)) {
      throw new AppError(Messages.INVALID_OTP, HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password || "");
    if (!isMatch) throw new AppError(Messages.CURRENT_PASSWORD_INCORRECT, HttpStatus.BAD_REQUEST);

    const hashedPasswod = await bcrypt.hash(data.newPassword, 10);
    user.password = hashedPasswod;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await this._userRespository.update(userId, user);
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<string> {
    const user = await this._userRespository.findById(userId);
    if (!user) throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);

    const s3Service = new S3FileService();
    const imageUrl = await s3Service.uploadFile(file, "profile_images", userId);

    user.profileImage = imageUrl;
    await this._userRespository.update(userId, user);

    return imageUrl;
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const user = await this._userRespository.findById(userId);
    if (!user) throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);

    const otpService = new OtpService();
    if (!user.otp || !otpService.isOtpValidate(user.otp, otp, user.otpExpiry)) {
      throw new AppError(Messages.INVALID_OTP, HttpStatus.BAD_REQUEST);
    }
    return true;
  }
}

