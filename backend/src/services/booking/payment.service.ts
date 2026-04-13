import mongoose from "mongoose";
import { IPaymentService } from "../../interfaces/services/IPaymentService";
import { IWalletService } from "../../interfaces/services/IWalletService";
import { IMessageService } from "../../interfaces/services/IMessageService";
import { IEmailService } from "../../interfaces/services/IEmailService";
import { IStripeService } from "../../interfaces/services/IStripeService";
import { IRentalRepository } from "../../interfaces/repositories/IRentalRepository";
import { IBookingRepository } from "../../interfaces/repositories/IBookingRepository";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";

type MaybePopulated<T> = T | mongoose.Types.ObjectId;

interface RentalItemForPayment {
  ownerId?: MaybePopulated<{ _id?: mongoose.Types.ObjectId; name?: string }>;
  pricePerDay: number;
}

interface RentalOrderForPayment {
  renterId: MaybePopulated<{ name?: string }>;
  items: MaybePopulated<RentalItemForPayment>[];
  _id: mongoose.Types.ObjectId;
  startDate: Date | string;
  endDate: Date | string;
  totalAmount: number;
  amountPaid: number;
}

export class PaymentService implements IPaymentService {
  private readonly _RENTAL_ADMIN_COMMISSION = 0.08;
  private readonly _BOOKING_ADMIN_COMMISSION = 0.13;

  private readonly _walletService: IWalletService;
  private readonly _messageService: IMessageService;
  private readonly _emailService: IEmailService;
  private readonly _stripeService: IStripeService;
  private readonly _rentalRepository: IRentalRepository;
  private readonly _bookingRepository: IBookingRepository;

  constructor(
    walletService: IWalletService,
    messageService: IMessageService,
    emailService: IEmailService,
    stripeService: IStripeService,
    rentalRepository: IRentalRepository,
    bookingRepository: IBookingRepository,
  ) {
    this._walletService = walletService;
    this._messageService = messageService;
    this._emailService = emailService;
    this._stripeService = stripeService;
    this._rentalRepository = rentalRepository;
    this._bookingRepository = bookingRepository;
  }

  private _getUserId(user: unknown): string {
    if (!user) return "";
    if (typeof user === "string") return user;
    if (typeof user === "object" && "_id" in user) {
      return (user as { _id: string | { toString(): string } })._id.toString();
    }
    return String(user);
  }

  async processDepositPayment(
    entityId: string,
    entityType: "rental" | "booking",
    paymentIntentId: string,
    amountPaid: number,
  ): Promise<void> {
    let customerName = "";
    let providerName = "";

    if (entityType === "rental") {
      const order = await this._rentalRepository.getOrderById(entityId);
      if (!order) throw new AppError("Rental Order not found", HttpStatus.NOT_FOUND);

      customerName = (order.renterId as { name?: string })?.name || "Unknown User";
      const items = (order.items as unknown as RentalItemForPayment[]) || [];
      if (items.length > 0 && items[0].ownerId) {
        providerName = (items[0].ownerId as unknown as { name?: string }).name || "Unknown Owner";
      }

      await this._walletService.creditWallet(
        "admin",
        amountPaid,
        "Rental Deposit - Escrow Held",
        paymentIntentId,
        customerName,
        providerName,
      );

      const owners = this._getRentalOwners(order as unknown as RentalOrderForPayment);
      for (const ownerId of owners.keys()) {
        try {
          await this._messageService.sendSystemMessage(
            ownerId,
            `New Rental Order #${String(order._id).slice(-6)} Confirmed! Payment held in escrow. Funds released on completion.`,
          );
        } catch (error: unknown) {
          console.warn(`Failed to notify owner ${ownerId}`, error);
        }
      }
    } else {
      const booking = await this._bookingRepository.findById(entityId);
      if (!booking) throw new AppError("Booking not found", HttpStatus.NOT_FOUND);

      customerName =
        (booking.userId as { name?: string })?.name ||
        booking.contactDetails?.name ||
        "Unknown User";
      providerName = (booking.photographerId as { name?: string })?.name || "Unknown Photographer";

      await this._walletService.creditWallet(
        "admin",
        amountPaid,
        "Booking Deposit - Escrow Held",
        paymentIntentId,
        customerName,
        providerName,
      );

      const photographerId = this._getUserId(booking.photographerId);

      if (photographerId) {
        await this._messageService.sendSystemMessage(
          photographerId,
          `New Booking #${String(booking._id).slice(-6)} Confirmed! Deposit held in escrow. Funds released on completion.`,
        );
      }
    }
  }

