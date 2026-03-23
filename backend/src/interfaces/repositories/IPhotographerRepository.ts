import type { IPhotographer } from "../../models/photographer.model";
import { IPaginatedPhotographerResponse } from "../../dto/photographer.dto";

export interface IPhotographerQuery {
  page: number;
  limit: number;
  search?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  isBlocked?: "true" | "false" | "all";
}

export interface IPaginatedPhotographers {
  photographers: IPhotographer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  rejectedCount: number;
  pendingCount: number;
  approvedCount: number;
}

export interface IPhotographerStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  blocked: number;
}

export interface IPublicReview {
  id: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: Date | string;
}

export interface IPublicPhotographer {
  id: string;
  userId: string;
  name: string;
  image: string;
  category: string;
  location: string;
  rating: number;
  reviewsCount: number;
  price: number;
  photosCount: number;
  experience: number;
  tags: string[];
  available: boolean;
  type: string;
  bio: string;
  portfolio: string[];
  portfolioSections: Array<{
    id: string;
    title: string;
    images: string[];
  }>;
  packages: Array<{
    id: string;
    name: string;
    price: number;
    features: string[];
    description: string;
  }>;
  reviews: IPublicReview[];
}

export interface IPhotographerRepository {
  create(data: Partial<IPhotographer>): Promise<IPhotographer>;
  findById(id: string): Promise<IPhotographer | null>;
  findOne(query: Partial<IPhotographer>): Promise<IPhotographer | null>;
  update(id: string, data: Partial<IPhotographer>): Promise<IPhotographer | null>;

  findByUserId(userId: string): Promise<IPhotographer | null>;
  findAllWithPagination(query: IPhotographerQuery): Promise<IPaginatedPhotographers>;
  blockById(id: string): Promise<IPhotographer | null>;
  unblockById(id: string): Promise<IPhotographer | null>;
  approveById(id: string, message: string): Promise<IPhotographer | null>;
  rejectById(id: string, reason: string): Promise<IPhotographer | null>;
  getStatistics(): Promise<IPhotographerStats>;
  getPublicPhotographers(filters: {
    category?: string;
    priceRange?: string;
    location?: string;
    lat?: number;
    lng?: number;
    page: number;
    limit: number;
  }): Promise<IPaginatedPhotographerResponse>;
  getPublicPhotographerById(id: string): Promise<IPublicPhotographer | null>;
  toggleLike(id: string, userId: string): Promise<IPhotographer | null>;
}
