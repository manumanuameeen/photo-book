import { IBookingRepository } from "../../interfaces/repositories/IBookingRepository.ts";
import { IBookingService } from "../../interfaces/services/IBookingService.ts";
import { IEmailService } from "../../interfaces/services/IEmailService.ts";
import { IMessageService } from "../../interfaces/services/IMessageService.ts";
import { IAvailabilityService } from "../../interfaces/services/IPackageAvailabilityService.ts";
import { IBookingPaymentService } from "../../interfaces/services/booking/IBookingPaymentService.ts";
import { BookingStatus, IBooking, PaymentStatus } from "../../model/bookingModel.ts";
import { BookingQueueService } from "../common/BookingQueueService.ts";
import mongoose from "mongoose";
import { CreateBookingDTO, BookingRescheduleRequestDTO, BookingRescheduleResponseDTO } from "../../dto/booking.dto.ts";
import { SetAvailabilityDto } from "../../dto/package-availability.dto.ts";

export class BookingService implements IBookingService {
  private readonly bookingRepository: IBookingRepository;
  private readonly bookingQueueService: BookingQueueService;
  private readonly emailService: IEmailService;
  private readonly messageService: IMessageService;
  private readonly availabilityService: IAvailabilityService;
  private readonly bookingPaymentService: IBookingPaymentService;

  private readonly ADMIN_COMMISSION_PERCENT = 0.13;
  private readonly CANCELLATION_THRESHOLD_HOURS = 48;

  constructor(
    bookingRepository: IBookingRepository,
    bookingQueueService: BookingQueueService,
    emailService: IEmailService,
    messageService: IMessageService,
    availabilityService: IAvailabilityService,
    bookingPaymentService: IBookingPaymentService,
  ) {
    this.bookingRepository = bookingRepository;
    this.bookingQueueService = bookingQueueService;
    this.emailService = emailService;
    this.messageService = messageService;
    this.availabilityService = availabilityService;
    this.bookingPaymentService = bookingPaymentService;
  }

  async createBookingRequest(userId: string, data: CreateBookingDTO): Promise<IBooking> {
    const price = Number(data.packagePrice);
    if (Number.isNaN(price)) {
      throw new Error("Invalid package price");
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

    const savedBooking = await this.bookingRepository.create(bookingData);

    
    try {
      await this.messageService.sendMessage(
        userId,
        data.photographerId,
        `I've sent a booking request for your package "${data.packageName}" on ${new Date(data.date).toDateString()}.`
      );
    } catch (error) {
      console.error("[BookingService] Failed to send initial booking message:", error);
    }

    return savedBooking;
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
      const userId = (booking.userId as any)._id
        ? (booking.userId as any)._id.toString()
        : booking.userId.toString();

      await this.messageService.sendMessage(
        photographerId,
        userId,
        `I've accepted your booking request for ${new Date(booking.eventDate).toDateString()}. Please complete the payment to confirm.`
      );
    } catch (error) {
      console.error("[BookingService] Failed to send acceptance message:", error);
    }

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
    const savedBooking = await booking.save();

    
    try {
      const photographerId = (booking.photographerId as any)._id
        ? (booking.photographerId as any)._id.toString()
        : booking.photographerId.toString();
      const userId = (booking.userId as any)._id
        ? (booking.userId as any)._id.toString()
        : booking.userId.toString();

      await this.messageService.sendMessage(
        photographerId,
        userId,
        `I'm sorry, I cannot accept your booking request for ${new Date(booking.eventDate).toDateString()}. ${message || ""}`
      );
    } catch (error) {
      console.error("[BookingService] Failed to send rejection message:", error);
    }

    try {
      const photographerId = (booking.photographerId as any)._id
        ? (booking.photographerId as any)._id.toString()
        : booking.photographerId.toString();

      
      
      await this.availabilityService.deleteAvailability(photographerId, booking.eventDate);
    } catch (error) {
      
      
      console.warn(`[BookingService] Failed to clear availability for rejected booking ${id}:`, error);
    }

    return savedBooking;
  }

  async createBookingPaymentIntent(bookingId: string): Promise<{ url: string } | null> {
    return await this.bookingPaymentService.createPaymentIntent(bookingId);
  }