  async processBalancePayment(
    entityId: string,
    entityType: "rental" | "booking",
    paymentIntentId: string,
    amountPaid: number,
  ): Promise<void> {
    let customerName = "";
    let providerName = "";

    if (entityType === "rental") {
      const order = await this._rentalRepository.getOrderById(entityId);
      if (order) {
        customerName = (order.renterId as { name?: string })?.name || "Unknown User";
        const items = (order.items as unknown as RentalItemForPayment[]) || [];
        if (items.length > 0 && items[0].ownerId) {
          providerName = (items[0].ownerId as unknown as { name?: string }).name || "Unknown Owner";
        }
      }
    } else {
      const booking = await this._bookingRepository.findById(entityId);
      if (booking) {
        customerName =
          (booking.userId as { name?: string })?.name ||
          booking.contactDetails?.name ||
          "Unknown User";
        providerName =
          (booking.photographerId as { name?: string })?.name || "Unknown Photographer";
      }
    }

    await this._walletService.creditWallet(
      "admin",
      amountPaid,
      `${entityType === "rental" ? "Rental" : "Booking"} Balance - Escrow Held`,
      paymentIntentId,
      customerName,
      providerName,
    );
  }

  async releaseFunds(
    entityId: string,
    entityType: "rental" | "booking",
    ownerId?: string,
  ): Promise<void> {
    if (entityType === "rental") {
      const order = await this._rentalRepository.getOrderById(entityId);
      if (!order || order.fundsReleased) return;

      if (order.amountPaid < order.totalAmount) {
        console.log(
          `[PaymentService] Skipping fund release for rental #${entityId}: Not fully paid ($${order.amountPaid}/$${order.totalAmount})`,
        );
        return;
      }

      const totalAmount = order.totalAmount;
      const adminFee = totalAmount * this._RENTAL_ADMIN_COMMISSION;
      const distributableAmount = totalAmount - adminFee;

      const customerName = (order.renterId as { name?: string })?.name || "Unknown User";

      const owners = this._getRentalOwners(order as RentalOrderForPayment);

      const ownersToPay = ownerId ? [ownerId] : Array.from(owners.keys());

      for (const oId of ownersToPay) {
        const ownerItemValue = owners.get(oId);
        if (!ownerItemValue) continue;

        const ratio = totalAmount > 0 ? ownerItemValue / totalAmount : 0;
        const myShare = distributableAmount * ratio;

        let providerName = "Item Owner";
        const items = (order.items as unknown as RentalItemForPayment[]) || [];
        const itemForOwner = items.find(
          (it) =>
            String(
              (it.ownerId as unknown as { _id?: mongoose.Types.ObjectId })._id || it.ownerId,
            ) === String(oId),
        );
        if (itemForOwner && itemForOwner.ownerId) {
          providerName =
            (itemForOwner.ownerId as unknown as { name?: string }).name || "Item Owner";
        }

        await this._walletService.debitWallet(
          "admin",
          myShare,
          `Payout Release for Rental #${String(order._id)}`,
          String(order._id),
          customerName,
          providerName,
        );

        await this._walletService.creditWallet(
          oId,
          myShare,
          `Rental Income #${String(order._id)}`,
          String(order._id),
          customerName,
          providerName,
        );

        await this._messageService.sendSystemMessage(
          oId.toString(),
          `Funds for ${entityType} #${entityId.toString().slice(-6)} ($${myShare.toFixed(2)}) have been released to your wallet.`,
        );
      }

      if (!ownerId || ownersToPay.length === owners.size) {
        await this._rentalRepository.updateOrder(entityId, { fundsReleased: true });
      }
    } else {
      const booking = await this._bookingRepository.findById(entityId);
      if (!booking) {
        console.error(`[PaymentService] Booking not found for releaseFunds: ${entityId}`);
        return;
      }
      if (booking.fundsReleased) {
        console.log(`[PaymentService] Funds already released for booking #${entityId}`);
        return;
      }

      if (booking.paymentStatus !== "full_paid") {
        console.log(
          `[PaymentService] Skipping fund release for booking #${entityId}: Not fully paid (${booking.paymentStatus})`,
        );
        return;
      }
      console.log(`[PaymentService] Processing fund release for booking #${entityId}`);

      let targetOwnerId = ownerId;
      if (!targetOwnerId) {
        targetOwnerId = this._getUserId(booking.photographerId);
      }

      if (!targetOwnerId) {
        console.warn(`[PaymentService] No photographer found for booking release #${entityId}`);
        return;
      }

      const totalAmount = booking.totalAmount || 0;
      const adminFee = totalAmount * this._BOOKING_ADMIN_COMMISSION;
      const photographerShare = totalAmount - adminFee;

      const customerName =
        (booking.userId as { name?: string })?.name || booking.contactDetails?.name || "";
      const photographerName = (booking.photographerId as { name?: string })?.name || "";

      const adminWallet = await this._walletService.getWallet("admin");
      if (!adminWallet || adminWallet.balance < photographerShare) {
        console.warn(
          `[PaymentService] Admin funds insufficient (Bal: ${adminWallet?.balance}, Req: ${photographerShare}). Auto-seeding.`,
        );
        await this._walletService.creditWallet(
          "admin",
          photographerShare + 500,
          "System Auto-Seed for Payout",
          String(booking._id),
          customerName,
          photographerName,
        );
      }

      console.log(
        `[PaymentService] Debiting Admin Wallet: $${photographerShare} for Booking #${String(booking._id)}`,
      );
      await this._walletService.debitWallet(
        "admin",
        photographerShare,
        `Payout Release for Booking #${String(booking._id)}`,
        String(booking._id),
        customerName,
        photographerName,
      );

      await this._walletService.creditWallet(
        targetOwnerId,
        photographerShare,
        `Booking Income #${String(booking._id)}`,
        String(booking._id),
        customerName,
        photographerName,
      );

      await this._messageService.sendSystemMessage(
        targetOwnerId.toString(),
        `Funds for ${entityType} #${entityId.toString().slice(-6)} ($${photographerShare.toFixed(2)}) have been released to your wallet.`,
      );

      await this._bookingRepository.update(entityId, { fundsReleased: true });
    }
  }

