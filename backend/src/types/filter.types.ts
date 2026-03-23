import { Document } from "mongoose";

export type FilterQuery<T extends Document> = Partial<Record<keyof T, unknown>>;

export type AggregationPipeline = Record<string, unknown>[];

export interface AggregationStage {
  [key: string]: unknown;
}

export interface TransactionData {
  type: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  referenceId: string;
  date: Date;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

export interface PhotographerFiltersDto {
  search?: string;
  rating?: number;
  location?: string;
  lat?: number;
  lng?: number;
  page: number;
  limit: number;
}

export interface PhotographerProfileUpdateDto {
  personalInfo?: {
    bio?: string;
    phone?: string;
    specialties?: string[];
  };
  professionalDetails?: {
    yearsOfExperience?: number;
    equipment?: string[];
    certifications?: string[];
  };
  portfolio?: {
    title?: string;
    description?: string;
    images?: string[];
  };
  businessInfo?: {
    businessName?: string;
    businessAddress?: string;
    taxId?: string;
  };
}

export interface RentalOrderFilter {
  renterId?: string;
  ownerId?: string;
  status?: string;
  paymentStatus?: string;
  _id?: string;
}

export interface PhotoGrapherPublicResponse {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  businessName?: string;
  yearsOfExperience?: number;
  rating: number;
  reviewsCount: number;
  reviews?: Array<{
    id: string;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    date: Date;
  }>;
  specialties?: string[];
  location?: string;
  bookingCount?: number;
}

export interface AdminAttachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
}

export interface BookingDetailMetadata {
  eventDate?: Date;
  eventType?: string;
  location?: string;
  duration?: number;
  guestCount?: number;
  additionalRequirements?: string;
}

export interface RentalItemData {
  name: string;
  category: string;
  condition: string;
  dailyRate: number;
  image?: string;
  ownerId?: string;
}

export interface EmailAttachmentDto {
  filename: string;
  path?: string;
  content?: Buffer | string;
}
