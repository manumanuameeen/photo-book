import {
  IRentalOrderService,
  IRentalDashboardStats,
} from "../../interfaces/services/rental/IRentalOrderService";
import { IRentalOrder, RentalStatus } from "../../models/rentalOrder.model";
import { BookingModel } from "../../models/booking.model";
import { ReviewModel } from "../../models/review.model";
import { IRentalItem } from "../../models/rentalItem.model";
import { IRentalOrderRepository } from "../../interfaces/repositories/rental/IRentalOrderRepository";
import { IRentalItemRepository } from "../../interfaces/repositories/rental/IRentalItemRepository";
import { IRentalPaymentService } from "../../interfaces/services/rental/IRentalPaymentService";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IRentalItemService } from "../../interfaces/services/rental/IRentalItemService";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import { StripeService } from "../booking/stripe.service";
import mongoose from "mongoose";

export class RentalOrderService implements IRentalOrderService {
  private readonly _orderRepo: IRentalOrderRepository;
  private readonly _itemRepo: IRentalItemRepository;
  private readonly _itemService: IRentalItemService;
  private readonly _paymentService: IRentalPaymentService;
  private readonly _userRepo: IUserRepository;
  private readonly _stripeService: StripeService;

  constructor(
    orderRepo: IRentalOrderRepository,
    itemRepo: IRentalItemRepository,
    itemService: IRentalItemService,
    paymentService: IRentalPaymentService,
    userRepo: IUserRepository,
    stripeService: StripeService,
  ) {
    this._orderRepo = orderRepo;
    this._itemRepo = itemRepo;
    this._itemService = itemService;
    this._paymentService = paymentService;
    this._userRepo = userRepo;
    this._stripeService = stripeService;
  }

  private _getUserId(user: unknown): string {
    if (!user) return "";
    if (typeof user === "string") return user;
    if (user instanceof mongoose.Types.ObjectId) return user.toString();
    if (typeof user === "object" && "_id" in user) {
      return (user as { _id: string | mongoose.Types.ObjectId })._id.toString();
    }
    return String(user);
  }

  async rentItem(
    renterId: string,
    itemIds: string[],
    startDate: Date,
    endDate: Date,
    paymentIntentId?: string,
    paymentMethod: "ONLINE" | "CASH" = "ONLINE",
  ): Promise<{ order: IRentalOrder; clientSecret?: string }> {
    let totalAmount = 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) throw new AppError("Invalid rental period", HttpStatus.BAD_REQUEST);

    const existingOrders = await this._orderRepo.getUserOrders(renterId, 1, 100);
    const pendingOrder = existingOrders.items.find(
      (o) =>
        o.status === RentalStatus.WAITING_FOR_DEPOSIT &&
        new Date(o.startDate).getTime() === startDate.getTime() &&
        new Date(o.endDate).getTime() === endDate.getTime() &&
        JSON.stringify(o.items) === JSON.stringify(itemIds),
    );

    if (pendingOrder) {
      for (const id of itemIds) {
        const isAvailable = await this._itemService.checkItemAvailability(id, startDate, endDate);
        if (!isAvailable) {
          await this._orderRepo.updateOrder(String(pendingOrder._id), {
            status: RentalStatus.CANCELLED,
          });
          throw new AppError("Items no longer available. Order cancelled.", HttpStatus.CONFLICT);
        }
      }

      let checkoutUrl: string | undefined;
      if (paymentMethod === "ONLINE") {
        const session = await this._paymentService.createDepositPaymentIntent(
          String(pendingOrder._id),
        );
        checkoutUrl = session.url;
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
    if (hasDuplicate) throw new AppError("Pending request already exists.", HttpStatus.CONFLICT);

    for (const id of itemIds) {
      const item = await this._itemRepo.getItemById(id);
      if (!item) throw new AppError(`Item ${id} not found`, HttpStatus.NOT_FOUND);

      await this.validateRentalItem(item, renterId, startDate, endDate, days);
      totalAmount += item.pricePerDay * days;
    }

    const depositeRequired = Math.round(totalAmount * 0.25);
    const orderData = {
      renterId: new mongoose.Types.ObjectId(renterId),
      items: itemIds.map((id) => new mongoose.Types.ObjectId(id)),
      startDate,
      endDate,
      totalAmount,
      depositeRequired,
      taxAmount: 0,
      status: RentalStatus.WAITING_FOR_DEPOSIT,
      paymentId: "",
      paymentMethod,
    };

    const order = await this._orderRepo.createOrder(orderData as unknown as IRentalOrder);
    let checkoutUrl: string | undefined;

    if (paymentMethod === "ONLINE") {
      const session = await this._paymentService.createDepositPaymentIntent(String(order._id));
      checkoutUrl = session.url;
    }

    return { order, clientSecret: checkoutUrl };
  }

  async getUserRentalOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    return await this._orderRepo.getUserOrders(userId, page, limit, search, status);
  }

  async getOwnerRentalOrders(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    return await this._orderRepo.getOwnerOrders(ownerId, page, limit, search, status);
  }