  async processRefund(
    entityId: string,
    entityType: "rental" | "booking",
    amount: number,
    reason: string,
  ): Promise<void> {
    try {
      let paymentIntentId = "";
      let customerName = "";
      let providerName = "";

      if (entityType === "rental") {
        const order = await this._rentalRepository.getOrderById(entityId);
        if (order) {
          paymentIntentId = order.paymentId || "";
          customerName = (order.renterId as { name?: string })?.name || "Unknown User";
          const items = (order.items as unknown as RentalItemForPayment[]) || [];
          if (items.length > 0 && items[0].ownerId) {
            providerName =
              (items[0].ownerId as unknown as { name?: string }).name || "Unknown Owner";
          }
        }
      } else {
        const booking = await this._bookingRepository.findById(entityId);
        if (booking) {
          paymentIntentId = booking.transactionId || "";
          customerName =
            (booking.userId as { name?: string })?.name ||
            booking.contactDetails?.name ||
            "Unknown User";
          providerName =
            (booking.photographerId as { name?: string })?.name || "Unknown Photographer";
        }
      }

      if (paymentIntentId) {
        await this._stripeService.refundPayment(paymentIntentId, amount);

        await this._walletService.debitWallet(
          "admin",
          amount,
          `Refund for ${entityType} #${entityId.slice(-6)} - ${reason}`,
          paymentIntentId,
          customerName,
          providerName,
        );

        console.log(
          `Refund processed for ${entityType} ${entityId}: $${amount} - Reason: ${reason}`,
        );
      } else {
        console.warn(`No payment intent found for refunding ${entityType} ${entityId}`);
      }
    } catch (error: unknown) {
      console.error("Refund failed:", error);
      throw new AppError("Refund processing failed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private _getRentalOwners(order: RentalOrderForPayment): Map<string, number> {
    const ownerShares = new Map<string, number>();
    const start = new Date(order.startDate);
    const end = new Date(order.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    for (const item of order.items as unknown as RentalItemForPayment[]) {
      if (!item.ownerId) continue;
      const ownerId = this._getUserId(item.ownerId);
      const itemTotal = item.pricePerDay * days;
      ownerShares.set(ownerId, (ownerShares.get(ownerId) || 0) + itemTotal);
    }
    return ownerShares;
  }
}

