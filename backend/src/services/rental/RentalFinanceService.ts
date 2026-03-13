import { IRentalRepository } from "../../interfaces/repositories/IRentalRepository.ts";
import {
  IRentalOrder,
  RentalStatus,
  IRentalOrderPopulated,
  IRentalPopulatedItem,
} from "../../models/rentalOrder.model.ts";
import { IPopulatedUser } from "../../models/booking.model.ts";
import mongoose from "mongoose";
import { StripeService } from "../implementation/booking/StripeService.ts";
import { IWalletService } from "../../interfaces/services/IWalletService.ts";
import { IPaymentService } from "../../interfaces/services/IPaymentService.ts";
import { PdfService } from "../implementation/common/PdfService.ts";
import { AppError } from "../../utils/AppError.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { IEmailService } from "../../interfaces/services/IEmailService.ts";
import { IRentalFinanceService } from "../../interfaces/services/rental/IRentalFinanceService.ts";
import { IRentalAvailabilityService } from "../../interfaces/services/rental/IRentalAvailabilityService.ts";

export interface IRentalFinanceDashboardStats {
  hosting: {
    totalEarnings: number;
    activeRentals: number;
    totalListings: number;
    totalOrders: number;
    monthlyEarnings: Array<{ month: string; amount: number }>;
    recentActivity: IRentalOrder[];
  };
  renting: {
    totalSpent: number;
    activeRents: number;
    totalOrders: number;
    recentActivity: IRentalOrder[];
  };
}

export class RentalFinanceService implements IRentalFinanceService {
  constructor(
    private readonly _rentalRepository: IRentalRepository,
    private readonly _stripeService: StripeService,
    private readonly _walletService: IWalletService,
    private readonly _paymentService: IPaymentService,
    private readonly _emailService: IEmailService,
    private readonly _pdfService: PdfService,
    private readonly _availabilityService: IRentalAvailabilityService,
  ) {}

  private _getUserId(
    user:
      | string
      | mongoose.Types.ObjectId
      | IPopulatedUser
      | IRentalPopulatedItem
      | null
      | undefined,
  ): string {
    if (!user) return "";
    if (typeof user === "string") return user;
    if (user instanceof mongoose.Types.ObjectId) return user.toString();
    if (typeof user === "object" && "_id" in user) {
      return (user as { _id: mongoose.Types.ObjectId })._id.toString();
    }
    return String(user);
  }

  async createInitialPaymentSession(
    order: IRentalOrder,
    depositAmount: number,
    renterEmail: string,
  ): Promise<string> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=success&orderId=${String(order._id)}&session_id={CHECKOUT_SESSION_ID}&paymentType=deposit`;
    const cancelUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=cancel`;

    try {
      const session = await this._stripeService.createCheckoutSession(
        depositAmount,
        "usd",
        {
          orderId: String(order._id),
          type: "rental_initial_payment",
        },
        successUrl,
        cancelUrl,
        renterEmail,
      );

      await this._rentalRepository.updateOrder(String(order._id), {
        paymentId: session.id,
      });

      return session.url!;
    } catch (err: unknown) {
      console.error("Stripe Session Creation Failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      throw new AppError(`Payment initialization failed: ${errorMessage}`, HttpStatus.BAD_REQUEST);
    }
  }

