import type { IPhotographerStats } from "../repositories/IPhotographerRepository.ts";
import { IBookingPackage } from "../../models/bookingPackage.model.ts";
import { Populated } from "../../types/common.types.ts";

export interface IGetPhotographersQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  isBlocked?: "true" | "false" | "all";
}

export interface IGetPackagesQuery {
  page?: string;
  limit?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ALL" | "INACTIVE";
}

export interface IPhotographerResponse {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  professionalDetails: {
    yearsExperience: string;
    specialties: string[];
    priceRange: string;
    availability: string;
  };
  portfolio: {
    portfolioWebsite?: string;
    instagramHandle?: string;
    portfolioImages: string[];
  };
  businessInfo: {
    businessName: string;
    professionalTitle: string;
    businessBio: string;
  };
  isBlock: boolean;
  status: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface IPaginatedPhotographersResponse {
  photographers: IPhotographerResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export interface IAdminPhotographerService {
  getPhotographers(query: IGetPhotographersQuery): Promise<IPaginatedPhotographersResponse>;
  getPhotographerById(id: string): Promise<IPhotographerResponse>;
  blockPhotographer(photographerId: string, reason?: string): Promise<void>;
  unblockPhotographer(photographerId: string): Promise<void>;

  getApplications(query: IGetPhotographersQuery): Promise<IPaginatedPhotographersResponse>;
  getApplicationById(id: string): Promise<IPhotographerResponse>;
  approveApplication(id: string, message: string): Promise<void>;
  rejectApplication(id: string, reason: string): Promise<void>;

  getStatistics(): Promise<IPhotographerStats>;

  getPackages(query: IGetPackagesQuery): Promise<{
    packages: Populated<IBookingPackage, "photographer" | "categoryId">[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  approvePackage(id: string, adminId?: string): Promise<void>;
  rejectPackage(id: string, reason: string, adminId?: string): Promise<void>;
  blockPackage(id: string, reason: string, adminId?: string): Promise<void>;
  unblockPackage(id: string, adminId?: string): Promise<void>;
  fixLegacyData(): Promise<{
    message: string;
    photographersScanned: number;
    updatedPackages: number;
    updatedPortfolios: number;
  }>;
}
