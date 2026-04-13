import { IBookingRepository } from "../../interfaces/repositories/IBookingRepository";
import { IBookingService } from "../../interfaces/services/IBookingService";
import { IEmailService } from "../../interfaces/services/IEmailService";
import { IMessageService } from "../../interfaces/services/IMessageService";
import { IAvailabilityService } from "../../interfaces/services/IPackageAvailabilityService";
import { IBookingPaymentService } from "../../interfaces/services/booking/IBookingPaymentService";
import { BookingStatus, IBooking, PaymentStatus } from "../../models/booking.model";
import { BookingQueueService } from "../common/bookingQueue.service";
import mongoose from "mongoose";
import {
  CreateBookingDTO,
  BookingRescheduleRequestDTO,
  BookingRescheduleResponseDTO,
} from "../../dto/booking.dto";
import { SetAvailabilityDto } from "../../dto/packageAvailability.dto";

type MongoReference = string | mongoose.Types.ObjectId | { _id: string | mongoose.Types.ObjectId };

export class BookingService implements IBookingService {
  private readonly _bookingRepository: IBookingRepository;
  private readonly _bookingQueueService: BookingQueueService;
  private readonly _emailService: IEmailService;
  private readonly _messageService: IMessageService;
  private readonly _availabilityService: IAvailabilityService;
  private readonly _bookingPaymentService: IBookingPaymentService;

  private readonly _ADMIN_COMMISSION_PERCENT = 0.13;
  private readonly _CANCELLATION_THRESHOLD_HOURS = 48;

  constructor(
    bookingRepository: IBookingRepository,
    bookingQueueService: BookingQueueService,
    emailService: IEmailService,
    messageService: IMessageService,
    availabilityService: IAvailabilityService,
    bookingPaymentService: IBookingPaymentService,
  ) {
    this._bookingRepository = bookingRepository;
    this._bookingQueueService = bookingQueueService;
    this._emailService = emailService;
    this._messageService = messageService;
    this._availabilityService = availabilityService;
    this._bookingPaymentService = bookingPaymentService;
  }

  async createBookingRequest(userId: string, data: CreateBookingDTO): Promise<IBooking> {
    const price = Number(data.packagePrice);
    if (Number.isNaN(price)) {
      throw new TypeError("Invalid package price");
    }

    const eventDate = new Date(data.date);
    const now = new Date();

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
        lat: data.lat || 0,
        lng: data.lng || 0,
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

    const savedBooking = await this._bookingRepository.create(bookingData);

    try {
      await this._messageService.sendMessage(
        userId,
        data.photographerId,
        `I've sent a booking request for your package "${data.packageName}" on ${new Date(data.date).toDateString()}.`,
      );
    } catch (error: unknown) {
      console.error("[BookingService] Failed to send initial booking message:", error);
    }

    return savedBooking;
  }

  async getBookingDetails(id: string): Promise<IBooking | null> {
    return await this._bookingRepository.findById(id);
  }

  async getBookingByBookingId(bookingId: string): Promise<IBooking | null> {
    return await this._bookingRepository.findByBookingId(bookingId);
  }

  async getUserBookings(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }> {
    return await this._bookingRepository.findByUser(userId, page, limit, search, status);
  }

  async getPhotographerBookings(
    photographerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }> {
    return await this._bookingRepository.findByPhotographer(
      photographerId,
      page,
      limit,
      search,
      status,
    );
  }

  private _getUserId(user: MongoReference | unknown): string {
    if (!user) return "";
    if (typeof user === "string") return user;
    if (user instanceof mongoose.Types.ObjectId) return user.toString();
    if (typeof user === "object" && "_id" in user) {
      return (user as { _id: string | mongoose.Types.ObjectId })._id.toString();
    }
    return "";
  }

  private _isPopulatedUser(
    user: unknown,
  ): user is { email: string; name: string; _id: mongoose.Types.ObjectId | string } {
    return typeof user === "object" && user !== null && "email" in user && "name" in user;
  }