  async confirmRentalPayment(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    if (order.paymentId === paymentIntentId && order.status === RentalStatus.CONFIRMED) {
      console.warn(`[RentalFinanceService] Order ${orderId} already confirmed. Skipping.`);
      return order;
    }

    for (const item of order.items as unknown as IRentalPopulatedItem[]) {
      const itemId = this._getUserId(item);
      const isAvailable = await this._availabilityService.checkItemAvailability(
        itemId,
        order.startDate,
        order.endDate,
      );

      if (!isAvailable) {
        console.warn(
          `[RentalFinanceService] Race condition: Item ${itemId} unavailable for Order ${orderId}.`,
        );
        const paymentIntent = await this._stripeService.retrievePaymentIntent(paymentIntentId);
        if (
          (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture") &&
          paymentIntent.amount > 0
        ) {
          await this._stripeService.refundPayment(paymentIntentId, paymentIntent.amount / 100);
        }
        await this._rentalRepository.updateOrder(orderId, { status: RentalStatus.CANCELLED });
        throw new AppError(
          "One or more items no longer available. Payment refunded.",
          HttpStatus.CONFLICT,
        );
      }
    }

    const paymentIntent = await this._stripeService.retrievePaymentIntent(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      throw new AppError("Payment not succeeded", HttpStatus.BAD_REQUEST);
    }

    try {
      await this._paymentService.processDepositPayment(
        orderId,
        "rental",
        paymentIntentId,
        paymentIntent.amount / 100,
      );
    } catch (error: unknown) {
      console.error(
        `[RentalFinanceService] Failed to process deposit split for order ${orderId}:`,
        error,
      );
    }

    const updated = await this._rentalRepository.updateOrder(orderId, {
      paymentId: paymentIntentId,
      status: RentalStatus.CONFIRMED,
      amountPaid: order.depositeRequired || Math.round(order.totalAmount * 0.35),
    });

    return updated!;
  }

  async createDepositPaymentIntent(orderId: string): Promise<{ url: string; sessionId: string }> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    if (order.status !== "WAITING_FOR_DEPOSIT")
      throw new AppError("Order is not valid for deposit payment", HttpStatus.BAD_REQUEST);

    for (const item of order.items as unknown as IRentalPopulatedItem[]) {
      const itemId = this._getUserId(item);
      const isAvailable = await this._availabilityService.checkItemAvailability(
        itemId,
        order.startDate,
        order.endDate,
      );
      if (!isAvailable) {
        await this._rentalRepository.updateOrder(orderId, { status: RentalStatus.CANCELLED });
        throw new AppError("Items no longer available. Order cancelled.", HttpStatus.CONFLICT);
      }
    }

    if (order.paymentId) {
      try {
        const existingIntent = await this._stripeService.retrievePaymentIntent(order.paymentId);
        if (existingIntent.status === "succeeded") {
          await this.payRentalDeposit(orderId, order.paymentId);
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
          return {
            url: `${frontendUrl}/main/dashboard?tab=rentals&payment=success&orderId=${orderId}&session_id=${existingIntent.id}`,
            sessionId: existingIntent.id,
          };
        }
      } catch (error: unknown) {
        console.warn("Failed to check existing payment intent:", error);
      }
    }

    const amount = order.depositeRequired || Math.round(order.totalAmount * 0.25);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=success&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}&paymentType=deposit`;
    const cancelUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=cancel`;

