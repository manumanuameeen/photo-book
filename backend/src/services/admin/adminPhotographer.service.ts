import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";
import { IPhotographerRepository } from "../../interfaces/repositories/IPhotographerRepository";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import {
  IAdminPhotographerService,
  IGetPhotographersQuery,
  IGetPackagesQuery,
  IPaginatedPhotographersResponse,
  IPhotographerResponse,
} from "../../interfaces/services/IAdminPhotographerService";
import { IEmailService } from "../../interfaces/services/IEmailService";
import { IMessageService } from "../../interfaces/services/IMessageService";
import { AdminPhotographerMapper } from "../../mappers/adminPhotographerMapper";
import { AppError } from "../../utils/AppError";
import { Populated } from "../../types/common.types";
import { IBookingPackage } from "../../models/bookingPackage.model";
import mongoose from "mongoose";
import redisClient from "../../config/redis";

export class AdminPhotographerService implements IAdminPhotographerService {
  private readonly _photographerRepo: IPhotographerRepository;
  private readonly _userRepo: IUserRepository;
  private readonly _emailService: IEmailService;
  private readonly _messageService: IMessageService;

  constructor(
    photographerRepo: IPhotographerRepository,
    userRepo: IUserRepository,
    emailService: IEmailService,
    messageService: IMessageService,
  ) {
    this._photographerRepo = photographerRepo;
    this._userRepo = userRepo;
    this._emailService = emailService;
    this._messageService = messageService;
  }

  async getPhotographers(query: IGetPhotographersQuery): Promise<IPaginatedPhotographersResponse> {
    const page = Number.parseInt(query.page || "1");
    const limit = Number.parseInt(query.limit || "10");

    const result = await this._photographerRepo.findAllWithPagination({
      page,
      limit,
      search: query.search,
      status: query.status,
      isBlocked: query.isBlocked,
    });

    return {
      photographers: AdminPhotographerMapper.toResponseArray(result.photographers),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      approvedCount: result.approvedCount,
      pendingCount: result.pendingCount,
      rejectedCount: result.rejectedCount,
    };
  }

  async getPhotographerById(id: string): Promise<IPhotographerResponse> {
    const photographer = await this._photographerRepo.findById(id);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return AdminPhotographerMapper.toResponse(photographer);
  }

  async blockPhotographer(photographerId: string, _reason?: string): Promise<void> {
    const photographer = await this._photographerRepo.blockById(photographerId);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    await redisClient.set(`blocked:${photographer.userId.toString()}`, "true");
  }

  async unblockPhotographer(photographerId: string): Promise<void> {
    const photographer = await this._photographerRepo.unblockById(photographerId);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    await redisClient.del(`blocked:${photographer.userId.toString()}`);
  }

  async getApplications(query: IGetPhotographersQuery): Promise<IPaginatedPhotographersResponse> {
    return await this.getPhotographers({ ...query, status: query.status || "PENDING" });
  }

  async getApplicationById(id: string): Promise<IPhotographerResponse> {
    return await this.getPhotographerById(id);
  }

