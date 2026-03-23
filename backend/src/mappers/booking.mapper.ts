import mongoose from "mongoose";
import { BookingStatus, IBooking, PaymentStatus } from "../models/booking.model";
import type { CreateBookingDTO, BookingRescheduleRequestDTO } from "../dto/booking.dto";
import type {
  IBookingMapper,
  IBookingResponseDto,
  IBookingRescheduleResponseDto,
} from "./interfaces/IBookingMapper";
export class BookingMapper implements IBookingMapper {
  fromDto(dto: CreateBookingDTO): Partial<IBooking> {
    const price = Number(dto.packagePrice);
    const depositAmount = price * 0.2;
    return {
      userId: new mongoose.Types.ObjectId(),
      photographerId: new mongoose.Types.ObjectId(dto.photographerId),
      packageId: new mongoose.Types.ObjectId(dto.packageId),
      packageDetails: {
        name: dto.packageName,
        price,
        features: dto.packageFeatures,
      },
      eventDate: new Date(dto.date),
      startTime: dto.startTime,
      location: dto.location,
      locationCoordinates: {
        lat: dto.lat ?? 0,
        lng: dto.lng ?? 0,
      },
      eventType: dto.eventType,
      contactDetails: {
        name: dto.contactName,
        email: dto.email,
        phone: dto.phone,
      },
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount: price,
      depositeRequired: depositAmount,
    };
  }
  toResponse(booking: IBooking): IBookingResponseDto {
    const pkgDetails = booking.packageDetails as
      | {
          name?: string;
          price?: number;
          features?: string[];
        }
      | undefined;
    return {
      id: booking._id?.toString() ?? "",
      userId: booking.userId?.toString() ?? "",
      photographerId: booking.photographerId?.toString() ?? "",
      packageDetails: {
        name: pkgDetails?.name ?? "",
        price: pkgDetails?.price ?? 0,
        features: pkgDetails?.features ?? [],
      },
      eventDate: booking.eventDate,
      startTime: booking.startTime,
      location: booking.location,
      eventType: booking.eventType,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt ?? new Date(),
    };
  }
  fromRescheduleDto(dto: BookingRescheduleRequestDTO): {
    eventDate: Date;
    startTime: string;
    rescheduleReason: string;
  } {
    return {
      eventDate: new Date(dto.newDate),
      startTime: dto.newStartTime,
      rescheduleReason: dto.reason,
    };
  }
  toRescheduleResponse(booking: IBooking): IBookingRescheduleResponseDto {
    return {
      id: booking._id?.toString() || "",
      eventDate: booking.eventDate,
      startTime: booking.startTime,
      status: booking.status,
      updatedAt: new Date(),
    };
  }
}