  async acceptBooking(id: string, message?: string): Promise<IBooking | null> {
    const booking = await this._bookingRepository.findById(id);
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
    await this._bookingQueueService.addPaymentTimer(id);

    try {
      const photographerId = this._getUserId(booking.photographerId);
      const userId = this._getUserId(booking.userId);

      await this._messageService.sendMessage(
        photographerId,
        userId,
        `I've accepted your booking request for ${new Date(booking.eventDate).toDateString()}. Please complete the payment to confirm.`,
      );
    } catch (error: unknown) {
      console.error("[BookingService] Failed to send acceptance message:", error);
    }

    try {
      const photographerId = this._getUserId(booking.photographerId);
      await this._availabilityService.markDateAsBooked(photographerId, booking.eventDate);
    } catch (error: unknown) {
      console.error("Failed to mark date as booked:", error);
    }

    return booking;
  }

  async rejectBooking(id: string, message?: string): Promise<IBooking | null> {
    const booking = await this._bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    booking.status = BookingStatus.REJECTED;
    if (message) {
      booking.photographerMessage = message;
    }
    const savedBooking = await booking.save();

    try {
      const photographerId = this._getUserId(booking.photographerId);
      const userId = this._getUserId(booking.userId);

      await this._messageService.sendMessage(
        photographerId,
        userId,
        `I'm sorry, I cannot accept your booking request for ${new Date(booking.eventDate).toDateString()}. ${message || ""}`,
      );
    } catch (error: unknown) {
      console.error("[BookingService] Failed to send rejection message:", error);
    }

    try {
      const photographerId = this._getUserId(booking.photographerId);
      await this._availabilityService.setAvailability(photographerId, {
        date: booking.eventDate,
        isFullDayAvailable: true,
        slots: [],
      } as SetAvailabilityDto);
    } catch (error: unknown) {
      console.warn(
        `[BookingService] Failed to reset availability for rejected booking ${id}:`,
        error,
      );
    }

    return savedBooking;
  }

  async createBookingPaymentIntent(
    bookingId: string,
    frontendUrl?: string,
  ): Promise<{ url: string } | null> {
    return await this._bookingPaymentService.createPaymentIntent(bookingId, frontendUrl);
  }

  async confirmPayment(id: string, paymentIntentId: string): Promise<IBooking | null> {
    return await this._bookingPaymentService.confirmPayment(id, paymentIntentId);
  }

  async completeBooking(id: string): Promise<IBooking | null> {
    const booking = await this._bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status === BookingStatus.COMPLETED) {
      throw new Error("Booking is already completed");
    }

    if (booking.photographerId) {
      const photographerUserId = this._getUserId(booking.photographerId);
      await this._bookingPaymentService.releaseFunds(id, photographerUserId);
    }