  async approveApplication(id: string, message: string): Promise<void> {
    const photographer = await this._photographerRepo.approveById(id, message);
    if (!photographer) {
      throw new AppError(Messages.APPLICATION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._userRepo.update(photographer.userId.toString(), { role: "photographer" });

    await this._emailService.sendApprovalEmail(
      photographer.personalInfo.email,
      photographer.personalInfo.name,
      message,
    );
  }

  async rejectApplication(id: string, reason: string): Promise<void> {
    const photographer = await this._photographerRepo.rejectById(id, reason);
    if (!photographer) {
      throw new AppError(Messages.APPLICATION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._emailService.sendRejectionEmail(
      photographer.personalInfo.email,
      photographer.personalInfo.name,
      reason,
    );
  }

  async getStatistics() {
    return await this._photographerRepo.getStatistics();
  }

  async getPackages(query: IGetPackagesQuery): Promise<{
    packages: Populated<IBookingPackage, "photographer" | "categoryId">[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { BookingPackageModel } = await import("../../models/bookingPackage.model");

    const page = Number.parseInt(query.page || "1");
    const limit = Number.parseInt(query.limit || "10");
    const skip = (page - 1) * limit;

    const filter: mongoose.FilterQuery<IBookingPackage> = {};

    if (query.status) {
      const status = query.status as string;
      if (status === "APPROVED") {
        filter.status = { $in: ["APPROVED", "ACTIVE"] };
        filter.isActive = true;
      } else if (status === "INACTIVE") {
        filter.status = { $in: ["APPROVED", "ACTIVE"] };
        filter.isActive = false;
      } else if (status === "REJECTED") {
        filter.status = "REJECTED";
      } else if (status !== "ALL") {
        filter.status = status;
      }
    }

    const packages = (await BookingPackageModel.find(filter)
      .populate("photographer", "personalInfo.name personalInfo.email")
      .populate("categoryId", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })) as unknown as Populated<
      IBookingPackage,
      "photographer" | "categoryId"
    >[];

    const total = await BookingPackageModel.countDocuments(filter);

    return {
      packages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async approvePackage(id: string, adminId?: string): Promise<void> {
    const { BookingPackageModel } = await import("../../models/bookingPackage.model");
    const pkg = await BookingPackageModel.findByIdAndUpdate(id, {
      status: "APPROVED",
      isActive: true,
    });
    if (pkg) {
      await this._messageService.sendSystemMessage(
        pkg.photographer.toString(),
        `Your package "${pkg.name}" has been approved.`,
        adminId,
      );
    }
  }

  async rejectPackage(id: string, reason: string, adminId?: string): Promise<void> {
    const { BookingPackageModel } = await import("../../models/bookingPackage.model");
    const pkg = await BookingPackageModel.findByIdAndUpdate(id, {
      status: "REJECTED",
      rejectionReason: reason,
      isActive: false,
    });
    if (pkg) {
      await this._messageService.sendSystemMessage(
        pkg.photographer.toString(),
        `Your package "${pkg.name}" has been rejected. Reason: ${reason}`,
        adminId,
      );
    }
  }

  async blockPackage(id: string, reason: string, adminId?: string): Promise<void> {
    const { BookingPackageModel } = await import("../../models/bookingPackage.model");
    const pkg = await BookingPackageModel.findByIdAndUpdate(id, {
      status: "REJECTED",
      rejectionReason: reason,
      isActive: false,
    });
    if (pkg) {
      await this._messageService.sendSystemMessage(
        pkg.photographer.toString(),
        `Your package "${pkg.name}" has been blocked. Reason: ${reason}`,
        adminId,
      );
    }
  }

  async unblockPackage(id: string, adminId?: string): Promise<void> {
    const { BookingPackageModel } = await import("../../models/bookingPackage.model");
    const pkg = await BookingPackageModel.findByIdAndUpdate(id, {
      status: "APPROVED",
      rejectionReason: undefined,
      isActive: true,
    });
    if (pkg) {
      await this._messageService.sendSystemMessage(
        pkg.photographer.toString(),
        `Your package "${pkg.name}" has been unblocked.`,
        adminId,
      );
    }
  }

  async fixLegacyData(): Promise<{
    message: string;
    photographersScanned: number;
    updatedPackages: number;
    updatedPortfolios: number;
  }> {
    const { BookingPackageModel } = await import("../../models/bookingPackage.model");
    const { PortfolioSectionModel } = await import("../../models/portfolioSection.model");
    const { PhotographerModel } = await import("../../models/photographer.model");

    const photographers = await PhotographerModel.find({});
    let updatedPackages = 0;
    let updatedPortfolios = 0;

    for (const photographer of photographers) {
      const pkgResult = await BookingPackageModel.updateMany(
        { photographer: photographer.userId },
        { photographer: photographer._id },
      );
      updatedPackages += pkgResult.modifiedCount;

      const portfolioResult = await PortfolioSectionModel.updateMany(
        { photographerId: photographer.userId },
        { photographerId: photographer._id },
      );
      updatedPortfolios += portfolioResult.modifiedCount;
    }

    return {
      message: "Legacy data migration completed",
      photographersScanned: photographers.length,
      updatedPackages,
      updatedPortfolios,
    };
  }
}

