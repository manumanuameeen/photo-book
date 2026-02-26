import mongoose from "mongoose";

export interface IPhotographerCreate {
  userId: mongoose.Types.ObjectId;
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
    personalWebsite?: string;
    portfolioImages: string[];
  };

  businessInfo: {
    businessName: string;
    professionalTitle: string;
    businessBio: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface IDashboardBooking {
  _id: mongoose.Types.ObjectId;
  userId?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    profileImage?: string;
    email?: string;
  };
  photographerId?: mongoose.Types.ObjectId | string;
  packageId?: {
    name: string;
    price: number;
  };
  packageDetails?: {
    name: string;
    price: number;
  };
  eventDate: Date;
  eventType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  depositeRequired: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPendingRequest {
  _id: string;
  clientName: string;
  eventType: string;
  date: string;
  status: string;
}

export interface IUpcomingBooking {
  _id: string;
  clientName: string;
  date: string;
  location: string;
  status: string;
}