  async confirmPayment(id: string, paymentIntentId: string): Promise<IBooking | null> {
    return await this.bookingPaymentService.confirmPayment(id, paymentIntentId);
  }

  async completeBooking(id: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status === BookingStatus.COMPLETED) {
      throw new Error("Booking is already completed");
    }


    if (booking.photographerId) {
      const photographerUserId = (booking.photographerId as any)._id
        ? (booking.photographerId as any)._id.toString()
        : booking.photographerId.toString();

      await this.bookingPaymentService.releaseFunds(id, photographerUserId);
    }

    booking.status = BookingStatus.COMPLETED;
    return await booking.save();
  }

  async cancelBooking(
    id: string,
    userId: string,
    reason?: string,
    isEmergency?: boolean,
  ): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new Error("Cannot cancel completed or already cancelled booking");
    }

    if (userId !== "system-auto-expiry") {
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
    }

    await this.bookingPaymentService.processCancellation(
      booking,
      userId,
    );
    booking.status = BookingStatus.CANCELLED;
    const savedBooking = await booking.save();

    
    try {
      const cancellingUserId = userId.toString();
      const isPhotographer = (booking.photographerId as any)._id
        ? (booking.photographerId as any)._id.toString() === cancellingUserId
        : booking.photographerId.toString() === cancellingUserId;

      const recipientId = isPhotographer
        ? ((booking.userId as any)._id ? (booking.userId as any)._id.toString() : booking.userId.toString())
        : ((booking.photographerId as any)._id ? (booking.photographerId as any)._id.toString() : booking.photographerId.toString());

      await this.messageService.sendMessage(
        cancellingUserId,
        recipientId,
        `The booking for ${new Date(booking.eventDate).toDateString()} has been cancelled. Reason: ${reason || "Not specified"}`
      );
    } catch (error) {
      console.error("[BookingService] Failed to send cancellation message:", error);
    }

    try {
      const photographerId = (booking.photographerId as any)._id
        ? (booking.photographerId as any)._id.toString()
        : booking.photographerId.toString();

      await this.availabilityService.deleteAvailability(photographerId, booking.eventDate);
    } catch (error) {
      console.warn(`[BookingService] Failed to clear availability for cancelled booking ${id}:`, error);
    }

    return savedBooking;
  }
  async startWork(id: string): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(id);
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
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== BookingStatus.WORK_STARTED) {
      throw new Error("Work has not started yet.");
    }

    booking.status = BookingStatus.WORK_ENDED_PENDING;





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

  async deliverWork(id: string, deliveryLink: string): Promise<IBooking | null> {
    console.log(`[BookingService] deliverWork called for ${id}`);
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      console.error(`[BookingService] Booking not found: ${id}`);
      throw new Error("Booking not found");
    }

    console.log(`[BookingService] Booking found: ${booking._id}, Status: ${booking.status}, PayStatus: ${booking.paymentStatus}`);

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
    console.log(`[BookingService] deliverWork saved successfully`);
    return saved;
  }

  async confirmWorkDelivery(id: string): Promise<IBooking | null> {
    console.log(`[BookingService] confirmWorkDelivery called for ${id}`);
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      console.error(`[BookingService] Booking not found: ${id}`);
      throw new Error("Booking not found");
    }

    if (booking.status !== BookingStatus.WORK_DELIVERED) {
      console.error(`[BookingService] Invalid status for confirmDelivery: ${booking.status}`);
      throw new Error("Work has not been delivered yet");
    }

    if (booking.paymentStatus !== PaymentStatus.FULL_PAID) {
      console.error(`[BookingService] Invalid payment status for confirmDelivery: ${booking.paymentStatus}`);
      throw new Error("Full payment required before completing booking");
    }

    const photographerId = (booking.photographerId as any)._id
      ? (booking.photographerId as any)._id.toString()
      : booking.photographerId?.toString();

    if (!photographerId) {
      console.error(`[BookingService] Photographer ID missing or invalid for booking ${id}`);
      throw new Error("Photographer information is missing");
    }

    console.log(`[BookingService] Releasing funds for booking ${id} to photographer ${photographerId}`);
    await this.bookingPaymentService.releaseFunds(id, photographerId);

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
    console.log(`[BookingService] Data received:`, { newDate: data.newDate, newStartTime: data.newStartTime, reason: data.reason });

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    console.log(`[BookingService] Booking found. Current eventDate: ${booking.eventDate}`);
    console.log(`[BookingService] Existing reschedule request:`, booking.rescheduleRequest);

    const bookerId = (booking.userId as any)._id
      ? (booking.userId as any)._id.toString()
      : booking.userId.toString();

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

    console.log(`[BookingService] Time check - Event: ${eventDate}, Now: ${now}, Diff hours: ${diffHours}`);

    if (diffHours < 24) {
      console.log(`[BookingService] FAILED: Cannot reschedule within 24 hours`);
      throw new Error("Cannot reschedule within 24 hours of the event.");
    }

    
    const requestedDate = new Date(data.newDate);
    const currentEventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const requestedDateOnly = new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate());

    if (currentEventDateOnly.getTime() === requestedDateOnly.getTime()) {
      console.log(`[BookingService] FAILED: Cannot reschedule to the same date`);
      throw new Error("Cannot reschedule to the same date. Please select a different date.");
    }

    const photographerId = (booking.photographerId as any)._id
      ? (booking.photographerId as any)._id.toString()
      : (booking.photographerId as any).toString();

    console.log(`[BookingService] Checking availability for photographer ${photographerId} on ${data.newDate}`);

    const availability = await this.availabilityService.getAvailability(
      photographerId,
      new Date(data.newDate),
      new Date(data.newDate),
    );

    console.log(`[BookingService] Availability response:`, availability);

    if (availability.length > 0) {
      const dayAvail = availability[0];

      if (!dayAvail.isFullDayAvailable && dayAvail.slots.length === 0) {
        console.log(`[BookingService] FAILED: Selected date is not available`);
        throw new Error("Selected date is not available.");
      }

      console.log(`[BookingService] Date is available`);
    }

    booking.rescheduleRequest = {
      requestedDate: new Date(data.newDate),
      requestedStartTime: data.newStartTime,
      reason: data.reason,
      status: "pending",
      createdAt: isUpdatingExistingRequest ? booking.rescheduleRequest!.createdAt : new Date(),
    };

    console.log(`[BookingService] Saving reschedule request...`);
    await booking.save();
    console.log(`[BookingService] Reschedule request saved successfully`);

    try {
      const photographerEmail = (booking.photographerId as any).email;
      const photographerName = (booking.photographerId as any).name;
      const clientName = (booking.userId as any).name;

      if (photographerEmail) {
        await this.emailService.sendMail(
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
           </div>`
        );
      }
    } catch (error) {
      console.error("Failed to send reschedule request email:", error);
    }

    return booking;
  }

  async respondToReschedule(
    bookingId: string,
    data: BookingRescheduleResponseDTO,
    userId: string,
  ): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const photographerId = (booking.photographerId as any)._id
      ? (booking.photographerId as any)._id.toString()
      : booking.photographerId.toString();

    if (photographerId !== userId.toString()) {
      throw new Error("Unauthorized: Only the photographer can respond to rescheduling");
    }

    if (!booking.rescheduleRequest || booking.rescheduleRequest.status !== "pending") {
      throw new Error("No pending reschedule request");
    }

    const eventDate = new Date(booking.eventDate);
    if (new Date() > eventDate) {
      booking.rescheduleRequest.status = "expired";
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

        await this.availabilityService.setAvailability(photographerId, {
          date: oldDate,
          isFullDayAvailable: true,
          slots: []
        } as SetAvailabilityDto);


        await this.availabilityService.markDateAsBooked(photographerId, newDate);

      } catch (error) {
        console.error("Failed to update availability:", error);
      }
    }

    await booking.save();

    try {

      const userEmail = (booking.userId as any).email;
      const userName = (booking.userId as any).name;
      const photographerName = (booking.photographerId as any).name;
      const status = data.decision === "rejected" ? "Rejected" : "Accepted";

      if (userEmail) {
        await this.emailService.sendMail(
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


      const bookerId = (booking.userId as any)._id
        ? (booking.userId as any)._id.toString()
        : booking.userId.toString();

      await this.messageService.sendSystemMessage(
        bookerId,
        `Your reschedule request for ${new Date(booking.eventDate).toDateString()} has been ${data.decision.toUpperCase()}.`,
        photographerId,
      );
    } catch (error) {
      console.error("Failed to notify user:", error);
    }

    return booking;
  }
}
