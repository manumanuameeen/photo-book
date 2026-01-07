import { ApplyPhtographerDtoType, PhotographerResponseDto } from "../../dto/photographer.dto";
import { PhotographerDashboardStatsDto } from "../../dto/photographer.dashboard.dto";
import mongoose from "mongoose";
import { BookingModel } from "../../model/bookingModel";
import type { IPhotographerRepository } from "../../repositories/interface/IPhotographerRepository";
import type { IPhotographerCreate } from "./photographer.types";
import type { IPhotographerService } from "./IPhotographerService";
import { PhotographerMapper } from "../../mappers/photographerMapper";
import { AppError } from "../../utils/AppError";
import { Messages } from "../../constants/messages";
import { HttpStatus } from "../../constants/httpStatus";

import { IMessageService } from "../messaging/interface/IMessageService";
import { ReviewModel } from "../../model/reviewModel";

export class PhotographerService implements IPhotographerService {
  private _repository: IPhotographerRepository;
  private _messageService: IMessageService;

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
        const updated = await this._repository.update(existing.id, updatedData as any);
        if (!updated) {
          throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        console.log("Updated photographer - images:", updated.portfolio.portfolioImages?.length || 0);
        return PhotographerMapper.toResponse(updated);
      }
    }

    const created = await this._repository.create(newApplication as any);
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

    const bookings = await BookingModel.find({
      photographerId: { $in: [photographer.userId, photographer._id] }
    })
      .populate('userId', 'name profileImage')
      .populate('packageId')
      .sort({ createdAt: -1 });

    let totalEarnings = 0;
    let totalSessions = 0;
    let pendingPayouts = 0;
    let newRequests = 0;

    const upcomingBookingsList: any[] = [];
    const pendingRequestsList: any[] = [];

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    bookings.forEach((booking: any) => {
      const clientName = booking.userId?.name || "Unknown Client";
      const packageName = booking.packageDetails?.name || booking.packageId?.name || "Custom Package";

      if (booking.status === 'COMPLETED') {
        totalSessions++;
        totalEarnings += booking.totalAmount || 0;
      } else if (booking.status === 'pending') {
        pendingPayouts += booking.depositeRequired || 0;
        pendingRequestsList.push({
          _id: (booking._id as mongoose.Types.ObjectId).toString(),
          clientName: clientName,
          eventType: booking.eventType,
          date: booking.eventDate instanceof Date ? booking.eventDate.toDateString() : new Date(booking.eventDate).toDateString(),
          status: booking.status
        });

        if (new Date(booking.createdAt) > oneWeekAgo) {
          newRequests++;
        }
      } else if (booking.status === 'accepted' || booking.status === 'confirmed') {
        upcomingBookingsList.push({
          _id: (booking._id as mongoose.Types.ObjectId).toString(),
          clientName: clientName,
          date: booking.eventDate instanceof Date ? booking.eventDate.toDateString() : new Date(booking.eventDate).toDateString(),
          location: booking.location,
          status: booking.status
        });
      }
    });

    const recentMessages = await this._messageService.getMessages(photographer.userId.toString());

    return {
      earnings: {
        total: totalEarnings,
        monthly: 0,
        growth: 0,
        pendingPayouts: pendingPayouts
      },
      sessions: {
        total: totalSessions,
        newRequests: newRequests
      },
      reviews: {
        averageRating: 0,
        totalReviews: 0,
        latest: []
      },
      pendingRequests: pendingRequestsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      upcomingBookings: upcomingBookingsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      recentMessages: recentMessages.map(msg => ({
        _id: (msg as any)._id.toString(),
        clientName: (msg.senderId as any)?.name || "System",
        senderRole: (msg.senderId as any)?.role || "system",
        message: msg.content,
        time: msg.createdAt instanceof Date ? msg.createdAt.toLocaleTimeString() : new Date(msg.createdAt).toLocaleTimeString(),
        fullDate: msg.createdAt
      }))
    };
  }

  async getPhotographers(filters: { category?: string; priceRange?: string; location?: string; lat?: number; lng?: number }): Promise<any[]> {
    return await this._repository.getPublicPhotographers(filters);
  }

  async getPhotographerById(id: string): Promise<any> {
    const photographer = await this._repository.getPublicPhotographerById(id);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Fetch reviews
    const reviews = await ReviewModel.find({ targetId: id }).populate("reviewerId", "name profileImage").sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0;

    return {
      ...photographer,
      reviews: reviews.map(r => ({
        id: r._id,
        userName: (r.reviewerId as any)?.name || "Anonymous",
        userImage: (r.reviewerId as any)?.profileImage,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt
      })),
      rating: parseFloat(averageRating.toFixed(1)),
      reviewsCount: totalReviews
    };
  }

  async addReview(userId: string, photographerId: string, review: { rating: number; comment: string }): Promise<any> {
    // Validate photographer exists
    const photographer = await this._repository.getPublicPhotographerById(photographerId);
    if (!photographer) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (photographer.userId.toString() === userId) {
      throw new AppError("You cannot review your own profile", HttpStatus.BAD_REQUEST);
    }

    // Check if user already reviewed (optional, maybe allow multiple?)
    // For now allow multiple

    const newReview = await ReviewModel.create({
      reviewerId: new mongoose.Types.ObjectId(userId),
      targetId: new mongoose.Types.ObjectId(photographerId),
      type: 'PHOTOGRAPHER',
      rating: review.rating,
      comment: review.comment
    });

    return newReview;
  }

  async getBookings(userId: string, status?: string, page: number = 1, limit: number = 10): Promise<any> {
    const photographer = await this._repository.findByUserId(userId);

    if (!photographer || !photographer.userId) {
      throw new AppError(Messages.PHOTOGRAPHER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const query: any = {
      photographerId: { $in: [photographer.userId, photographer._id] }
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await BookingModel.find(query)
      .populate('userId', 'name email profileImage phone')
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BookingModel.countDocuments(query);

    return {
      bookings: bookings.map((b: any) => ({
        _id: b._id.toString(),
        clientName: (b.userId as any)?.name || "Unknown Client",
        clientImage: (b.userId as any)?.profileImage,
        clientEmail: (b.userId as any)?.email,
        packageName: (b.packageDetails as any)?.name || (b.packageId as any)?.name || "Unknown Package",
        packagePrice: (b.packageId as any)?.price || 0,
        eventDate: b.eventDate,
        eventType: b.eventType,
        location: b.location,
        status: b.status,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}