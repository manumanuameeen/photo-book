import { IBookingRepository } from "../../interfaces/repositories/IBookingRepository.ts";
import { IBookingService } from "../../interfaces/services/IBookingService.ts";
import { IEmailService } from "../../interfaces/services/IEmailService.ts";
import { IMessageService } from "../../interfaces/services/IMessageService.ts";
import { IAvailabilityService } from "../../interfaces/services/IPackageAvailabilityService.ts";
import { IWalletService } from "../../interfaces/services/IWalletService.ts";
import { BookingStatus, IBooking, PaymentStatus } from "../../model/bookingModel.ts";
import { BookingQueueService } from "../common/BookingQueueService.ts";
import { IStripeService } from "../../interfaces/services/IStripeService.ts";
import { IPaymentService } from "../../interfaces/services/IPaymentService.ts";
import mongoose from "mongoose";

export class BookingService implements IBookingService {
  private readonly bookingRepository: IBookingRepository;
  private readonly walletService: IWalletService;
  private readonly bookingQueueService: BookingQueueService;
  private readonly emailService: IEmailService;
  private readonly messageService: IMessageService;
  private readonly availabilityService: IAvailabilityService;
  private readonly stripeService: IStripeService;
  private readonly paymentService: IPaymentService;

  private readonly ADMIN_COMMISSION_PERCENT = 0.13;
  private readonly CANCELLATION_THRESHOLD_HOURS = 48;

  constructor(
    bookingRepository: IBookingRepository,
    walletService: IWalletService,
    bookingQueueService: BookingQueueService,
    emailService: IEmailService,
    messageService: IMessageService,
    availabilityService: IAvailabilityService,
    stripeService: IStripeService,
    paymentService: IPaymentService,
  ) {
    this.bookingRepository = bookingRepository;
    this.walletService = walletService;
    this.bookingQueueService = bookingQueueService;
    this.emailService = emailService;
    this.messageService = messageService;
    this.availabilityService = availabilityService;
    this.stripeService = stripeService;
    this.paymentService = paymentService;
  }

  async createBookingRequest(userId: string, data: any): Promise<IBooking> {
    const price = Number(data.packagePrice);
    if (Number.isNaN(price)) {
      throw new Error("Invalid package price");
    }

    // 1. Enforce 1-Day Advance Booking Rule
    const eventDate = new Date(data.date);
    const now = new Date();
    // Reset times to compare dates only, or use 24h difference
    // Using 24h difference for strictness
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      throw new Error("Bookings must be made at least 24 hours in advance.");
    }

    if (userId === data.photographerId) {
      throw new Error("You cannot book your own package.");
    }

    const depositAmount = price * 0.2;

    const bookingData = {
      userId: new mongoose.Types.ObjectId(userId),
      photographerId: new mongoose.Types.ObjectId(data.photographerId),
      packageId: new mongoose.Types.ObjectId(data.packageId),
      packageDetails: {
        name: data.packageName,
        price: price,
        features: data.packageFeatures,
      },
      eventDate: new Date(data.date),
      startTime: data.startTime,
      location: data.location,
      locationCoordinates: {
        lat: data.lat,
        lng: data.lng,
      },
      eventType: data.eventType,
      contactDetails: {
        name: data.contactName,
        email: data.email,
        phone: data.phone,
      },
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount: price,
      depositeRequired: depositAmount,
    };

