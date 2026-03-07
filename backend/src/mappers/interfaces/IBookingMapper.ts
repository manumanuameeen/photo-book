import type { CreateBookingDTO, BookingRescheduleRequestDTO } from "../../dto/booking.dto.ts";
import type { IBooking } from "../../model/bookingModel.ts";
import type { IMapper } from "./IMapper.ts";
export interface IBookingResponseDto {
  id: string;
  userId: string;
  photographerId: string;
  packageDetails: {
    name: string;
    price: number;
    features: string[];
  };
  eventDate: Date;
  startTime: string;
  location: string;
  eventType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
}
export interface IBookingRescheduleResponseDto {
  id: string;
  eventDate: Date;
  startTime: string;
  status: string;
  updatedAt: Date;
}
export interface IBookingMapper extends IMapper<CreateBookingDTO, IBooking, IBookingResponseDto> {
  fromRescheduleDto(dto: BookingRescheduleRequestDTO): {
    eventDate: Date;
    startTime: string;
    rescheduleReason: string;
  };
  toRescheduleResponse(booking: IBooking): IBookingRescheduleResponseDto;
}
