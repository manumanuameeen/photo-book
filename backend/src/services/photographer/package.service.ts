import { IPackageService } from "../../interfaces/services/IPackageAvailabilityService.ts";
import { IPackageRepository } from "../../interfaces/repositories/IPackageRepository.ts";
import { CreatePackageDto, UpdatePackageDto } from "../../dto/package-availability.dto.ts";
import { IBookingPackage } from "../../model/bookingPackageModel.ts";
import { AppError } from "../../utils/AppError.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";

import mongoose from "mongoose";

export class PackageService implements IPackageService {
  private readonly _repository: IPackageRepository;

  constructor(repository: IPackageRepository) {
    this._repository = repository;
  }

  async createPackage(photographerId: string, data: CreatePackageDto): Promise<IBookingPackage> {
    return await this._repository.create({
      photographer: new mongoose.Types.ObjectId(photographerId),
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

  async updatePackage(photographerId: string, data: UpdatePackageDto): Promise<IBookingPackage> {
    const pkg = await this._repository.findById(data.id);
    if (!pkg) {
      throw new AppError("Package not found", HttpStatus.NOT_FOUND);
    }
    if (pkg.photographer.toString() !== photographerId) {
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

  async deletePackage(photographerId: string, packageId: string): Promise<boolean> {
    const pkg = await this._repository.findById(packageId);
    if (!pkg) throw new AppError("Package not found", HttpStatus.NOT_FOUND);

    if (pkg.photographer.toString() !== photographerId) {
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

  async getPhotographerPackages(photographerId: string): Promise<IBookingPackage[]> {
    const packages = await this._repository.findByPhotographerId(photographerId);
    return packages.filter((p) => p.status !== "DELETED");
  }
}

