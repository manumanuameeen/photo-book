import {
  ApplyPhtographerDtoType,
  PhotographerResponseDto,
  IPaginatedPhotographerResponse,
  IPublicPhotographer,
  IPublicReview,
} from "../../dto/photographer.dto.ts";
import { PhotographerDashboardStatsDto } from "../../dto/photographer.dashboard.dto.ts";
import mongoose from "mongoose";
import { BookingModel } from "../../models/booking.model.ts";
import type { IPhotographerRepository } from "../../interfaces/repositories/IPhotographerRepository.ts";
import type {
  IPhotographerCreate,
  IDashboardBooking,
  IPendingRequest,
  IUpcomingBooking,
} from "./photographer.types.ts";

export interface IBookingMapped {
  _id: string;
  userId: string | undefined;
  clientName: string;
  clientImage?: string;
  clientEmail?: string;
  packageName: string;
  packagePrice: number;
  eventDate: Date | string;
  eventType: string;
  location: string;
  status: string;
  paymentStatus: string;
  createdAt: Date | string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
import type { IPhotographerService } from "../../interfaces/services/IPhotographerService.ts";
import { PhotographerMapper } from "../../mappers/photographerMapper.ts";
import { AppError } from "../../utils/AppError.ts";
import { Messages } from "../../constants/messages.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";

import { IMessageService } from "../../interfaces/services/IMessageService.ts";
import { ReviewModel, IReview } from "../../models/review.model.ts";
import { IPhotographer } from "../../models/photographer.model.ts";

interface IReviewer {
  _id: mongoose.Types.ObjectId;
  name: string;
  profileImage?: string;
  role?: string;
}

export class PhotographerService implements IPhotographerService {
  private readonly _repository: IPhotographerRepository;
  private readonly _messageService: IMessageService;

  constructor(repository: IPhotographerRepository, messageService: IMessageService) {
    this._repository = repository;
    this._messageService = messageService;
  }

  async apply(userId: string, data: ApplyPhtographerDtoType): Promise<PhotographerResponseDto> {
    console.log("photographer service - images count:", data.portfolioImages?.length || 0);

    const specialtiesArray = Array.isArray(data.specialties)
      ? data.specialties
      : [data.specialties];

    const newApplication: IPhotographerCreate = {
      userId: new mongoose.Types.ObjectId(userId),
      personalInfo: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
      },
      professionalDetails: {
        yearsExperience: data.yearsExperience,
        specialties: specialtiesArray,
        priceRange: data.priceRange,
        availability: data.availability,
      },
      portfolio: {
        portfolioWebsite: data.portfolioWebsite || undefined,
        instagramHandle: data.instagramHandle || undefined,
        personalWebsite: data.personalWebsite || undefined,
        portfolioImages: data.portfolioImages || [],
      },
      businessInfo: {
        businessName: data.businessName,
        professionalTitle: data.professionalTitle,
        businessBio: data.businessBio,
      },
      status: "PENDING",
    };

    const existing = await this._repository.findByUserId(userId);
    if (existing) {
      if (existing.status === "PENDING" || existing.status === "APPROVED") {
        throw new AppError(Messages.ALREADY_PHOTOGRAPHER, HttpStatus.CONFLICT);
      }
      if (existing.status === "REJECTED") {
        const updatedData = { ...newApplication, rejectionReason: "" };
        const updated = await this._repository.update(existing.id, updatedData);
        if (!updated) {
          throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        console.log(
          "Updated photographer - images:",
          updated.portfolio.portfolioImages?.length || 0,
        );
        return PhotographerMapper.toResponse(updated);
      }
    }

    const created = await this._repository.create(newApplication);
    console.log("Created photographer - images:", created.portfolio.portfolioImages?.length || 0);
    return PhotographerMapper.toResponse(created);
  }

  async getDashboardStats(userId: string): Promise<PhotographerDashboardStatsDto> {
    const photographer = await this._repository.findByUserId(userId);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!photographer.userId) {
      throw new AppError("Invalid photographer user ID", HttpStatus.BAD_REQUEST);
    }

    const bookings = (await BookingModel.find({
      photographerId: { $in: [photographer.userId, photographer._id] },
    })
      .populate("userId", "name profileImage")
      .populate("packageId")
      .sort({ createdAt: -1 })) as unknown as IDashboardBooking[];