    booking.status = BookingStatus.COMPLETED;
    return await booking.save();
  }

  async cancelBooking(
    id: string,
    userId: string,
    reason?: string,
    _isEmergency?: boolean,
  ): Promise<IBooking | null> {
    const booking = await this._bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new Error("Cannot cancel completed or already cancelled booking");
    }

    if (userId !== "system-auto-expiry") {
      let isUser = false;
      let isPhotographer = false;

      if (booking.userId) {
        isUser = this._getUserId(booking.userId) === userId.toString();
      }

      if (booking.photographerId) {
        isPhotographer = this._getUserId(booking.photographerId) === userId.toString();
      }

      if (!isUser && !isPhotographer) {
        throw new Error("Unauthorized to cancel this booking");
      }
    }

    await this._bookingPaymentService.processCancellation(booking, userId);
    booking.status = BookingStatus.CANCELLED;
    const savedBooking = await booking.save();

    try {
      const cancellingUserId = userId.toString();
      const isPhotographer = this._getUserId(booking.photographerId) === cancellingUserId;

      const recipientId = isPhotographer
        ? this._getUserId(booking.userId)
        : this._getUserId(booking.photographerId);

      await this._messageService.sendMessage(
        cancellingUserId,
        recipientId,
        `The booking for ${new Date(booking.eventDate).toDateString()} has been cancelled. Reason: ${reason || "Not specified"}`,
      );
    } catch (error: unknown) {
      console.error("[BookingService] Failed to send cancellation message:", error);
    }

    try {
      const photographerId = this._getUserId(booking.photographerId);
      await this._availabilityService.setAvailability(photographerId, {
        date: booking.eventDate,
        isFullDayAvailable: true,
        slots: [],
      } as SetAvailabilityDto);
    } catch (error: unknown) {
      console.warn(
        `[BookingService] Failed to reset availability for cancelled booking ${id}:`,
        error,
      );
    }

    return savedBooking;
  }
  async startWork(id: string): Promise<IBooking | null> {
    const booking = await this._bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (
      booking.status !== BookingStatus.ACCEPTED &&
      booking.status !== BookingStatus.WAITING_FOR_DEPOSIT
    ) {
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
    const booking = await this._bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== BookingStatus.WORK_STARTED) {
      throw new Error("Work has not started yet.");
    }

    booking.status = BookingStatus.WORK_ENDED_PENDING;

    return await booking.save();
  }

  async confirmEndWork(id: string): Promise<IBooking | null> {
    const booking = await this._bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== BookingStatus.WORK_ENDED_PENDING) {
      throw new Error("No pending work end request.");
    }

    booking.status = BookingStatus.WORK_ENDED;
    booking.workEndedAt = new Date();
    return await booking.save();
  }

  async deliverWork(id: string, deliveryLink: string): Promise<IBooking | null> {
    console.log(`[BookingService] deliverWork called for ${id}`);
    const booking = await this._bookingRepository.findById(id);
    if (!booking) {
      console.error(`[BookingService] Booking not found: ${id}`);
      throw new Error("Booking not found");
    }

    console.log(
      `[BookingService] Booking found: ${booking._id}, Status: ${booking.status}, PayStatus: ${booking.paymentStatus}`,
    );

    if (!booking.photographerId) {
      console.error(`[BookingService] Photographer info missing for ${id}`);
      throw new Error("Photographer information is missing");
    }

    if (booking.status !== BookingStatus.WORK_ENDED) {
      console.error(`[BookingService] Invalid status: ${booking.status}`);
      throw new Error("Work must be ended before delivery");
    }

    if (booking.paymentStatus !== PaymentStatus.FULL_PAID) {
      console.error(`[BookingService] Invalid payment status: ${booking.paymentStatus}`);
      throw new Error("Cannot deliver work before full payment.");
    }

    if (!deliveryLink) {
      throw new Error("Delivery link is required");
    }

    booking.status = BookingStatus.WORK_DELIVERED;
    booking.deliveryWorkLink = deliveryLink;
    const saved = await booking.save();
    console.log("[BookingService] deliverWork saved successfully");
    return saved;
  }

  async confirmWorkDelivery(id: string): Promise<IBooking | null> {
    console.log(`[BookingService] confirmWorkDelivery called for ${id}`);
    const booking = await this._bookingRepository.findById(id);
    if (!booking) {
      console.error(`[BookingService] Booking not found: ${id}`);
      throw new Error("Booking not found");
    }

    if (booking.status !== BookingStatus.WORK_DELIVERED) {
      console.error(`[BookingService] Invalid status for confirmDelivery: ${booking.status}`);
      throw new Error("Work has not been delivered yet");
    }

    if (booking.paymentStatus !== PaymentStatus.FULL_PAID) {
      console.error(
        `[BookingService] Invalid payment status for confirmDelivery: ${booking.paymentStatus}`,
      );
      throw new Error("Full payment required before completing booking");
    }

    const photographerId = booking.photographerId ? this._getUserId(booking.photographerId) : null;

    if (!photographerId) {
      console.error(`[BookingService] Photographer ID missing or invalid for booking ${id}`);
      throw new Error("Photographer information is missing");
    }

    console.log(
      `[BookingService] Releasing funds for booking ${id} to photographer ${photographerId}`,
    );
    await this._bookingPaymentService.releaseFunds(id, photographerId);

    booking.status = BookingStatus.COMPLETED;
    const saved = await booking.save();
    console.log(`[BookingService] confirmWorkDelivery success for ${id}`);
    return saved;
  }

  async requestReschedule(
    bookingId: string,
    data: BookingRescheduleRequestDTO,
    userId: string,
  ): Promise<IBooking | null> {
    console.log(`[BookingService] requestReschedule called for booking ${bookingId}`);
    console.log("[BookingService] Data received:", {
      newDate: data.newDate,
      newStartTime: data.newStartTime,
      reason: data.reason,
    });

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    console.log(`[BookingService] Booking found. Current eventDate: ${booking.eventDate}`);
    console.log("[BookingService] Existing reschedule request:", booking.rescheduleRequest);

    const bookerId = this._getUserId(booking.userId);

    if (bookerId !== userId.toString()) {
      throw new Error("Unauthorized: Only the booker can request rescheduling");
    }

    const isUpdatingExistingRequest = booking.rescheduleRequest?.status === "pending";
    if (isUpdatingExistingRequest) {
      console.log("[BookingService] Updating existing pending reschedule request");
    } else {
      console.log("[BookingService] Creating new reschedule request");
    }

    const eventDate = new Date(booking.eventDate);
    const now = new Date();
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    console.log(
      `[BookingService] Time check - Event: ${eventDate}, Now: ${now}, Diff hours: ${diffHours}`,
    );

    if (diffHours < 24) {
      console.log("[BookingService] FAILED: Cannot reschedule within 24 hours");
      throw new Error("Cannot reschedule within 24 hours of the event.");
    }

    const requestedDate = new Date(data.newDate);
    const currentEventDateOnly = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
    );
    const requestedDateOnly = new Date(
      requestedDate.getFullYear(),
      requestedDate.getMonth(),
      requestedDate.getDate(),
    );

    if (currentEventDateOnly.getTime() === requestedDateOnly.getTime()) {
      console.log("[BookingService] FAILED: Cannot reschedule to the same date");
      throw new Error("Cannot reschedule to the same date. Please select a different date.");
    }

    const photographerId = this._getUserId(booking.photographerId);

    console.log(
      `[BookingService] Checking availability for photographer ${photographerId} on ${data.newDate}`,
    );

    const availability = await this._availabilityService.getAvailability(
      photographerId,
      new Date(data.newDate),
      new Date(data.newDate),
    );

    console.log("[BookingService] Availability response:", availability);

    if (availability.length > 0) {
      const dayAvail = availability[0];

      if (!dayAvail.isFullDayAvailable && dayAvail.slots.length === 0) {
        console.log("[BookingService] FAILED: Selected date is not available");
        throw new Error("Selected date is not available.");
      }

      console.log("[BookingService] Date is available");
    }

    booking.rescheduleRequest = {
      requestedDate: new Date(data.newDate),
      requestedStartTime: data.newStartTime,
      reason: data.reason,
      status: "pending",
      createdAt: isUpdatingExistingRequest ? booking.rescheduleRequest!.createdAt : new Date(),
    };

    console.log("[BookingService] Saving reschedule request...");
    await booking.save();
    console.log("[BookingService] Reschedule request saved successfully");

    try {
      const photographer = booking.photographerId as unknown;
      const user = booking.userId as unknown;

      let photographerEmail = "";
      let photographerName = "";
      let clientName = "";

      if (this._isPopulatedUser(photographer)) {
        photographerEmail = photographer.email;
        photographerName = photographer.name;
      }

      if (this._isPopulatedUser(user)) {
        clientName = user.name;
      }

      if (photographerEmail) {
        await this._emailService.sendMail(
          photographerEmail,
          "New Reschedule Request",
          `Client ${clientName} requested to reschedule.`,
          `<div style="font-family: Arial, sans-serif; color: #333;">
             <h2>Reschedule Request</h2>
             <p>Hello ${photographerName},</p>
             <p>You have received a new reschedule request from <strong>${clientName}</strong>.</p>
             <p><strong>New Date:</strong> ${new Date(data.newDate).toDateString()}</p>
             <p><strong>New Time:</strong> ${data.newStartTime}</p>
             <p><strong>Reason:</strong> ${data.reason}</p>
             <p>Please log in to your dashboard to review and respond.</p>
           </div>`,
        );
      }
    } catch (error: unknown) {
      console.error("Failed to send reschedule request email:", error);
    }

    return booking;
  }

  async respondToReschedule(
    bookingId: string,
    data: BookingRescheduleResponseDTO,
    userId: string,
  ): Promise<IBooking | null> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const photographerId = this._getUserId(booking.photographerId);

    if (photographerId !== userId.toString()) {
      throw new Error("Unauthorized: Only the photographer can respond to rescheduling");
    }

    if (booking.rescheduleRequest?.status !== "pending") {
      throw new Error("No pending reschedule request");
    }

    const eventDate = new Date(booking.eventDate);
    if (new Date() > eventDate) {
      if (booking.rescheduleRequest) {
        booking.rescheduleRequest.status = "expired";
      }
      await booking.save();
      throw new Error("Request expired");
    }

    if (data.decision === "rejected") {
      booking.rescheduleRequest.status = "rejected";
    } else {
      const newDate = booking.rescheduleRequest.requestedDate;
      const newTime = booking.rescheduleRequest.requestedStartTime;
      const oldDate = new Date(booking.eventDate);

      booking.eventDate = newDate;
      booking.startTime = newTime;
      booking.rescheduleRequest.status = "accepted";

      try {
        await this._availabilityService.setAvailability(photographerId, {
          date: oldDate,
          isFullDayAvailable: true,
          slots: [],
        } as SetAvailabilityDto);

        await this._availabilityService.markDateAsBooked(photographerId, newDate);
      } catch (error: unknown) {
        console.error("Failed to update availability:", error);
      }
    }

    await booking.save();

    try {
      const user = booking.userId as unknown;
      const photographer = booking.photographerId as unknown;

      let userEmail = "";
      let userName = "";
      let photographerName = "";

      if (this._isPopulatedUser(user)) {
        userEmail = user.email;
        userName = user.name;
      }

      if (this._isPopulatedUser(photographer)) {
        photographerName = photographer.name;
      }

      const status = data.decision === "rejected" ? "Rejected" : "Accepted";

      if (userEmail) {
        await this._emailService.sendMail(
          userEmail,
          `Reschedule Request ${status}`,
          `Your reschedule request has been ${status.toLowerCase()}.`,
          `<div style="font-family: Arial, sans-serif; color: #333;">
               <h2>Reschedule Request Update</h2>
               <p>Hello ${userName},</p>
               <p>Your reschedule request for booking with <strong>${photographerName}</strong> has been <strong>${status.toUpperCase()}</strong>.</p>
               ${data.decision === "accepted" ? "<p>The booking has been moved to the new date and time.</p>" : "<p>The original booking date and time remain unchanged.</p>"}
             </div>`,
        );
      }

      const bookerId = this._getUserId(booking.userId);

      await this._messageService.sendSystemMessage(
        bookerId,
        `Your reschedule request for ${new Date(booking.eventDate).toDateString()} has been ${data.decision.toUpperCase()}.`,
        photographerId,
      );
    } catch (error: unknown) {
      console.error("Failed to notify user:", error);
    }

    return booking;
  }
}
