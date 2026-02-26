export interface CreateBookingDTO {
  photographerId: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  packageFeatures: string[];
  date: string | Date;
  startTime: string;
  location: string;
  lat?: number;
  lng?: number;
  eventType: string;
  contactName: string;
  email: string;
  phone: string;
}

export interface BookingRescheduleRequestDTO {
  newDate: Date | string;
  newStartTime: string;
  reason: string;
}

export interface BookingRescheduleResponseDTO {
  decision: "accepted" | "rejected";
}

export interface SearchBookingsQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
