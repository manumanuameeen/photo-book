import { IBookingPaymentService } from "../../interfaces/services/booking/IBookingPaymentService";
import { IBookingRepository } from "../../interfaces/repositories/IBookingRepository";
import { IStripeService } from "../../interfaces/services/IStripeService";
import { IPaymentService } from "../../interfaces/services/IPaymentService";
import { IWalletService } from "../../interfaces/services/IWalletService";
import { IEmailService } from "../../interfaces/services/IEmailService";
import { BookingStatus, IBooking, IPopulatedUser, PaymentStatus } from "../../models/booking.model";
import mongoose from "mongoose";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";

export class BookingPaymentService implements IBookingPaymentService {
  private readonly _CANCELLATION_THRESHOLD_HOURS = 48;

  constructor(
    private readonly _bookingRepository: IBookingRepository,
    private readonly _stripeService: IStripeService,
    private readonly _paymentService: IPaymentService,
    private readonly _walletService: IWalletService,
    private readonly _emailService: IEmailService,
  ) {}

  async createPaymentIntent(
    bookingId: string,
    providedFrontendUrl?: string,
  ): Promise<{ url: string; sessionId: string }> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) throw new AppError("Booking not found", HttpStatus.NOT_FOUND);

    console.log(
      `[CreateCheckout] Booking ${bookingId} status: ${booking.status}, deposit: ${booking.depositeRequired}`,
    );

    let amount = 0;
    let paymentType = "booking_deposit";

    if (booking.status === BookingStatus.WAITING_FOR_DEPOSIT) {
      amount = booking.depositeRequired;

      if (!amount || Number.isNaN(amount) || amount <= 0) {
        if (booking.totalAmount && !Number.isNaN(booking.totalAmount)) {
          amount = booking.totalAmount * 0.2;
        } else {
          throw new AppError("Invalid booking amount data", HttpStatus.BAD_REQUEST);
        }
      }
    } else if (booking.status === BookingStatus.WORK_ENDED) {
      paymentType = "booking_balance";
      amount = booking.totalAmount - booking.depositeRequired;
      if (amount < 0) amount = 0;
    } else {
      throw new AppError(
        `Booking status is ${booking.status}, expected WAITING_FOR_DEPOSIT or WORK_ENDED for payment`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (amount < 1) {
      throw new AppError("Payment amount too small", HttpStatus.BAD_REQUEST);
    }

    const frontendUrl = providedFrontendUrl || process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/main/dashboard?tab=bookings&payment=success&bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/main/dashboard?tab=bookings&payment=cancel`;

    const userEmail = (booking.userId as unknown as IPopulatedUser).email;

    const session = await this._stripeService.createCheckoutSession(
      amount,
      "usd",
      {
        bookingId,
        type: paymentType,
      },
      successUrl,
      cancelUrl,
      userEmail,
    );

    return { url: session.url as string, sessionId: session.id };
  }

  async confirmPayment(bookingId: string, paymentIntentId: string): Promise<IBooking | null> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) throw new AppError("Booking not found", HttpStatus.NOT_FOUND);

    if (
      (booking.status === BookingStatus.ACCEPTED &&
        booking.paymentStatus === PaymentStatus.DEPOSIT_PAID) ||
      booking.paymentStatus === PaymentStatus.FULL_PAID
    ) {
      console.log(
        `[BookingPaymentService] Payment already processed for ${bookingId}. Returning idempotent success.`,
      );
      return booking;
    }

    if (
      booking.status !== BookingStatus.WAITING_FOR_DEPOSIT &&
      booking.status !== BookingStatus.WORK_ENDED &&
      booking.status !== BookingStatus.COMPLETED
    ) {
      console.error(`[BookingPaymentService] Invalid status for payment: ${booking.status}`);
      throw new AppError(
        `Booking is not waiting for payment (Status: ${booking.status})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let actualPaymentIntentId = paymentIntentId;

    if (paymentIntentId.startsWith("cs_")) {
      const session = await this._stripeService.retrieveCheckoutSession(paymentIntentId);
      if (session.payment_status !== "paid") {
        throw new AppError("Payment not paid in session", HttpStatus.BAD_REQUEST);
      }
      actualPaymentIntentId = session.payment_intent as string;
    }

    const paymentIntent = await this._stripeService.retrievePaymentIntent(actualPaymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      console.error(
        `[BookingPaymentService] Payment Intent status expected 'succeeded' but got '${paymentIntent.status}'`,
      );
      throw new AppError(
        `Payment verification failed. Status: ${paymentIntent.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const amountPaid = paymentIntent.amount / 100;

    if (booking.status === BookingStatus.WAITING_FOR_DEPOSIT) {
      booking.status = BookingStatus.ACCEPTED;
      booking.paymentStatus = PaymentStatus.DEPOSIT_PAID;
      booking.paymentDeadline = undefined;

      booking.transactionId = actualPaymentIntentId;

      await this._paymentService.processDepositPayment(
        bookingId,
        "booking",
        actualPaymentIntentId,
        amountPaid,
      );

      if (booking.photographerId) {
        const photographer = booking.photographerId as unknown as IPopulatedUser;
        const photographerEmail = photographer.email;
        const photographerName =
          photographer.personalInfo?.name || photographer.name || "Photographer";

        if (photographerEmail) {
          try {
            await this._emailService.sendBookingConfirmation(
              photographerEmail,
              photographerName || "Photographer",
              {
                eventType: "Booking",
                packageDetails: { name: booking.packageDetails.name as string },
                eventDate: new Date(booking.eventDate).toDateString(),
                location: booking.location || "Online/TBD",
                depositeRequired: booking.depositeRequired,
              },
            );
          } catch (emailError) {
            console.error("Failed to send booking confirmation email to photographer:", emailError);
          }
        }
      }
    } else if (booking.status === BookingStatus.WORK_ENDED) {
      booking.paymentStatus = PaymentStatus.FULL_PAID;
      booking.balanceTransactionId = actualPaymentIntentId;

      await this._paymentService.processBalancePayment(
        bookingId,
        "booking",
        actualPaymentIntentId,
        amountPaid,
      );

      if (booking.status === (BookingStatus.COMPLETED as string)) {
        await this._paymentService.releaseFunds(bookingId, "booking");
      }
    }

    return await booking.save();
  }

  async processCancellation(
    booking: IBooking,
    cancelledByUserId: string,
    reason?: string,
    isEmergency?: boolean,
  ): Promise<void> {
    const now = new Date();
    const eventDate = new Date(booking.eventDate);
    const createdAt = new Date(booking.createdAt);
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const minutesSinceBooking = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    booking.cancellationDate = now;
    booking.cancellationReason = reason || "No reason provided";
    booking.cancelledBy = cancelledByUserId;
    booking.isEmergency = isEmergency || false;

    let isPhotographer = false;
    const isSystem = cancelledByUserId === "system-auto-expiry";

    if (!isSystem && booking.photographerId) {
      const photographerIdStr =
        booking.photographerId instanceof mongoose.Types.ObjectId
          ? booking.photographerId.toString()
          : (booking.photographerId as unknown as IPopulatedUser)._id.toString();
      isPhotographer = photographerIdStr === cancelledByUserId;
    }

    let amountPaid = 0;
    if (
      booking.paymentStatus === PaymentStatus.DEPOSIT_PAID ||
      booking.paymentStatus === PaymentStatus.FULL_PAID
    ) {
      amountPaid = booking.depositeRequired;

      if (booking.paymentStatus === PaymentStatus.FULL_PAID && booking.totalAmount) {
        amountPaid = booking.totalAmount;
      }
    } else {
      booking.refundAmount = 0;
      booking.penaltyAmount = 0;
      return;
    }

    let refundPercentage = 0;
    const penaltyPercentage = 0;
    let note = "";

    if (isSystem) {
      refundPercentage = 1;
      note = "Booking Expired Refund";
    } else if (isPhotographer) {
      refundPercentage = 1;
      note = "Photographer Cancelled - Full Refund";

      if (hoursDiff < 24) {
        const penaltyAmount = amountPaid * 0.1;
        if (penaltyAmount > 0) {
          try {
            await this._walletService.debitWallet(
              cancelledByUserId,
              penaltyAmount,
              `Penalty: Late Booking Cancellation for Booking #${booking._id.toString()}`,
              booking._id.toString(),
            );
            await this._walletService.creditWallet(
              "admin",
              penaltyAmount,
              `Fee: Photographer Late Cancellation for Booking #${booking._id.toString()}`,
              booking._id.toString(),
            );
            console.log(
              `[BookingPaymentService] Charged photographer ${cancelledByUserId} penalty of ${penaltyAmount}`,
            );
          } catch (error) {
            console.error("[BookingPaymentService] Failed to charge photographer penalty:", error);
          }
        }
      }
    } else if (isEmergency) {
      refundPercentage = 1;
      note = "Emergency Cancellation - Full Refund";
    } else {
      if (minutesSinceBooking <= 10) {
        refundPercentage = 1;
        note = "Grace Period Cancellation";
      } else if (hoursDiff > 48) {
        refundPercentage = 1;
        note = "Standard Cancellation (> 48h)";
      } else if (hoursDiff >= 24) {
        refundPercentage = 0.5;
        note = "Late Cancellation (24h-48h)";
      } else {
        refundPercentage = 0;
        note = "Last Minute Cancellation (< 24h)";
      }
    }

    const refundAmount = amountPaid * refundPercentage;
    const penaltyAmount = amountPaid - refundAmount;

    booking.refundAmount = refundAmount;
    booking.penaltyAmount = penaltyAmount;

    if (refundAmount > 0) {
      const userIdStr =
        booking.userId instanceof mongoose.Types.ObjectId
          ? booking.userId.toString()
          : (booking.userId as unknown as IPopulatedUser)._id.toString();

      await this._walletService.creditWallet(
        userIdStr,
        refundAmount,
        `Refund: ${note}`,
        String(booking._id),
      );
      booking.paymentStatus =
        refundPercentage === 1 ? PaymentStatus.REFUNDED : PaymentStatus.PARTIAL_REFUNDED;
    }

    if (penaltyPercentage > 0 || penaltyAmount > 0) {
      if (penaltyAmount > 0) {
        await this._walletService.creditWallet(
          "admin",
          penaltyAmount,
          `Cancellation Penalty: ${note}`,
          String(booking._id),
        );
      }
    }
  }

  async releaseFunds(bookingId: string, userId?: string): Promise<void> {
    await this._paymentService.releaseFunds(bookingId, "booking", userId);
  }
}
