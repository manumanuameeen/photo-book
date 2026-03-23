import { IRentalItem } from "../../../models/rentalItem.model";

export interface IRentalAvailabilityService {
  checkItemAvailability(
    itemId: string,
    startDate: Date,
    endDate: Date,
    excludeOrderId?: string,
  ): Promise<boolean>;

  blockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
    userId?: string,
    role?: string,
  ): Promise<IRentalItem>;

  getUnavailableDates(
    itemId: string,
  ): Promise<{ startDate: Date; endDate: Date; reason?: string; type: "BOOKED" | "BLOCKED" }[]>;

  unblockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    userId: string,
    role?: string,
  ): Promise<IRentalItem>;
}