    let totalEarnings = 0;
    let totalSessions = 0;
    let pendingPayouts = 0;
    let newRequests = 0;
    let monthlyEarnings = 0;

    const upcomingBookingsList: IUpcomingBooking[] = [];
    const pendingRequestsList: IPendingRequest[] = [];
    const revenueTrendMap = new Map<string, number>();
    const sessionTypeMap = new Map<string, number>();
    const uniqueCustomers = new Set<string>();
    const packagePopularityMap = new Map<string, number>();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = d.toLocaleString("default", { month: "short" });
      revenueTrendMap.set(key, 0);
    }

    bookings.forEach((booking: IDashboardBooking) => {
      const clientName = booking.userId?.name || "Unknown Client";
      const bookingDate = new Date(booking.eventDate || booking.createdAt);
      const monthKey = bookingDate.toLocaleString("default", { month: "short" });

      if (booking.userId?._id) {
        uniqueCustomers.add(booking.userId._id.toString());
      }

      if (booking.status === "COMPLETED" || booking.paymentStatus === "paid") {
        const amount = booking.totalAmount || 0;
        totalEarnings += amount;
        totalSessions++;

        const pkgName = booking.packageDetails?.name || booking.packageId?.name || "Custom Package";
        packagePopularityMap.set(pkgName, (packagePopularityMap.get(pkgName) || 0) + 1);

        if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
          monthlyEarnings += amount;
        }

        if (revenueTrendMap.has(monthKey)) {
          revenueTrendMap.set(monthKey, (revenueTrendMap.get(monthKey) || 0) + amount);
        }

        const type = booking.eventType || "Other";
        sessionTypeMap.set(type, (sessionTypeMap.get(type) || 0) + 1);
      }

      if (booking.status === "pending") {
        pendingPayouts += booking.depositeRequired || 0;
        pendingRequestsList.push({
          _id: booking._id.toString(),
          clientName: clientName,
          eventType: booking.eventType,
          date: bookingDate.toDateString(),
          status: booking.status,
        });

        if (new Date(booking.createdAt) > oneWeekAgo) {
          newRequests++;
        }
      } else if (["accepted", "confirmed", "work_started", "work_ended"].includes(booking.status)) {
        upcomingBookingsList.push({
          _id: booking._id.toString(),
          clientName: clientName,
          date: bookingDate.toDateString(),
          location: booking.location,
          status: booking.status,
        });
      }
    });

    const reviews = await ReviewModel.find({ targetId: photographer._id })
      .populate("reviewerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const totalReviews = await ReviewModel.countDocuments({ targetId: photographer._id });
    const allReviews = await ReviewModel.find({ targetId: photographer._id });
    const averageRating =
      totalReviews > 0 ? allReviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews : 0;

    const conversations = await this._messageService.getConversations(
      photographer.userId.toString(),
    );

    pendingRequestsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    upcomingBookingsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      earnings: {
        total: totalEarnings,
        monthly: monthlyEarnings,
        growth: 0,
        pendingPayouts: pendingPayouts,
      },
      sessions: {
        total: totalSessions,
        newRequests: newRequests,
        totalCustomers: uniqueCustomers.size,
        packagePopularity: Array.from(packagePopularityMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      },
      reviews: {
        averageRating: Number.parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
        latest: reviews.map((r: IReview) => ({
          _id: (r._id as mongoose.Types.ObjectId).toString(),
          clientName: (r.reviewerId as unknown as IReviewer)?.name || "Anonymous",
          comment: r.comment,
          rating: r.rating,
          createdAt: r.createdAt,
        })),
      },
      pendingRequests: pendingRequestsList,
      upcomingBookings: upcomingBookingsList,
      recentMessages: conversations.map((conv) => {
        const msg = conv.lastMessage as {
          _id: { toString: () => string };
          content: string;
          createdAt: Date | string | number;
        };
        const partner = conv.partner as { name?: string; role?: string } | undefined | null;
        return {
          _id: msg._id.toString(),
          clientName: partner?.name || "System",
          senderRole: partner?.role || "system",
          message: msg.content,
          time:
            msg.createdAt instanceof Date
              ? msg.createdAt.toLocaleTimeString()
              : new Date(msg.createdAt).toLocaleTimeString(),
          fullDate: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
        };
      }),
      revenueTrend: Array.from(revenueTrendMap.entries()).map(([month, amount]) => ({
        month,
        amount,
      })),
      sessionTypes: Array.from(sessionTypeMap.entries()).map(([type, count]) => ({
        type,
        count,
      })),
    };
  }

  async getPhotographers(filters: {
    category?: string;
    priceRange?: string;
    location?: string;
    lat?: number;
    lng?: number;
    page: number;
    limit: number;
  }): Promise<IPaginatedPhotographerResponse> {
    return await this._repository.getPublicPhotographers(filters);
  }

  async getPhotographerById(
    id: string,
  ): Promise<IPublicPhotographer & { reviews: IPublicReview[] }> {
    const photographer = await this._repository.getPublicPhotographerById(id);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const reviews = await ReviewModel.find({ targetId: id })
      .populate("reviewerId", "name profileImage")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews : 0;

    return {
      ...photographer,
      reviews: reviews.map((r) => ({
        id: String(r._id),
        userName: (r.reviewerId as unknown as IReviewer)?.name || "Anonymous",
        userImage: (r.reviewerId as unknown as IReviewer)?.profileImage,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
      })),
      rating: Number.parseFloat(averageRating.toFixed(1)),
      reviewsCount: totalReviews,
    };
  }

  async addReview(
    userId: string,
    photographerId: string,
    review: { rating: number; comment: string },
  ): Promise<IReview> {
    const photographer = await this._repository.getPublicPhotographerById(photographerId);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (photographer.userId.toString() === userId) {
      throw new AppError("You cannot review your own profile", HttpStatus.BAD_REQUEST);
    }

    const newReview = await ReviewModel.create({
      reviewerId: new mongoose.Types.ObjectId(userId),
      targetId: new mongoose.Types.ObjectId(photographerId),
      type: "PHOTOGRAPHER",
      rating: review.rating,
      comment: review.comment,
    });

    return newReview;
  }

  async getBookings(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ bookings: IBookingMapped[]; pagination: IPagination }> {
    const photographer = await this._repository.findByUserId(userId);

    if (!photographer?.userId) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const query: Record<string, unknown> = {
      photographerId: { $in: [photographer.userId, photographer._id] },
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = (await BookingModel.find(query)
      .populate("userId", "name email profileImage phone")
      .populate("packageId", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)) as unknown as IDashboardBooking[];

    const total = await BookingModel.countDocuments(query);

    return {
      bookings: bookings.map((b: IDashboardBooking) => ({
        _id: b._id.toString(),
        userId: b.userId?._id?.toString(),
        clientName: b.userId?.name || "Unknown Client",
        clientImage: b.userId?.profileImage,
        clientEmail: b.userId?.email,
        packageName: b.packageDetails?.name || b.packageId?.name || "Unknown Package",
        packagePrice: b.packageId?.price || 0,
        eventDate: b.eventDate,
        eventType: b.eventType,
        location: b.location,
        status: b.status,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateProfile(
    userId: string,
    data: Partial<IPhotographer>,
  ): Promise<PhotographerResponseDto> {
    const photographer = await this._repository.findByUserId(userId);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updateData: Partial<IPhotographer> = {};
    if (data.personalInfo)
      updateData.personalInfo = { ...photographer.personalInfo, ...data.personalInfo };
    if (data.professionalDetails)
      updateData.professionalDetails = {
        ...photographer.professionalDetails,
        ...data.professionalDetails,
      };
    if (data.portfolio) updateData.portfolio = { ...photographer.portfolio, ...data.portfolio };
    if (data.businessInfo)
      updateData.businessInfo = { ...photographer.businessInfo, ...data.businessInfo };

    const updated = await this._repository.update(photographer.id, updateData);
    if (!updated) {
      throw new AppError("Failed to update profile", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return PhotographerMapper.toResponse(updated);
  }

  async getOwnProfile(userId: string): Promise<PhotographerResponseDto> {
    const photographer = await this._repository.findByUserId(userId);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return PhotographerMapper.toResponse(photographer);
  }

  async toggleLike(id: string, userId: string): Promise<IPhotographer> {
    const photographer = await this._repository.toggleLike(id, userId);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return photographer;
  }
}
