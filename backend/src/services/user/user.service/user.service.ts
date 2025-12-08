import { ChangePasswordDtoType, UpdateProfileDtoType, UserProfileResponseDto } from "dto/user.dto";
import type { IUserSerivice } from "./IUserService.ts";
import type { IUserRepository } from "../../../repositories/interface/IUserRespository";
import type { IPhotographerRepository } from "../../../repositories/interface/IPhotographerRepository";
import { AppError } from "../../../utils/AppError.ts";
import { Messages } from "../../../constants/messages.ts";
import { HttpStatus } from "../../../constants/httpStatus.ts";
import { UserMapper } from "../../../mappers/user.mapper.ts";
import bcrypt from "bcrypt";

export class UserService implements IUserSerivice {
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

    return UserMapper.toProfileResponse(user, applicationStatus);
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

  async changePassword(userId: string, data: ChangePasswordDtoType): Promise<void> {
    const user = await this._userRespository.findById(userId);

    if (!user) throw new AppError(Messages.USER_NOTFOUND, HttpStatus.NOT_FOUND);

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new AppError(Messages.CURRENT_PASSWORD_INCORRECT, HttpStatus.BAD_REQUEST);

    const hashedPasswod = await bcrypt.hash(data.newPassword, 10);
    user.password = hashedPasswod;

    await this._userRespository.update(userId, user);
  }
}
