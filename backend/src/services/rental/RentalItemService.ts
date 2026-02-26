import mongoose from "mongoose";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { AppError } from "../../utils/AppError.ts";
import { IRentalItem } from "../../model/rentalItemModel.ts";
import { IRentalItemService } from "../../interfaces/services/rental/IRentalItemService.ts";
import { IRentalItemRepository } from "../../interfaces/repositories/rental/IRentalItemRepository.ts";
import { IRentalOrderRepository } from "../../interfaces/repositories/rental/IRentalOrderRepository.ts";

import { CreateRentalItemDTO, UpdateRentalItemDTO } from "../../dto/rental.dto.ts";

export class RentalItemService implements IRentalItemService {
  private readonly _itemRepository: IRentalItemRepository;
  private readonly _orderRepository: IRentalOrderRepository;

  constructor(itemRepository: IRentalItemRepository, orderRepository: IRentalOrderRepository) {
    this._itemRepository = itemRepository;
    this._orderRepository = orderRepository;
  }

  private _getUserId(
    user: string | mongoose.Types.ObjectId | { _id: string | mongoose.Types.ObjectId },
  ): string {
    if (!user) return "";
    if (typeof user === "string") return user;
    if (user instanceof mongoose.Types.ObjectId) return user.toString();
    if ("_id" in user) return user._id.toString();
    return String(user);
  }

  async createRentalItem(data: CreateRentalItemDTO): Promise<IRentalItem> {
    const { ownerId, ...rest } = data;
    const repositoryData: Partial<IRentalItem> = { ...rest };
    if (ownerId) {
      repositoryData.ownerId = new mongoose.Types.ObjectId(ownerId);
    }
    return await this._itemRepository.createItem(repositoryData);
  }

  async getAllRentalItems(
    category?: string,
    page = 1,
    limit = 10,
    userId?: string,
  ): Promise<{ items: IRentalItem[]; total: number }> {
    const filter: Record<string, unknown> = { status: "AVAILABLE" };
    if (category) {
      filter.category = category;
    }
    if (userId) {
      try {
        filter.ownerId = { $ne: new mongoose.Types.ObjectId(userId) };
      } catch (error: unknown) {
        console.warn(`[RentalItemService] Invalid userId for filtering: ${userId}`, error);
        filter.ownerId = { $ne: userId };
      }
    }
    return await this._itemRepository.getItems(filter, page, limit);
  }

  async getRentalItemDetails(itemId: string): Promise<IRentalItem> {
    const item = await this._itemRepository.getItemById(itemId);
    if (!item) {
      throw new AppError("Item not found", HttpStatus.NOT_FOUND);
    }
    return item;
  }

  async updateRentalItem(itemId: string, data: UpdateRentalItemDTO): Promise<IRentalItem> {
    const repositoryData: Partial<IRentalItem> = { ...data };
    const updated = await this._itemRepository.updateItem(itemId, repositoryData);
    if (!updated) {
      throw new AppError("Item not found", HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  async deleteRentalItem(itemId: string): Promise<void> {
    const deleted = await this._itemRepository.deleteItem(itemId);
    if (!deleted) {
      throw new AppError("Item not found", HttpStatus.NOT_FOUND);
    }
  }

  async getUserRentalItems(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: IRentalItem[]; total: number }> {
    return await this._itemRepository.getUserListings(userId, page, limit);
  }

  async updateRentalItemStatus(
    id: string,
    status: string,
    _userId: string,
    _role: string,
  ): Promise<IRentalItem | null> {
    return await this._itemRepository.updateItemStatus(id, status);
  }

  async checkItemAvailability(itemId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const item = await this._itemRepository.getItemById(itemId);
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

    const orders = await this._orderRepository.getItemOrders(itemId);
    const overlappingOrders = orders.filter((order) => {
      if (
        ["REJECTED", "WAITING_FOR_DEPOSIT", "CANCELLED", "COMPLETED", "RETURNED"].includes(
          order.status as string,
        )
      ) {
        return false;
      }

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
    const item = await this._itemRepository.getItemById(itemId);
    if (!item) throw new AppError("Item not found", HttpStatus.NOT_FOUND);

    if (role !== "admin") {
      if (!item.ownerId) {
        throw new AppError("Item owner not found", HttpStatus.FORBIDDEN);
      }
      const ownerIdStr = item.ownerId.toString();
      if (ownerIdStr !== userId) throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    }

    const isAvailable = await this.checkItemAvailability(itemId, startDate, endDate);
    if (!isAvailable) {
      throw new AppError(
        "Cannot block dates: Item is booked or already blocked",
        HttpStatus.BAD_REQUEST,
      );
    }

    const newBlockedDates = [...(item.blockedDates || []), { startDate, endDate, reason }];

    return (await this._itemRepository.updateItem(itemId, {
      blockedDates: newBlockedDates,
    }))!;
  }

  async getUnavailableDates(
    itemId: string,
  ): Promise<{ startDate: Date; endDate: Date; reason?: string; type: "BOOKED" | "BLOCKED" }[]> {
    const item = await this._itemRepository.getItemById(itemId);
    if (!item) throw new AppError("Item not found", HttpStatus.NOT_FOUND);

    const unavailable: {
      startDate: Date;
      endDate: Date;
      reason?: string;
      type: "BOOKED" | "BLOCKED";
    }[] = [];
    if (item.blockedDates) {
      for (const b of item.blockedDates) {
        unavailable.push({
          startDate: b.startDate,
          endDate: b.endDate,
          reason: b.reason || "Owner Blocked",
          type: "BLOCKED",
        });
      }
    }

    const orders = await this._orderRepository.getItemOrders(itemId);
    for (const order of orders) {
      if (!["CANCELLED", "REJECTED", "COMPLETED"].includes(order.status as string)) {
        unavailable.push({
          startDate: order.startDate,
          endDate: order.endDate,
          type: "BOOKED",
        });
      }
    }
    return unavailable;
  }

  async unblockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    userId: string,
    role?: string,
  ): Promise<IRentalItem> {
    const item = await this._itemRepository.getItemById(itemId);
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

    return (await this._itemRepository.updateItem(itemId, {
      blockedDates: newBlockedDates,
    }))!;
  }

  async toggleLike(itemId: string, userId: string): Promise<IRentalItem> {
    const updated = await this._itemRepository.toggleLike(itemId, userId);
    if (!updated) {
      throw new AppError("Item not found", HttpStatus.NOT_FOUND);
    }
    return updated;
  }
}
