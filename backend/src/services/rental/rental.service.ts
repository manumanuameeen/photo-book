import mongoose from "mongoose";
import { HttpStatus } from "../../constants/httpStatus";
import { IRentalRepository } from "../../interfaces/repositories/IRentalRepository";
import { IRentalDashboardStats, IRentalService } from "../../interfaces/services/IRentalService";
import { IMessageService } from "../../interfaces/services/IMessageService";
import { CreateRentalItemDTO, UpdateRentalItemDTO } from "../../dto/rental.dto";
import { IRentalItem } from "../../models/rentalItem.model";
import { IRentalOrder, RentalStatus, RentalOrderModel } from "../../models/rentalOrder.model";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { AppError } from "../../utils/AppError";
import { Messages } from "../../constants/messages";
import { IRentalAvailabilityService } from "../../interfaces/services/rental/IRentalAvailabilityService";
import { IRentalFinanceService } from "../../interfaces/services/rental/IRentalFinanceService";
type MongoReference = string | mongoose.Types.ObjectId | { _id: string | mongoose.Types.ObjectId };

export class RentalService implements IRentalService {
  constructor(
    private readonly _rentalRepository: IRentalRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _availabilityService: IRentalAvailabilityService,
    private readonly _financeService: IRentalFinanceService,
    private readonly _messageService: IMessageService,
  ) {}

  private _getUserId(user: MongoReference | unknown): string | null {
    if (!user) return "";
    if (typeof user === "string") return user;
    if (user instanceof mongoose.Types.ObjectId) return user.toString();
    if (typeof user === "object" && "_id" in user) {
      return (user as { _id: string | mongoose.Types.ObjectId })._id.toString();
    }
    return "";
  }

  async createRentalItem(data: CreateRentalItemDTO): Promise<IRentalItem> {
    const itemData: Partial<IRentalItem> = {
      ...data,
      ownerId: data.ownerId ? new mongoose.Types.ObjectId(data.ownerId) : undefined,
      status: "AVAILABLE",
    };
    return await this._rentalRepository.createItem(itemData as IRentalItem);
  }

