import { CreateRentalItemDTO, UpdateRentalItemDTO } from "../../../dto/rental.dto";
import { IRentalItem } from "../../../models/rentalItem.model";

export interface IRentalItemService {
  createRentalItem(data: CreateRentalItemDTO): Promise<IRentalItem>;
  getAllRentalItems(
    category?: string,
    page?: number,
    limit?: number,
    userId?: string,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  getRentalItemDetails(itemId: string): Promise<IRentalItem>;
  updateRentalItem(itemId: string, data: UpdateRentalItemDTO): Promise<IRentalItem>;
  deleteRentalItem(itemId: string): Promise<void>;
  getUserRentalItems(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  updateRentalItemStatus(
    id: string,
    status: string,
    userId: string,
    role: string,
  ): Promise<IRentalItem | null>;

  checkItemAvailability(itemId: string, startDate: Date, endDate: Date): Promise<boolean>;
  getUnavailableDates(
    itemId: string,
  ): Promise<{ startDate: Date; endDate: Date; reason?: string; type: "BOOKED" | "BLOCKED" }[]>;
  blockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
    userId?: string,
    role?: string,
  ): Promise<IRentalItem>;
  unblockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    userId: string,
    role?: string,
  ): Promise<IRentalItem>;

  toggleLike(itemId: string, userId: string): Promise<IRentalItem>;
}