  async acceptRentalOrder(orderId: string, _ownerId: string): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);
    if (order.status !== "PENDING" && order.status !== "WAITING_FOR_DEPOSIT") {
      throw new AppError("Invalid order status", HttpStatus.BAD_REQUEST);
    }

    if (order.paymentId) {
      return await this._paymentService.confirmRentalPayment(orderId, order.paymentId);
    }
    return (await this._orderRepo.updateOrder(orderId, {
      status: RentalStatus.WAITING_FOR_DEPOSIT,
    }))!;
  }

  async rejectRentalOrder(orderId: string, _ownerId: string): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    if (order.paymentId) {
      const paymentIntent = await this._stripeService.retrievePaymentIntent(order.paymentId);
      if (paymentIntent.amount > 0) {
        await this._stripeService.refundPayment(order.paymentId, paymentIntent.amount / 100);
      }
    }
    return (await this._orderRepo.updateOrder(orderId, { status: RentalStatus.REJECTED }))!;
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    _userId: string,
    _role?: string,
  ): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    const updated = await this._orderRepo.updateOrder(orderId, {
      status: status as RentalStatus,
    });

    if (["ONGOING", "COMPLETED", "RETURNED"].includes(status)) {
      await this._paymentService.completeRentalOrder(orderId);
    }
    return updated!;
  }

  async getOrderDetails(orderId: string): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);
    return order;
  }

  async cancelRentalOrder(orderId: string, _userId: string): Promise<IRentalOrder> {
    return (await this._orderRepo.updateOrder(orderId, { status: RentalStatus.CANCELLED }))!;
  }

  async getRentalDashboardStats(userId: string): Promise<IRentalDashboardStats> {
    const listings = await this._itemRepo.getUserListings(userId, 1, 1);
    const ownerStats = await this._orderRepo.getOwnerStats(userId);
    const renterStats = await this._orderRepo.getRenterStats(userId);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const photoSpendStats = await BookingModel.aggregate([
      { $match: { userId: userObjectId, status: "COMPLETED", paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const photographerSpending = photoSpendStats[0]?.total || 0;

    const reviewStats = await ReviewModel.aggregate([
      { $match: { targetId: userObjectId } },
      { $group: { _id: null, total: { $sum: 1 }, avg: { $avg: "$rating" } } },
    ]);
    const totalReviews = reviewStats[0]?.total || 0;
    const averageRating = reviewStats[0]?.avg ? Number(reviewStats[0].avg.toFixed(1)) : 0;

    return {
      hosting: {
        totalListings: listings.total,
        ...ownerStats,
        totalReviews,
        averageRating,
      },
      renting: {
        ...renterStats,
        photographerSpending,
      },
    };
  }

  private async validateRentalItem(
    item: IRentalItem,
    renterId: string,
    startDate: Date,
    endDate: Date,
    _days: number,
  ) {
    if (item.ownerId) {
      const ownerIdStr = this._getUserId(item.ownerId);
      if (ownerIdStr === renterId) {
        throw new AppError("Cannot rent own item", HttpStatus.BAD_REQUEST);
      }
    }
    const isAvailable = await this._itemService.checkItemAvailability(
      item._id!.toString(),
      startDate,
      endDate,
    );
    if (!isAvailable) {
      throw new AppError(`Item ${item.name} is not available`, HttpStatus.BAD_REQUEST);
    }
  }

  async requestReschedule(
    orderId: string,
    startDate: Date,
    endDate: Date,
    reason: string,
  ): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    for (const itemId of order.items) {
      const isAvailable = await this._itemService.checkItemAvailability(
        itemId.toString(),
        startDate,
        endDate,
      );
      if (!isAvailable) {
        throw new AppError(
          "One or more items are not available for the requested dates",
          HttpStatus.CONFLICT,
        );
      }
    }

    const updatedOrder = await this._orderRepo.updateOrder(orderId, {
      rescheduleRequest: {
        requestedStartDate: startDate,
        requestedEndDate: endDate,
        reason,
        status: "pending",
        createdAt: new Date(),
      },
    });

    return updatedOrder!;
  }

  async respondToReschedule(
    orderId: string,
    decision: "accepted" | "rejected",
  ): Promise<IRentalOrder> {
    const order = await this._orderRepo.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    if (!order.rescheduleRequest || order.rescheduleRequest.status !== "pending") {
      throw new AppError("No pending reschedule request found", HttpStatus.BAD_REQUEST);
    }

    if (decision === "rejected") {
      const updated = await this._orderRepo.updateOrder(orderId, {
        rescheduleRequest: {
          ...order.rescheduleRequest,
          status: "rejected",
        },
      });
      return updated!;
    }

    const newStart = order.rescheduleRequest.requestedStartDate;
    const newEnd = order.rescheduleRequest.requestedEndDate;

    for (const itemId of order.items) {
      const isAvailable = await this._itemService.checkItemAvailability(
        itemId.toString(),
        newStart,
        newEnd,
      );
      if (!isAvailable) {
        throw new AppError(
          "Items are no longer available for the requested dates",
          HttpStatus.CONFLICT,
        );
      }
    }

    const updated = await this._orderRepo.updateOrder(orderId, {
      startDate: newStart,
      endDate: newEnd,
      rescheduleRequest: {
        ...order.rescheduleRequest,
        status: "approved",
      },
    });

    return updated!;
  }
}


