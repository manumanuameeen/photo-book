import { IPackageService } from "../../interfaces/services/IPackageAvailabilityService";
import { IPackageRepository } from "../../interfaces/repositories/IPackageRepository";
import { CreatePackageDto, UpdatePackageDto } from "../../dto/packageAvailability.dto";
import { IBookingPackage, BookingPackageModel } from "../../models/bookingPackage.model";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";

import mongoose from "mongoose";

import { IPhotographerRepository } from "../../interfaces/repositories/IPhotographerRepository";

export class PackageService implements IPackageService {
  private readonly _repository: IPackageRepository;
  private readonly _photographerRepository: IPhotographerRepository;

  constructor(repository: IPackageRepository, photographerRepository: IPhotographerRepository) {
    this._repository = repository;
    this._photographerRepository = photographerRepository;
  }

  async createPackage(userId: string, data: CreatePackageDto): Promise<IBookingPackage> {
    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }
    return await this._repository.create({
      photographer: photographer.id,
      name: data.name,
      description: data.description,
      baseprice: data.price,
      editedPhoto: data.editedPhoto,
      features: data.features,
      deliveryTime: data.deliveryTime,
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
      coverImage: data.coverImage,
      status: "APPROVED",
    });
  }

  async updatePackage(userId: string, data: UpdatePackageDto): Promise<IBookingPackage> {
    const pkg = await this._repository.findById(data.id);
    if (!pkg) {
      throw new AppError("Package not found", HttpStatus.NOT_FOUND);
    }
    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }

    if (pkg.photographer.toString() !== photographer.id.toString()) {
      throw new AppError("Unauthorized access to package", HttpStatus.FORBIDDEN);
    }

    const updateData: Partial<IBookingPackage> = {
      name: data.name,
      description: data.description,
      features: data.features,
      deliveryTime: data.deliveryTime,
      coverImage: data.coverImage,
      isActive: data.isActive,
    };

    if (data.price !== undefined) updateData.baseprice = data.price;
    if (data.editedPhoto !== undefined) updateData.editedPhoto = data.editedPhoto;
    if (data.categoryId) updateData.categoryId = new mongoose.Types.ObjectId(data.categoryId);

    const updated = await this._repository.update(data.id, updateData);
    if (!updated) throw new AppError("Failed to update package", HttpStatus.INTERNAL_SERVER_ERROR);

    return updated;
  }

  async deletePackage(userId: string, packageId: string): Promise<boolean> {
    const pkg = await this._repository.findById(packageId);
    if (!pkg) throw new AppError("Package not found", HttpStatus.NOT_FOUND);

    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }

    if (pkg.photographer.toString() !== photographer.id.toString()) {
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    }

    await this._repository.update(packageId, { status: "DELETED", isActive: false });
    return true;
  }

  async getPackage(packageId: string): Promise<IBookingPackage> {
    const pkg = await this._repository.findById(packageId);
    if (!pkg) throw new AppError("Package not found", HttpStatus.NOT_FOUND);
    return pkg;
  }

  async getPackagesByUserId(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ packages: IBookingPackage[]; total: number }> {
    const photographer = await this._photographerRepository.findByUserId(userId);
    if (!photographer) {
      throw new AppError("Photographer profile not found", HttpStatus.NOT_FOUND);
    }
    const { packages, total } = await this._repository.findByPhotographerId(
      photographer.id,
      page,
      limit,
    );
    return {
      packages: packages.filter((p) => p.status !== "DELETED"),
      total,
    };
  }

  async getPackagesByPhotographerId(
    photographerId: string,
    page = 1,
    limit = 10,
  ): Promise<{ packages: IBookingPackage[]; total: number }> {
    const { packages, total } = await this._repository.findByPhotographerId(
      photographerId,
      page,
      limit,
    );
    return {
      packages: packages.filter((p) => p.status !== "DELETED"),
      total,
    };
  }

  async getPhotographerPackages(
    photographerId: string,
    page = 1,
    limit = 10,
  ): Promise<{ packages: IBookingPackage[]; total: number }> {
    return this.getPackagesByPhotographerId(photographerId, page, limit);
  }

  async toggleLike(id: string, userId: string): Promise<IBookingPackage> {
    const pkg = await this._repository.toggleLike(id, userId);
    if (!pkg) throw new AppError("Package not found", HttpStatus.NOT_FOUND);
    return pkg;
  }
}