    return await this.bookingRepository.create(bookingData);
  }

  async getBookingDetails(id: string): Promise<IBooking | null> {
    return await this.bookingRepository.findById(id);
  }

  async getUserBookings(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }> {
    return await this.bookingRepository.findByUser(userId, page, limit, search, status);
  }

  async getPhotographerBookings(
    photographerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }> {
    return await this.bookingRepository.findByPhotographer(
      photographerId,
      page,
      limit,
      search,
      status,
    );
  }

  async acceptBooking(id: string, message?: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== BookingStatus.PENDING) {
      throw new Error("Booking is not in pending state");
    }

    const deadline = new Date(Date.now() + 2 * 60 * 60 * 1000);
    booking.paymentDeadline = deadline;
    booking.status = BookingStatus.WAITING_FOR_DEPOSIT;

    if (message) {
      booking.photographerMessage = message;
    }

    await booking.save();
    await this.bookingQueueService.addPaymentTimer(id);

    try {
      const photographerId = (booking.photographerId as any)._id
        ? (booking.photographerId as any)._id.toString()
        : booking.photographerId.toString();

      await this.availabilityService.markDateAsBooked(photographerId, booking.eventDate);
    } catch (error) {
      console.error("Failed to mark date as booked:", error);
    }

    return booking;
  }

  async rejectBooking(id: string, message?: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    booking.status = BookingStatus.REJECTED;
    if (message) {
      booking.photographerMessage = message;
    }
    return await booking.save();
  }

  async createBookingPaymentIntent(bookingId: string): Promise<any> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

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
          throw new Error("Invalid booking amount data");
        }
      }
    } else if (booking.status === BookingStatus.WORK_ENDED) {
      paymentType = "booking_balance";
      amount = booking.totalAmount - booking.depositeRequired;
      if (amount < 0) amount = 0;
    } else {
      throw new Error(
        `Booking status is ${booking.status}, expected WAITING_FOR_DEPOSIT or WORK_ENDED for payment`,
      );
    }

    if (amount < 1) {
      throw new Error("Payment amount too small");
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/main/dashboard?tab=bookings&payment=success&bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/main/dashboard?tab=bookings&payment=cancel`;

    const userEmail = (booking.userId as any).email;

    const session = await this.stripeService.createCheckoutSession(
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

    return { url: session.url, sessionId: session.id };
  }

  async confirmPayment(id: string, paymentIntentId: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    // Idempotency check: If already paid/accepted, return success immediately
    if (
      (booking.status === BookingStatus.ACCEPTED &&
        booking.paymentStatus === PaymentStatus.DEPOSIT_PAID) ||
      booking.paymentStatus === PaymentStatus.FULL_PAID
    ) {
      console.log(
        `[BookingService] Payment already processed for ${id}. Returning idempotent success.`,
      );
      return booking;
    }

    if (
      booking.status !== BookingStatus.WAITING_FOR_DEPOSIT &&
      booking.status !== BookingStatus.WORK_ENDED &&
      booking.status !== BookingStatus.COMPLETED
    ) {
      console.error(`[BookingService] Invalid status for payment: ${booking.status}`);
      throw new Error(`Booking is not waiting for payment (Status: ${booking.status})`);
    }

    let actualPaymentIntentId = paymentIntentId;

    // Handle Checkout Session ID (starts with cs_)
    if (paymentIntentId.startsWith("cs_")) {
      const session = await this.stripeService.retrieveCheckoutSession(paymentIntentId);
      if (session.payment_status !== "paid") {
        throw new Error("Payment not paid in session");
      }
      actualPaymentIntentId = session.payment_intent as string;
    }

    const paymentIntent = await this.stripeService.retrievePaymentIntent(actualPaymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      console.error(
        `[BookingService] Payment Intent status expected 'succeeded' but got '${paymentIntent.status}'`,
      );
      throw new Error(`Payment verification failed. Status: ${paymentIntent.status}`);
    }

    const amountPaid = paymentIntent.amount / 100;

    if (booking.status === BookingStatus.WAITING_FOR_DEPOSIT) {
      // --- Deposit Handling ---
      booking.status = BookingStatus.ACCEPTED;
      booking.paymentStatus = PaymentStatus.DEPOSIT_PAID;
      booking.paymentDeadline = undefined;

      booking.transactionId = actualPaymentIntentId;

      await this.paymentService.processDepositPayment(
        id,
        "booking",
        actualPaymentIntentId,
        amountPaid,
      );

      if (booking.photographerId) {
        const photographerEmail = (booking.photographerId as any).email;
        const photographerName = (booking.photographerId as any).name;

        if (photographerEmail) {
          try {
            await this.emailService.sendBookingConfirmation(
              photographerEmail,
              photographerName || "Photographer",
              {
                packageName: booking.packageDetails.name,
                date: new Date(booking.eventDate).toDateString(),
                clientName: (booking.userId as any).name || "Client",
                amount: booking.depositeRequired,
              },
            );
          } catch (emailError) {
            console.error("Failed to send booking confirmation email to photographer:", emailError);
          }
        }
      }
    } else if (booking.status === BookingStatus.WORK_ENDED) {
      // --- Balance Handling ---
      booking.paymentStatus = PaymentStatus.FULL_PAID;
      booking.balanceTransactionId = actualPaymentIntentId;

      // Delegate Financials to PaymentService (Balance)
      await this.paymentService.processBalancePayment(
        id,
        "booking",
        actualPaymentIntentId,
        amountPaid,
      );

      // If already COMPLETED (e.g. manual trigger earlier), trigger fund release now
      if (booking.status === (BookingStatus.COMPLETED as string)) {
        await this.paymentService.releaseFunds(id, "booking");
      }
    }

    await booking.save();
    return booking;
  }

  async completeBooking(id: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status === BookingStatus.COMPLETED) {
      throw new Error("Booking is already completed");
    }

    // Release Pending Funds to Photographer
    if (booking.photographerId) {
      const photographerUserId = (booking.photographerId as any)._id
        ? (booking.photographerId as any)._id.toString()
        : booking.photographerId.toString();

      await this.paymentService.releaseFunds(id, "booking", photographerUserId);
    }

    booking.status = BookingStatus.COMPLETED;
    return await booking.save();
  }

  async cancelBooking(id: string, userId: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new Error("Cannot cancel completed or already cancelled booking");
    }

    if (userId === "system-auto-expiry") {
      const refundAmount = booking.depositeRequired || 0;
      if (
        booking.paymentStatus === PaymentStatus.DEPOSIT_PAID ||
        booking.paymentStatus === PaymentStatus.FULL_PAID
      ) {
        await this.walletService.creditWallet(
          booking.userId.toString(),
          refundAmount,
          "Booking Expired Refund",
          booking._id as string,
        );
        booking.paymentStatus = PaymentStatus.REFUNDED;
      }
      booking.status = BookingStatus.CANCELLED;
      return await booking.save();
    }

    let isUser = false;
    let isPhotographer = false;

    if (booking.userId) {
      isUser = (booking.userId as any)._id
        ? (booking.userId as any)._id.toString() === userId.toString()
        : booking.userId.toString() === userId.toString();
    }

    if (booking.photographerId) {
      isPhotographer = (booking.photographerId as any)._id
        ? (booking.photographerId as any)._id.toString() === userId.toString()
        : booking.photographerId.toString() === userId.toString();
    }

    if (!isUser && !isPhotographer) {
      throw new Error("Unauthorized to cancel this booking");
    }

    const now = new Date();
    const eventDate = new Date(booking.eventDate);
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (
      booking.paymentStatus === PaymentStatus.DEPOSIT_PAID ||
      booking.paymentStatus === PaymentStatus.FULL_PAID
    ) {
      const depositAmount = booking.depositeRequired;

      if (hoursDiff > this.CANCELLATION_THRESHOLD_HOURS) {
        await this.walletService.creditWallet(
          booking.userId.toString(),
          depositAmount,
          "Booking Cancellation Check Refund",
          booking._id as string,
        );
        booking.paymentStatus = PaymentStatus.REFUNDED;
      } else {
        // Late Cancellation (< 48h)
        // User Policy: 90% Refund, 10% Penalty (3% Admin, 7% Photographer)

        // "from the deopite the 10 percetage of deposite amoutne wil go to the admin paltform wllaater and give the resr to the user return and 3 percetage keep in the admin walllet and giv ethe 7 percetage to the phtogrpaher wallet"

        // Note: The prompt says "10 percentage of deposit amount will go to admin platform wallet... and give the rest to the user return".
        // BUT then says "3 percentage keep in admin wallet and give 7 percentage to photographer".
        // This implies the 10% penalty is split 3% to Admin, 7% to Photographer.
        // And the Rent (User) gets 90%.

        const penaltyAmount = depositAmount * 0.1; // 10%
        const refundAmount = depositAmount - penaltyAmount; // 90%

        // Split Penalty
        const adminShare = depositAmount * 0.03; // 3%
        const photographerShare = depositAmount * 0.07; // 7%

        // 1. Refund User (90%)
        await this.walletService.creditWallet(
          booking.userId.toString(),
          refundAmount,
          "Booking Cancellation Refund (90% of Deposit)",
          booking._id as string,
        );

        // 2. Credit Admin (3%)
        await this.walletService.creditWallet(
          "admin",
          adminShare,
          "Booking Cancellation Fee (3% of Deposit)",
          booking._id as string,
        );

        // 3. Credit Photographer (7%)
        await this.walletService.creditWallet(
          booking.photographerId.toString(),
          photographerShare,
          "Booking Cancellation Payout (7% of Deposit)",
          booking._id as string,
        );

        console.log(
          `Cancellation Processed: User +${refundAmount}, Admin +${adminShare}, Photog +${photographerShare}`,
        );

        booking.paymentStatus = PaymentStatus.PARTIAL_REFUNDED;
      }
    }

    booking.status = BookingStatus.CANCELLED;
    return await booking.save();
  }
  async startWork(id: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (
      booking.status !== BookingStatus.ACCEPTED &&
      booking.status !== BookingStatus.WAITING_FOR_DEPOSIT
    ) {
      // Allowing start if accepted (deposit paid)
      if (
        booking.paymentStatus !== PaymentStatus.DEPOSIT_PAID &&
        booking.paymentStatus !== PaymentStatus.FULL_PAID
      ) {
        throw new Error("Cannot start work before deposit is paid.");
      }
    }

    booking.status = BookingStatus.WORK_STARTED;
    booking.workStartedAt = new Date();
    return await booking.save();
  }

  async endWork(id: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== BookingStatus.WORK_STARTED) {
      throw new Error("Work has not started yet.");
    }

    booking.status = BookingStatus.WORK_ENDED_PENDING;
    // We might want to store who initiated this to know who needs to confirm,
    // but for now, we assume the UI handles the view logic or we check generic "pending".
    // Ideally, we add a field `workEndedBy: 'user' | 'photographer'`.
    // For MVP, if we don't have that field, we rely on the status.

    return await booking.save();
  }

  async confirmEndWork(id: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== BookingStatus.WORK_ENDED_PENDING) {
      throw new Error("No pending work end request.");
    }

    booking.status = BookingStatus.WORK_ENDED;
    booking.workEndedAt = new Date();
    return await booking.save();
  }

  async deliverWork(id: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== BookingStatus.WORK_ENDED) {
      // Ideally work should be ended first.
      // And payment should be full ideally?
      // Prompt says: "user need to pay the pending amount... and photographer send the work"
      // So we check payment status?
    }

    // Check if full payment is made?
    // "user need to pay the pending amuont... and the phtogrpaher need to setn the work"
    // implies payment first.
    if (booking.paymentStatus !== PaymentStatus.FULL_PAID) {
      throw new Error("Cannot deliver work before full payment.");
    }

    booking.status = BookingStatus.WORK_DELIVERED;
    return await booking.save();
  }

  async confirmWorkDelivery(id: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== BookingStatus.WORK_DELIVERED) {
      throw new Error("Work has not been delivered yet");
    }

    if (booking.paymentStatus !== PaymentStatus.FULL_PAID) {
      throw new Error("Full payment required before completing booking");
    }

    // Release funds to photographer (87%) and admin (13%)
    await this.paymentService.releaseFunds(id, "booking", booking.photographerId.toString());

    booking.status = BookingStatus.COMPLETED;
    return await booking.save();
  }
}