    const session = await this._stripeService.createCheckoutSession(
      amount,
      "usd",
      { orderId, type: "rental_initial_payment" },
      successUrl,
      cancelUrl,
      (order.renterId as unknown as IPopulatedUser).email,
    );
    await this._rentalRepository.updateOrder(orderId, { paymentId: session.id });
    return { url: session.url!, sessionId: session.id };
  }

  async createBalancePaymentIntent(orderId: string): Promise<{ url: string; sessionId: string }> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);
    if (order.status !== "CONFIRMED" && order.status !== "ONGOING" && order.status !== "SHIPPED") {
      throw new AppError("Order not in state to pay balance", HttpStatus.BAD_REQUEST);
    }
    const amountPaid = order.amountPaid || 0;
    const remaining = order.totalAmount - amountPaid;
    if (remaining <= 0) throw new AppError("Balance already paid", HttpStatus.BAD_REQUEST);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=success&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}&paymentType=balance`;
    const cancelUrl = `${frontendUrl}/main/dashboard?tab=rentals&payment=cancel`;

    const session = await this._stripeService.createCheckoutSession(
      remaining,
      "usd",
      { orderId, type: "rental_balance" },
      successUrl,
      cancelUrl,
      (order.renterId as unknown as IPopulatedUser).email,
    );
    return { url: session.url!, sessionId: session.id };
  }

  async payRentalDeposit(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);
    if (order.status !== "WAITING_FOR_DEPOSIT")
      throw new AppError("Order invalid for deposit", HttpStatus.BAD_REQUEST);

    let actualPaymentIntentId = paymentIntentId;
    if (paymentIntentId.startsWith("cs_")) {
      const session = await this._stripeService.retrieveCheckoutSession(paymentIntentId);
      if (session.payment_status !== "paid")
        throw new AppError("Payment not paid in session", HttpStatus.BAD_REQUEST);
      actualPaymentIntentId = session.payment_intent as string;
    }

    const paymentIntent = await this._stripeService.retrievePaymentIntent(actualPaymentIntentId);
    if (paymentIntent.status !== "succeeded")
      throw new AppError("Payment verification failed", HttpStatus.BAD_REQUEST);

    for (const item of order.items as unknown as IRentalPopulatedItem[]) {
      const itemId = this._getUserId(item);
      const isAvailable = await this._availabilityService.checkItemAvailability(
        itemId,
        order.startDate,
        order.endDate,
      );
      if (!isAvailable) {
        if (paymentIntent.amount > 0)
          await this._stripeService.refundPayment(paymentIntentId, paymentIntent.amount / 100);
        await this._rentalRepository.updateOrder(orderId, { status: RentalStatus.CANCELLED });
        throw new AppError("Items unavailable. Payment refunded.", HttpStatus.CONFLICT);
      }
    }

    await this._paymentService.processDepositPayment(
      orderId,
      "rental",
      paymentIntentId,
      paymentIntent.amount / 100,
    );

    const updatedOrder = await this._rentalRepository.updateOrder(orderId, {
      status: RentalStatus.CONFIRMED,
      paymentId: paymentIntentId,
      amountPaid: order.depositeRequired || Math.round(order.totalAmount * 0.25),
    });

    if (updatedOrder) {
      const pdfBuffer = await this._pdfService.generateRentalAgreement(updatedOrder);
      const renterEmail = (updatedOrder.renterId as unknown as IPopulatedUser).email;
      await this._emailService.sendMail(
        renterEmail,
        "Rental Agreement - Payment Confirmed",
        "Please find your rental agreement attached.",
        `<h1>Payment Success</h1><p>Your rental order #${updatedOrder._id} is confirmed.</p>`,
        [{ filename: `rental-agreement-${orderId}.pdf`, content: pdfBuffer }],
      );
    }
    return updatedOrder!;
  }

  async payRentalBalance(orderId: string, paymentIntentId: string): Promise<IRentalOrder> {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (!order) throw new AppError("Order not found", HttpStatus.NOT_FOUND);

    let actualPaymentIntentId = paymentIntentId;
    if (paymentIntentId.startsWith("cs_")) {
      const session = await this._stripeService.retrieveCheckoutSession(paymentIntentId);
      if (session.payment_status !== "paid")
        throw new AppError("Payment not paid", HttpStatus.BAD_REQUEST);
      actualPaymentIntentId = session.payment_intent as string;
    }
    const paymentIntent = await this._stripeService.retrievePaymentIntent(actualPaymentIntentId);
    if (paymentIntent.status !== "succeeded")
      throw new AppError("Payment verification failed", HttpStatus.BAD_REQUEST);

    const amountPaidNow = paymentIntent.amount / 100;
    await this._paymentService.processBalancePayment(
      orderId,
      "rental",
      paymentIntentId,
      amountPaidNow,
    );

    const updatedOrder = await this._rentalRepository.updateOrder(orderId, {
      amountPaid: (order.amountPaid || 0) + amountPaidNow,
      finalPaymentId: paymentIntentId,
    });

    if (updatedOrder && updatedOrder.amountPaid >= updatedOrder.totalAmount) {
      if (
        ["ONGOING", "COMPLETED", "RETURNED", "DELIVERED"].includes(updatedOrder.status as string)
      ) {
        await this.releaseFundsToOwners(updatedOrder);
      }
    }
    return updatedOrder!;
  }

  async releaseFundsToOwners(order: IRentalOrder) {
    await this._paymentService.releaseFunds(String(order._id), "rental");
  }

  async processCancellationRefund(
    order: IRentalOrder,
    cancelledByUserId: string,
    isEmergency?: boolean,
  ) {
    const now = new Date();
    const startDate = new Date(order.startDate);
    const createdAt = new Date(order.createdAt);
    const hoursDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const minutesSinceBooking = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    const isSystem = false;
    let isOwner = false;

    const renterId = this._getOwnerIdString(order.renterId);

    if (renterId !== cancelledByUserId) {
      isOwner = this._isOrderOwner(order, cancelledByUserId);
    }

    let refundPercentage = 0;
    if (isSystem || isEmergency) {
      refundPercentage = 1;
    } else if (isOwner) {
      refundPercentage = 1;
      if (hoursDiff < 24) {
        const penaltyAmount = order.totalAmount * 0.1;
        try {
          await this._walletService.debitWallet(
            cancelledByUserId,
            penaltyAmount,
            `Penalty: Late Cancellation for Order #${order._id.toString()}`,
            order._id.toString(),
          );
          await this._walletService.creditWallet(
            "admin",
            penaltyAmount,
            `Fee: Owner Late Cancellation for Order #${order._id.toString()}`,
            order._id.toString(),
          );
          console.log(
            `[RentalFinanceService] Charged owner ${cancelledByUserId} penalty of ${penaltyAmount}`,
          );
        } catch (error: unknown) {
          console.error("[RentalFinanceService] Failed to charge owner penalty:", error);
        }
      }
    } else {
      if (minutesSinceBooking <= 10) refundPercentage = 1;
      else if (hoursDiff > 48) refundPercentage = 1;
      else if (hoursDiff >= 24) refundPercentage = 0.5;
      else refundPercentage = 0;
    }

    let totalRefundAmount = 0;
    let totalPenaltyAmount = 0;

    if (order.finalPaymentId) {
      try {
        const finalPaymentId = await this._resolvePaymentIntentId(order.finalPaymentId);
        const balanceIntent = await this._stripeService.retrievePaymentIntent(finalPaymentId);
        if (balanceIntent.status === "succeeded") {
          const balanceAmount = balanceIntent.amount / 100;
          totalRefundAmount += balanceAmount;
        }
      } catch (error: unknown) {
        console.error("Failed to retrieve balance payment for refund calculation:", error);
      }
    }

    if (order.paymentId) {
      try {
        const depPaymentId = await this._resolvePaymentIntentId(order.paymentId);
        const depositIntent = await this._stripeService.retrievePaymentIntent(depPaymentId);
        if (depositIntent.status === "succeeded") {
          const depositAmount = depositIntent.amount / 100;
          const depositRefund = depositAmount * refundPercentage;
          const depositPenalty = depositAmount - depositRefund;

          totalRefundAmount += depositRefund;
          totalPenaltyAmount += depositPenalty;
        }
      } catch (error: unknown) {
        console.error("Failed to retrieve deposit payment for refund calculation:", error);
      }
    }

    if (totalRefundAmount > 0 && renterId) {
      try {
        await this._walletService.creditWallet(
          renterId,
          totalRefundAmount,
          `Refund: Rental Order Cancellation #${order._id}`,
          String(order._id),
        );
        console.log(
          `[RentalFinanceService] Refunded ${totalRefundAmount} to wallet for user ${renterId}`,
        );
      } catch (error: unknown) {
        console.error("[RentalFinanceService] Failed to credit wallet for refund:", error);
      }
    }

    order.refundAmount = totalRefundAmount;
    order.penaltyAmount = totalPenaltyAmount;

    if (totalPenaltyAmount > 0) {
      const platformFee = totalPenaltyAmount * 0.1;
      const ownerPayout = totalPenaltyAmount * 0.9;
      await this._distributeCancellationPenalty(order, platformFee, ownerPayout);
    }
  }

  private async _distributeCancellationPenalty(
    order: IRentalOrder,
    platformFee: number,
    ownerPayout: number,
  ) {
    if (!order.paymentId) return;
    await this._walletService.creditWallet(
      "admin",
      platformFee,
      `Cancellation Fee(5%) for Order #${order._id.toString().slice(-6)}`,
      order.paymentId,
    );

    const days =
      Math.ceil(
        (new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) /
          (1000 * 3600 * 24),
      ) + 1;
    const ownerShares = new Map<string, number>();
    let totalItemValue = 0;

    for (const item of order.items as unknown as IRentalPopulatedItem[]) {
      if (!item.ownerId) continue;
      const itemOwnerId = this._getOwnerIdString(item.ownerId);
      if (!itemOwnerId) continue;
      const itemVal = item.pricePerDay * days;
      ownerShares.set(itemOwnerId, (ownerShares.get(itemOwnerId) || 0) + itemVal);
      totalItemValue += itemVal;
    }

    for (const [ownerId, val] of ownerShares) {
      const shareRatio = totalItemValue > 0 ? val / totalItemValue : 0;
      const myPayout = ownerPayout * shareRatio;
      await this._walletService.creditWallet(
        ownerId,
        myPayout,
        `Cancellation Payout(25%) for Order #${order._id.toString().slice(-6)}`,
        order.paymentId,
      );
    }
  }

  async getRentalDashboardStats(userId: string): Promise<IRentalFinanceDashboardStats> {
    const { total: totalListings } = await this._rentalRepository.getUserListings(userId, 1, 1);
    const { items: hostingOrders } = await this._rentalRepository.getOwnerOrders(userId, 1, 1000);

    const { totalEarnings, activeRentals, monthlyMap } = this._calculateUserEarnings(
      hostingOrders,
      userId,
    );

    const monthlyEarnings = Array.from(monthlyMap.entries()).map(([month, amount]) => ({
      month,
      amount: Math.round(amount * 100) / 100,
    }));

    const { items: rentingOrders } = await this._rentalRepository.getUserOrders(userId, 1, 1000);

    let totalSpent = 0;
    let activeRents = 0;
    const now = new Date();

    for (const order of rentingOrders) {
      if (order.amountPaid) {
        totalSpent += order.amountPaid;
      }

      const end = new Date(order.endDate);

      const isActiveStatus = ["CONFIRMED", "ONGOING", "SHIPPED", "DELIVERED"].includes(
        order.status,
      );

      if (isActiveStatus && end >= now) {
        activeRents++;
      }
    }

    return {
      hosting: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        activeRentals,
        totalListings,
        totalOrders: hostingOrders.length,
        monthlyEarnings,
        recentActivity: hostingOrders.slice(0, 5),
      },
      renting: {
        totalSpent: Math.round(totalSpent * 100) / 100,
        activeRents: activeRents,
        totalOrders: rentingOrders.length,
        recentActivity: rentingOrders.slice(0, 5),
      },
    };
  }

  private _calculateUserEarnings(orders: IRentalOrder[], userId: string) {
    let totalEarnings = 0;
    let activeRentals = 0;
    const monthlyMap = new Map<string, number>();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "numeric" });
      monthlyMap.set(key, 0);
    }

    for (const order of orders) {
      if (order.status === "CONFIRMED" || order.status === "COMPLETED") {
        this._calculateOrderEarnings(order, userId, monthlyMap, (netEarnings) => {
          totalEarnings += netEarnings;
        });
      }
      if (order.status === "CONFIRMED") {
        const end = new Date(order.endDate);
        if (end >= now) {
          activeRentals++;
        }
      }
    }
    return { totalEarnings, activeRentals, monthlyMap };
  }

  private _calculateOrderEarnings(
    order: IRentalOrder,
    userId: string,
    monthlyMap: Map<string, number>,
    addToTotal: (net: number) => void,
  ) {
    let orderEarnings = 0;
    const days =
      Math.ceil(
        (new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) /
          (1000 * 3600 * 24),
      ) + 1;

    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items as unknown as IRentalPopulatedItem[]) {
        const ownerId = this._getOwnerIdString(item.ownerId);
        if (ownerId === userId) {
          orderEarnings += item.pricePerDay * days;
        }
      }
    }

    const platformFeePercentage = 0.13;
    const netEarnings = orderEarnings * (1 - platformFeePercentage);
    addToTotal(netEarnings);

    const monthKey = new Date(order.startDate).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + netEarnings);
    }
  }

  private _getOwnerIdString(
    ownerId:
      | string
      | mongoose.Types.ObjectId
      | { _id: mongoose.Types.ObjectId }
      | IRentalPopulatedItem
      | null
      | undefined,
  ): string | null {
    if (!ownerId) return null;
    if (typeof ownerId === "string") return ownerId;
    if (ownerId instanceof mongoose.Types.ObjectId) return ownerId.toString();
    if (typeof ownerId === "object" && "_id" in ownerId) {
      const idObj = ownerId as { _id: unknown };
      if (idObj._id instanceof mongoose.Types.ObjectId) {
        return idObj._id.toString();
      }
      return String(idObj._id);
    }
    return String(ownerId);
  }

  private _isOrderOwner(order: IRentalOrder, userId: string): boolean {
    if (!order.items || !Array.isArray(order.items)) return false;
    return (order.items as unknown as IRentalPopulatedItem[]).some((item) => {
      const ownerId = this._getOwnerIdString(item.ownerId);
      return ownerId === userId;
    });
  }

  async verifyAndProcessDeposit(orderId: string, paymentId: string): Promise<boolean> {
    const paymentIntent = await this._stripeService.retrievePaymentIntent(paymentId);
    if (paymentIntent.status !== "succeeded") return false;

    await this._paymentService.processDepositPayment(
      orderId,
      "rental",
      paymentId,
      paymentIntent.amount / 100,
    );
    return true;
  }

  async refundOrderPayment(orderId: string) {
    const order = await this._rentalRepository.getOrderById(orderId);
    if (order && order.paymentId) {
      try {
        const paymentIntent = await this._stripeService.retrievePaymentIntent(order.paymentId);
        const amountPaid = paymentIntent.amount / 100;
        if (amountPaid > 0) {
          await this._stripeService.refundPayment(order.paymentId, amountPaid);
        }
      } catch (error: unknown) {
        console.error(
          `[RentalFinanceService] Failed to refund payment for order ${orderId}`,
          error,
        );
      }
    }
  }
  async handleRescheduleFinancials(
    order: IRentalOrder,
    newStartDate: Date,
    newEndDate: Date,
  ): Promise<{
    newTotalAmount: number;
    balanceAdjustment: number;
    refundAmount: number;
    requiresPayment: boolean;
    newAmountPaid?: number;
  }> {
    const diffTime = Math.abs(newEndDate.getTime() - newStartDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) throw new AppError("Invalid rental duration", HttpStatus.BAD_REQUEST);

    let newTotalAmount = 0;
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items as unknown as IRentalPopulatedItem[]) {
        if (item && item.pricePerDay) {
          newTotalAmount += item.pricePerDay * days;
        }
      }
    }

    const amountPaid = order.amountPaid || 0;
    let balanceAdjustment = 0;
    let refundAmount = 0;
    let requiresPayment = false;

    if (order.status === RentalStatus.WAITING_FOR_DEPOSIT) {
      return { newTotalAmount, balanceAdjustment: 0, refundAmount: 0, requiresPayment: false };
    }

    if (
      order.status === RentalStatus.CONFIRMED ||
      order.status === RentalStatus.ONGOING ||
      order.status === RentalStatus.SHIPPED ||
      order.status === RentalStatus.DELIVERED
    ) {
      if (newTotalAmount > order.totalAmount) {
        const isFullyPaid = amountPaid >= order.totalAmount;
        if (isFullyPaid) {
          requiresPayment = true;
          balanceAdjustment = newTotalAmount - order.totalAmount;
        } else {
          balanceAdjustment = 0;
        }
      } else if (newTotalAmount < order.totalAmount) {
        if (amountPaid > newTotalAmount) {
          refundAmount = amountPaid - newTotalAmount;

          if (order.paymentId) {
            let remainingRefund = refundAmount;

            if (order.finalPaymentId && remainingRefund > 0) {
              try {
                const finalPaymentId = await this._resolvePaymentIntentId(order.finalPaymentId);
                const pi = await this._stripeService.retrievePaymentIntent(finalPaymentId);
                const available = pi.amount / 100;
                const toRefund = Math.min(available, remainingRefund);
                if (toRefund > 0) {
                  await this._stripeService.refundPayment(finalPaymentId, toRefund);
                  remainingRefund -= toRefund;
                }
              } catch (error: unknown) {
                console.error("[RentalFinance] Failed to refund balance payment", error);
              }
            }

            if (order.paymentId && remainingRefund > 0) {
              try {
                const depPaymentId = await this._resolvePaymentIntentId(order.paymentId);
                await this._stripeService.refundPayment(depPaymentId, remainingRefund);
              } catch (error: unknown) {
                console.error("[RentalFinance] Failed to refund deposit payment", error);
              }
            }

            order.amountPaid = newTotalAmount;
          }
        }
      }
    }

    return {
      newTotalAmount,
      balanceAdjustment,
      refundAmount,
      requiresPayment,
      newAmountPaid: order.amountPaid,
    };
  }

  private async _resolvePaymentIntentId(id: string): Promise<string> {
    console.log(`[RentalFinance] Resolving ID: ${id}`);
    if (id && id.startsWith("cs_")) {
      try {
        const session = await this._stripeService.retrieveCheckoutSession(id);
        console.log("[RentalFinance] Retrieved Session. PaymentIntent:", session.payment_intent);

        if (session && session.payment_intent) {
          return typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id;
        }
        console.warn(`[RentalFinanceService] Session ${id} has no payment_intent. Cannot resolve.`);

        throw new Error(`Session ${id} has no associated PaymentIntent.`);
      } catch (error: unknown) {
        console.error(`[RentalFinanceService] Failed to resolve session ${id}:`, error);
        throw error;
      }
    }
    return id;
  }
}