  async getAllRentalItems(
    category?: string,
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<{ items: IRentalItem[]; total: number }> {
    const filter: mongoose.FilterQuery<IRentalItem> = { status: "AVAILABLE" };
    if (category) {
      filter.category = category;
    }
    if (userId) {
      try {
        filter.ownerId = { $ne: new mongoose.Types.ObjectId(userId) };
      } catch (error: unknown) {
        console.warn(`[RentalService] Invalid userId for filtering: ${userId}`, error);
        filter.ownerId = { $ne: userId };
      }
    }
    return await this._rentalRepository.getItems(filter, page, limit);
  }

  async getAdminRentalItems(
    status?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ items: IRentalItem[]; total: number }> {
    const filter: mongoose.FilterQuery<IRentalItem> = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    return await this._rentalRepository.getItems(filter, page, limit);
  }

  async getRentalItemDetails(itemId: string): Promise<IRentalItem> {
    const item = await this._rentalRepository.getItemById(itemId);
    if (!item) {
      throw new AppError("Item not found", HttpStatus.NOT_FOUND);
    }
    return item;
  }

  async updateRentalItem(itemId: string, data: UpdateRentalItemDTO): Promise<IRentalItem> {
    const updated = await this._rentalRepository.updateItem(itemId, data);
    if (!updated) {
      throw new AppError("Item not found", HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  async deleteRentalItem(itemId: string): Promise<void> {
    const deleted = await this._rentalRepository.deleteItem(itemId);
    if (!deleted) {
      throw new AppError("Item not found", HttpStatus.NOT_FOUND);
    }
  }

  async rentItem(
    renterId: string,
    itemIds: string[],
    startDate: Date,
    endDate: Date,
    paymentIntentId?: string,
    paymentMethod: "ONLINE" | "CASH" | "wallet" | "stripe" = "ONLINE",
    frontendUrl?: string,
  ): Promise<{ order: IRentalOrder; clientSecret?: string }> {
    let totalAmount = 0;

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) {
      throw new AppError("Invalid rental period", HttpStatus.BAD_REQUEST);
    }

    const existingOrders = await this._rentalRepository.getUserOrders(renterId, 1, 100);
    const pendingOrder = existingOrders.items.find(
      (o) =>
        o.status === RentalStatus.WAITING_FOR_DEPOSIT &&
        new Date(o.startDate).getTime() === startDate.getTime() &&
        new Date(o.endDate).getTime() === endDate.getTime() &&
        JSON.stringify(o.items) === JSON.stringify(itemIds),
    );

    if (pendingOrder) {
      for (const id of itemIds) {
        const isAvailable = await this._availabilityService.checkItemAvailability(
          id,
          startDate,
          endDate,
        );
        if (!isAvailable) {
          throw new AppError(
            "Sorry, one or more items are no longer available for these dates. Your saved order has been cancelled.",
            HttpStatus.CONFLICT,
          );
        }
      }

      let checkoutUrl: string | undefined;

      if (paymentMethod === "ONLINE" || paymentMethod === "stripe") {
        try {
          const deposit =
            pendingOrder.depositeRequired || Math.round(pendingOrder.totalAmount * 0.25);
          const renterEmail = (pendingOrder.renterId as { email?: string })?.email || "";

          checkoutUrl = await this._financeService.createInitialPaymentSession(
            pendingOrder,
            deposit,
            renterEmail,
            frontendUrl,
          );
        } catch (err: unknown) {
          console.error("Stripe Retry Session Creation Failed:", err);
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          throw new AppError(
            `Payment initialization failed: ${errorMessage}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return { order: pendingOrder, clientSecret: checkoutUrl };
    }

    const hasDuplicate = existingOrders.items.some(
      (o) =>
        o.status === RentalStatus.PENDING &&
        new Date(o.startDate).getTime() === startDate.getTime() &&
        new Date(o.endDate).getTime() === endDate.getTime() &&
        JSON.stringify(o.items) === JSON.stringify(itemIds),
    );

    if (hasDuplicate) {
      throw new AppError(
        "You already have a pending request for these dates.",
        HttpStatus.CONFLICT,
      );
    }

    const items = await Promise.all(itemIds.map((id) => this._rentalRepository.getItemById(id)));

    for (const item of items) {
      if (!item) {
        throw new AppError("Item not found", HttpStatus.NOT_FOUND);
      }

      await this._validateRentalItem(item, renterId, startDate, endDate, days);

      totalAmount += item.pricePerDay * days;
    }

    const taxAmount = 0;
    const finalTotal = totalAmount;
    const depositeRequired = Math.round(finalTotal * 0.25);

    const orderData = {
      renterId: new mongoose.Types.ObjectId(renterId),
      items: itemIds.map((id) => new mongoose.Types.ObjectId(id)),
      startDate,
      endDate,
      totalAmount: finalTotal,
      depositeRequired: depositeRequired,
      taxAmount,
      status: RentalStatus.WAITING_FOR_DEPOSIT,
      paymentId: "",
      idProof: "",
      paymentMethod: paymentMethod === "CASH" ? "CASH" : "ONLINE",
    };
    const savedOrder = await this._rentalRepository.createOrder(
      orderData as unknown as IRentalOrder,
    );

    try {
      const itemNames = items.map((i) => (i as { name: string })?.name).join(", ");
      const firstOwnerId = items[0]?.ownerId?.toString();
      if (firstOwnerId) {
        await this._messageService.sendMessage(
          renterId,
          firstOwnerId,
          `I've sent a rental request for your item(s): "${itemNames}" from ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}.`,
        );
      }
    } catch (err: unknown) {
      console.error("[RentalService] Failed to send initial rental message:", err);
    }

    let checkoutUrl: string | undefined;

    if (paymentMethod === "ONLINE" || paymentMethod === "stripe") {
      try {
        const depositeRequired = Math.round(finalTotal * 0.25);
        const renter = await this._userRepository.findById(String(renterId));
        const renterEmail = renter?.email || "";

        checkoutUrl = await this._financeService.createInitialPaymentSession(
          savedOrder,
          depositeRequired,
          renterEmail,
          frontendUrl,
        );
      } catch (err: unknown) {
        console.error("Stripe Session Creation Failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw new AppError(
          `Payment initialization failed: ${errorMessage}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    console.log(`[RentalService] Created order ${savedOrder._id}`);
    return { order: savedOrder, clientSecret: checkoutUrl };
  }

  private async _validateRentalItem(
    item: IRentalItem,
    renterId: string,
    startDate: Date,
    endDate: Date,
    days: number,
  ) {
    if (item.ownerId) {
      const ownerIdStr = this._getOwnerIdString(item.ownerId);
      if (ownerIdStr === renterId) {
        throw new AppError("You cannot rent your own item", HttpStatus.BAD_REQUEST);
      }
    }

    const isAvailable = await this._availabilityService.checkItemAvailability(
      String(item._id),
      startDate,
      endDate,
    );
    if (!isAvailable) {
      throw new AppError(
        `Item ${item.name} is not available for the selected dates`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (item.status !== "AVAILABLE") {
      throw new AppError(
        `Item ${item.name} is currently ${item.status.toLowerCase()}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (item.maxRentalPeriod && days > item.maxRentalPeriod) {
      throw new AppError(
        `Item ${item.name} cannot be rented for more than ${item.maxRentalPeriod} days`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (item.minRentalPeriod && days < item.minRentalPeriod) {
      throw new AppError(
        `Item ${item.name} requires a minimum rental of ${item.minRentalPeriod} days`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async confirmRentalPayment(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    return this._financeService.confirmRentalPayment(orderId, paymentIntentId);
  }

  async getUserRentalOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }> {
    return await this._rentalRepository.getUserOrders(userId, page, limit, search, status);
  }

  async getOwnerRentalOrders(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }> {
    return await this._rentalRepository.getOwnerOrders(ownerId, page, limit, search, status);
  }

  async getAllRentalOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ orders: IRentalOrder[]; total: number }> {
    return await this._rentalRepository.getAllOrders(page, limit, search, status);
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    userId: string,
    role?: string,
  ): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    this._validateOrderStatusPermissions(order, status, userId, role);

    const updated = await this._rentalRepository.updateOrder(orderId, {
      status: status as RentalStatus,
    });

    if (
      status === RentalStatus.ONGOING ||
      status === RentalStatus.COMPLETED ||
      status === RentalStatus.RETURNED
    ) {
      await this._financeService.releaseFundsToOwners(order);
    }

    return updated!;
  }

  private _validateOrderStatusPermissions(
    order: IRentalOrder,
    status: string,
    userId: string,
    role?: string,
  ): void {
    if (role === "admin") return;

    const isRenter = this._isOrderRenter(order, userId);
    const isOwner = this._isOrderOwner(order, userId);

    if (isRenter) {
      this._validateRenterStatusUpdate(status, order.status);
    } else if (isOwner) {
      if (([RentalStatus.ONGOING] as string[]).includes(status)) {
        throw new AppError("Only renter can confirm receipt", HttpStatus.FORBIDDEN);
      }
    } else {
      throw new AppError("Unauthorized to update this order", HttpStatus.FORBIDDEN);
    }
  }

  private _isOrderRenter(order: IRentalOrder, userId: string): boolean {
    const renterId = this._getOwnerIdString(order.renterId);
    return renterId === userId;
  }

  private _isOrderOwner(order: IRentalOrder, userId: string): boolean {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) return false;

    const firstItem = order.items[0];
    if (this._isPopulatedItem(firstItem)) {
      return (order.items as unknown as IRentalItem[]).some((item) => {
        const ownerId = this._getOwnerIdString(item.ownerId);
        return ownerId === userId;
      });
    }
    return false;
  }

  private _isPopulatedItem(item: unknown): item is IRentalItem {
    return (
      typeof item === "object" &&
      item !== null &&
      "ownerId" in item &&
      (item as IRentalItem).ownerId !== undefined
    );
  }

  private _getOwnerIdString(ownerId: unknown): string {
    if (!ownerId) return "";
    if (typeof ownerId === "string") return ownerId;
    if (ownerId instanceof mongoose.Types.ObjectId) return ownerId.toString();
    if (typeof ownerId === "object" && "_id" in ownerId)
      return (ownerId as { _id: mongoose.Types.ObjectId })._id.toString();
    return String(ownerId);
  }

  private _validateRenterStatusUpdate(newStatus: string, currentStatus: string): void {
    if (
      !([RentalStatus.CANCELLED, RentalStatus.ONGOING, RentalStatus.RETURNED] as string[]).includes(
        newStatus,
      )
    ) {
      throw new AppError("Unauthorized status update for renter", HttpStatus.FORBIDDEN);
    }
    if (newStatus === RentalStatus.ONGOING && currentStatus !== RentalStatus.SHIPPED) {
      throw new AppError("Can only confirm receipt when status is SHIPPED", HttpStatus.BAD_REQUEST);
    }
  }

  async cancelRentalOrder(
    orderId: string,
    userId: string,
    reason?: string,
    isEmergency?: boolean,
  ): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    if (
      (
        [
          RentalStatus.COMPLETED,
          RentalStatus.CANCELLED,
          RentalStatus.REJECTED,
          RentalStatus.SHIPPED,
          RentalStatus.ONGOING,
          RentalStatus.DELIVERED,
          RentalStatus.RETURNED,
        ] as string[]
      ).includes(order.status as string)
    ) {
      throw new AppError(
        "Order cannot be cancelled at this stage. Please use the return process if the item has been shipped.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    order.cancellationDate = now;
    order.cancellationReason = reason || "No reason provided";
    order.cancelledBy = userId;
    order.isEmergency = isEmergency || false;

    await this._financeService.processCancellationRefund(order, userId, isEmergency);

    const updated = await this._rentalRepository.updateOrder(orderId, {
      status: RentalStatus.CANCELLED,
      cancellationDate: order.cancellationDate,
      cancellationReason: order.cancellationReason,
      cancelledBy: order.cancelledBy,
      isEmergency: order.isEmergency,
      refundAmount: order.refundAmount,
      penaltyAmount: order.penaltyAmount,
    });

    try {
      const cancellingUserId = userId.toString();
      const renterId = this._getUserId(order.renterId);

      let ownerId = "";
      const orderWithItems = await order.populate("items");
      if (orderWithItems.items && orderWithItems.items.length > 0) {
        const firstItem = orderWithItems.items[0];
        if (this._isPopulatedItem(firstItem)) {
          ownerId = this._getOwnerIdString(firstItem.ownerId);
        }
      }

      const isRenter = cancellingUserId === renterId;
      const recipientId = isRenter ? ownerId : renterId;

      if (recipientId) {
        await this._messageService.sendMessage(
          cancellingUserId,
          recipientId,
          `The rental order for ${new Date(order.startDate).toDateString()} has been cancelled. Reason: ${reason || "Not specified"}`,
        );
      }
    } catch (error: unknown) {
      console.error("[RentalService] Failed to send cancellation message:", error);
    }

    return updated!;
  }

  async getOrderDetails(orderId: string): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);
    return order;
  }

  async acceptRentalOrder(orderId: string, userId: string): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError(Messages.RENTAL_ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);

    if (order.status !== "PENDING" && order.status !== "WAITING_FOR_DEPOSIT")
      throw new AppError(`Cannot accept order with status ${order.status}`, HttpStatus.BAD_REQUEST);

    if (order.paymentId) {
      if (order.status === "PENDING") {
        await this._rentalRepository.updateOrder(orderId, {
          status: RentalStatus.WAITING_FOR_DEPOSIT,
        });
      }

      try {
        const updatedOrder = await this._financeService.payRentalDeposit(orderId, order.paymentId);

        try {
          const renterId = this._getUserId(updatedOrder.renterId);
          const ownerId = userId.toString();

          if (renterId) {
            await this._messageService.sendMessage(
              ownerId,
              renterId,
              `I've approved your rental request for ${new Date(updatedOrder.startDate).toDateString()}. Please pay the deposit to confirm.`,
            );
          }
        } catch (error: unknown) {
          console.error("[RentalService] Failed to send approval message:", error);
        }
        return updatedOrder;
      } catch (error: unknown) {
        console.error(
          `[RentalService] Failed to auto-capture payment for accepted order ${orderId}:`,
          error,
        );

        const updated = await this._rentalRepository.getOrderById(orderId);
        return updated!;
      }
    } else {
      const updatedOrder = (await this._rentalRepository.updateOrder(orderId, {
        status: RentalStatus.WAITING_FOR_DEPOSIT,
      }))!;

      try {
        const renterId = this._getUserId(updatedOrder.renterId);
        const ownerId = userId.toString();

        if (renterId) {
          await this._messageService.sendMessage(
            ownerId,
            renterId,
            `I've approved your rental request for ${new Date(updatedOrder.startDate).toDateString()}. Please pay the deposit to confirm.`,
          );
        }
      } catch (error: unknown) {
        console.error("[RentalService] Failed to send approval message:", error);
      }
      return updatedOrder;
    }
  }

  async rejectRentalOrder(orderId: string, _ownerId: string): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError(Messages.RENTAL_ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);

    if (order.status !== "PENDING" && order.status !== "WAITING_FOR_DEPOSIT")
      throw new AppError(`Cannot reject order with status ${order.status}`, HttpStatus.BAD_REQUEST);

    await this._financeService.refundOrderPayment(orderId);

    return (await this._rentalRepository.updateOrder(orderId, { status: RentalStatus.REJECTED }))!;
  }

  async createDepositPaymentIntent(
    orderId: string,
    frontendUrl?: string,
  ): Promise<{ url: string; sessionId: string }> {
    return this._financeService.createDepositPaymentIntent(orderId, frontendUrl);
  }

  async createBalancePaymentIntent(
    orderId: string,
    frontendUrl?: string,
  ): Promise<{ url: string; sessionId: string }> {
    return this._financeService.createBalancePaymentIntent(orderId, frontendUrl);
  }

  async payRentalBalance(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    return this._financeService.payRentalBalance(orderId, paymentIntentId);
  }

  async payRentalDeposit(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    return this._financeService.payRentalDeposit(orderId, paymentIntentId);
  }

  async completeRentalOrder(orderId: string): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    if (order.status !== "ONGOING" && order.status !== "RETURNED" && order.status !== "DELIVERED") {
      throw new AppError("Order is not in a valid state to complete", HttpStatus.BAD_REQUEST);
    }

    await this._financeService.releaseFundsToOwners(order);

    const updatedOrder = await this._rentalRepository.updateOrder(orderId, {
      status: RentalStatus.COMPLETED,
    });
    return updatedOrder!;
  }

  async returnItem(orderId: string): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    await this._financeService.releaseFundsToOwners(order);

    return (await this._rentalRepository.updateOrder(orderId, { status: RentalStatus.COMPLETED }))!;
  }

  async getUserRentalItems(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: IRentalItem[]; total: number }> {
    return await this._rentalRepository.getUserListings(userId, page, limit);
  }

  async updateRentalItemStatus(
    itemId: string,
    status: string,
    userId: string,
    role: string,
  ): Promise<IRentalItem> {
    const item = await this._rentalRepository.getItemById(itemId);
    if (!item) throw new AppError("Item not found", HttpStatus.NOT_FOUND);

    if (role !== "admin") {
      if (!item.ownerId)
        throw new AppError("Item owner not found", HttpStatus.INTERNAL_SERVER_ERROR);
      const ownerIdStr = this._getOwnerIdString(item.ownerId);
      if (ownerIdStr !== userId) {
        throw new AppError("Unauthorized access to rental item", HttpStatus.FORBIDDEN);
      }
      if (["BLOCKED", "REJECTED", "PENDING"].includes(item.status)) {
        throw new AppError(
          `Cannot change status of ${item.status.toLowerCase()} items`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (status !== "AVAILABLE" && status !== "UNAVAILABLE") {
        throw new AppError("Invalid status update", HttpStatus.BAD_REQUEST);
      }
    }

    const updated = await this._rentalRepository.updateItemStatus(itemId, status);
    if (!updated) throw new AppError("Item not found", HttpStatus.NOT_FOUND);
    return updated;
  }

  async checkItemAvailability(itemId: string, startDate: Date, endDate: Date): Promise<boolean> {
    return this._availabilityService.checkItemAvailability(itemId, startDate, endDate);
  }

  async blockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
    userId?: string,
    role?: string,
  ): Promise<IRentalItem> {
    return this._availabilityService.blockRentalDates(
      itemId,
      startDate,
      endDate,
      reason,
      userId,
      role,
    );
  }

  async getUnavailableDates(
    itemId: string,
  ): Promise<{ startDate: Date; endDate: Date; reason?: string; type: "BOOKED" | "BLOCKED" }[]> {
    return this._availabilityService.getUnavailableDates(itemId);
  }

  async unblockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    userId: string,
    role?: string,
  ): Promise<IRentalItem> {
    return this._availabilityService.unblockRentalDates(itemId, startDate, endDate, userId, role);
  }

  async requestReschedule(
    orderId: string,
    requestedStartDate: Date,
    requestedEndDate: Date,
    _reason: string,
  ): Promise<IRentalOrder> {
    const order = await RentalOrderModel.findById(orderId).populate("items");
    if (!order) throw new AppError(Messages.RENTAL_ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);

    if (
      order.status === RentalStatus.CANCELLED ||
      order.status === RentalStatus.COMPLETED ||
      order.status === RentalStatus.REJECTED
    ) {
      throw new AppError(
        "Cannot reschedule a completed or cancelled order",
        HttpStatus.BAD_REQUEST,
      );
    }

    const { newTotalAmount, newAmountPaid } = await this._financeService.handleRescheduleFinancials(
      order,
      requestedStartDate,
      requestedEndDate,
    );

    const isAvailable = await this._availabilityService.checkItemAvailability(
      String(order.items[0]._id),
      requestedStartDate,
      requestedEndDate,
      String(order._id),
    );

    if (!isAvailable) {
      throw new AppError("Requested dates are not available", HttpStatus.CONFLICT);
    }

    order.startDate = requestedStartDate;
    order.endDate = requestedEndDate;
    order.totalAmount = newTotalAmount;

    if (newAmountPaid !== undefined) {
      order.amountPaid = newAmountPaid;
    }

    order.rescheduleRequest = undefined;

    await order.save();
    return order;
  }

  async respondToReschedule(
    orderId: string,
    action: "approve" | "reject",
    userId: string,
    role?: string,
    _reason?: string,
  ): Promise<IRentalOrder> {
    const order = await RentalOrderModel.findById(orderId).populate("items");
    if (!order) throw new AppError(Messages.RENTAL_ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);

    this._validateReschedulePermissions(order, userId, role);

    if (!order.rescheduleRequest || order.rescheduleRequest.status !== "pending") {
      throw new AppError("No pending reschedule request found", HttpStatus.BAD_REQUEST);
    }

    if (action === "reject") {
      order.rescheduleRequest.status = "rejected";
    } else {
      await this._processRescheduleApproval(order);
    }

    await order.save();
    return order;
  }

  private _validateReschedulePermissions(order: IRentalOrder, userId: string, role?: string): void {
    if (role === "admin") return;

    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    if (firstItem && this._isPopulatedItem(firstItem)) {
      const ownerId = this._getOwnerIdString(firstItem.ownerId);
      if (ownerId !== userId) {
        throw new AppError("Unauthorized to respond to this request", HttpStatus.FORBIDDEN);
      }
    }
  }

  private async _processRescheduleApproval(order: IRentalOrder): Promise<void> {
    if (!order.rescheduleRequest) return;
    const { requestedStartDate, requestedEndDate } = order.rescheduleRequest;

    if (!requestedStartDate || !requestedEndDate) {
      throw new AppError("Invalid reschedule dates", HttpStatus.BAD_REQUEST);
    }

    for (const item of order.items) {
      const itemId = this._getUserId(item);
      if (!itemId) throw new AppError("Invalid item ID", HttpStatus.BAD_REQUEST);
      const isAvailable = await this._availabilityService.checkItemAvailability(
        itemId,
        requestedStartDate,
        requestedEndDate,
      );
      if (!isAvailable) {
        throw new AppError("Item is not available for the selected dates", HttpStatus.CONFLICT);
      }
    }

    const { newTotalAmount, newAmountPaid } = await this._financeService.handleRescheduleFinancials(
      order,
      requestedStartDate,
      requestedEndDate,
    );

    order.startDate = requestedStartDate;
    order.endDate = requestedEndDate;
    order.totalAmount = newTotalAmount;
    if (newAmountPaid !== undefined) {
      order.amountPaid = newAmountPaid;
    }
    order.rescheduleRequest.status = "approved";
  }
  async getRentalDashboardStats(userId: string): Promise<IRentalDashboardStats> {
    return this._financeService.getRentalDashboardStats(userId);
  }

  async toggleLike(id: string, userId: string): Promise<IRentalItem> {
    const item = await this._rentalRepository.toggleLike(id, userId);
    if (!item) {
      throw new AppError("Rental item not found", HttpStatus.NOT_FOUND);
    }
    return item;
  }
}
