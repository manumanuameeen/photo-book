import { IBookingPackage } from "../../model/bookingPackageModel";
import { CreatePackageDto, UpdatePackageDto, SetAvailabilityDto } from "../../dto/package-availability.dto";
import { IAvailability } from "../../model/availabilityModel";

export interface IPackageService {
    createPackage(photographerId: string, data: CreatePackageDto): Promise<IBookingPackage>;
    updatePackage(photographerId: string, data: UpdatePackageDto): Promise<IBookingPackage>;
    deletePackage(photographerId: string, packageId: string): Promise<boolean>;
    getPackage(packageId: string): Promise<IBookingPackage>;
    getPhotographerPackages(photographerId: string): Promise<IBookingPackage[]>;
}

export interface IAvailabilityService {
    setAvailability(photographerId: string, data: SetAvailabilityDto): Promise<IAvailability>;
    getAvailability(photographerId: string, startDate: Date, endDate: Date): Promise<IAvailability[]>;
    checkAvailability(photographerId: string, date: Date, timeSlot: { start: string; end: string }): Promise<boolean>;
    blockRange(photographerId: string, startDate: Date, endDate: Date): Promise<void>;
    markDateAsBooked(photographerId: string, date: Date): Promise<void>;
}
