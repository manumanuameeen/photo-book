import mongoose from "mongoose";
import { HttpStatus } from "../../constants/httpStatus";
import { AppError } from "../../utils/AppError";
import { IRentalRepository } from "../../interfaces/repositories/IRentalRepository";
import { IRentalItem } from "../../models/rentalItem.model";
import { RentalStatus } from "../../models/rentalOrder.model";
import { IRentalAvailabilityService } from "../../interfaces/services/rental/IRentalAvailabilityService";

export class RentalAvailabilityService implements IRentalAvailabilityService {
  constructor(private readonly _rentalRepository: IRentalRepository) {}

  private _getUserId(
    user: string | mongoose.Types.ObjectId | { _id: string | mongoose.Types.ObjectId },
  ): string {
    if (!user) return "";
    if (typeof user === "string") return user;
    if (user instanceof mongoose.Types.ObjectId) return user.toString();
    if ("_id" in user) return user._id.toString();
    return String(user);
  }

  async checkItemAvailability(
    itemId: string,
    startDate: Date,
    endDate: Date,
    excludeOrderId?: string,
  ): Promise<boolean> {
    const item = await this._rentalRepository.getItemById(itemId);
    if (!item) throw new AppError("Item not found", HttpStatus.NOT_FOUND);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (item.blockedDates && item.blockedDates.length > 0) {
      const isBlocked = item.blockedDates.some((blocked) => {
        const blockedStart = new Date(blocked.startDate);
        blockedStart.setHours(0, 0, 0, 0);
        const blockedEnd = new Date(blocked.endDate);
        blockedEnd.setHours(23, 59, 59, 999);
        return start <= blockedEnd && end >= blockedStart;
      });
      if (isBlocked) return false;
    }

    const orders = await this._rentalRepository.getItemOrders(itemId);
    const overlappingOrders = orders.filter((order) => {
      if (excludeOrderId && order._id.toString() === excludeOrderId.toString()) return false;

      if (
        (
          [
            RentalStatus.REJECTED,
            RentalStatus.WAITING_FOR_DEPOSIT,
            RentalStatus.CANCELLED,
            RentalStatus.COMPLETED,
            RentalStatus.RETURNED,
          ] as string[]
        ).includes(order.status as string)
      )
        return false;

      const orderStart = new Date(order.startDate);
      orderStart.setHours(0, 0, 0, 0);
      const orderEnd = new Date(order.endDate);
      orderEnd.setHours(23, 59, 59, 999);
      return start <= orderEnd && end >= orderStart;
    });

    const quantity = item.quantity || 1;
    return overlappingOrders.length < quantity;
  }

  async blockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
    userId?: string,
    role?: string,
  ): Promise<IRentalItem> {
    const item = await this._rentalRepository.getItemById(itemId);
    if (!item) throw new AppError("Item not found", HttpStatus.NOT_FOUND);

    if (role !== "admin") {
      if (!item.ownerId) {
        throw new AppError("Item owner not found", HttpStatus.FORBIDDEN);
      }
      const ownerIdStr = this._getUserId(item.ownerId);
      if (ownerIdStr !== userId) throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    }

    const isAvailable = await this.checkItemAvailability(itemId, startDate, endDate);
    if (!isAvailable)
      throw new AppError(
        "Cannot block dates: Item is booked or already blocked",
        HttpStatus.BAD_REQUEST,
      );

    const newBlockedDates = [...(item.blockedDates || []), { startDate, endDate, reason }];
    const updated = await this._rentalRepository.updateItem(itemId, {
      blockedDates: newBlockedDates,
    });
    return updated!;
  }

  async getUnavailableDates(
    itemId: string,
  ): Promise<{ startDate: Date; endDate: Date; reason?: string; type: "BOOKED" | "BLOCKED" }[]> {
    const item = await this._rentalRepository.getItemById(itemId);
    if (!item) throw new AppError("Item not found", HttpStatus.NOT_FOUND);

    const unavailable: {
      startDate: Date;
      endDate: Date;
      reason?: string;
      type: "BOOKED" | "BLOCKED";
    }[] = [];

    if (item.blockedDates) {
      item.blockedDates.forEach((b) =>
        unavailable.push({
          startDate: b.startDate,
          endDate: b.endDate,
          reason: b.reason || "Owner Blocked",
          type: "BLOCKED",
        }),
      );
    }

    const orders = await this._rentalRepository.getItemOrders(itemId);
    orders.forEach((order) => {
      if (!["CANCELLED", "REJECTED", "COMPLETED", "RETURNED"].includes(order.status as string)) {
        unavailable.push({ startDate: order.startDate, endDate: order.endDate, type: "BOOKED" });
      }
    });
    return unavailable;
  }

  async unblockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    userId: string,
    role?: string,
  ): Promise<IRentalItem> {
    const item = await this._rentalRepository.getItemById(itemId);
    if (!item) throw new AppError("Item not found", HttpStatus.NOT_FOUND);

    if (role !== "admin") {
      if (!item.ownerId) {
        throw new AppError("Item owner not found", HttpStatus.FORBIDDEN);
      }
      const ownerIdStr = this._getUserId(item.ownerId);
      if (ownerIdStr !== userId) throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentBlocked = item.blockedDates || [];
    const newBlockedDates = currentBlocked.filter(
      (b) => !(start <= new Date(b.endDate) && end >= new Date(b.startDate)),
    );

    const updated = await this._rentalRepository.updateItem(itemId, {
      blockedDates: newBlockedDates,
    });
    return updated!;
  }
}
