import { IBookingPackage } from "../../model/bookingPackageModel.ts";
import {
  CreatePackageDto,
  UpdatePackageDto,
  SetAvailabilityDto,
} from "../../dto/package-availability.dto.ts";
import { IAvailability } from "../../model/availabilityModel.ts";

export interface IPackageService {
  createPackage(userId: string, data: CreatePackageDto): Promise<IBookingPackage>;
  updatePackage(userId: string, data: UpdatePackageDto): Promise<IBookingPackage>;
  deletePackage(userId: string, packageId: string): Promise<boolean>;
  getPackage(packageId: string): Promise<IBookingPackage>;
  getPhotographerPackages(
    photographerId: string,
    page?: number,
    limit?: number,
  ): Promise<{ packages: IBookingPackage[]; total: number }>;
  getPackagesByUserId(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ packages: IBookingPackage[]; total: number }>;
  getPackagesByPhotographerId(
    photographerId: string,
    page?: number,
    limit?: number,
  ): Promise<{ packages: IBookingPackage[]; total: number }>;
  toggleLike(id: string, userId: string): Promise<IBookingPackage>;
}

export interface IAvailabilityService {
  setAvailability(photographerId: string, data: SetAvailabilityDto): Promise<IAvailability>;
  getAvailability(photographerId: string, startDate: Date, endDate: Date): Promise<IAvailability[]>;
  checkAvailability(
    photographerId: string,
    date: Date,
    timeSlot: { start: string; end: string },
  ): Promise<boolean>;
  blockRange(photographerId: string, startDate: Date, endDate: Date): Promise<void>;
  unblockRange(photographerId: string, startDate: Date, endDate: Date): Promise<void>;
  markDateAsBooked(photographerId: string, date: Date): Promise<void>;
  deleteAvailability(photographerId: string, date: Date): Promise<void>;
}
