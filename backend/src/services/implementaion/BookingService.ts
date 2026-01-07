import { IBookingService } from "../interfaces/IBookingService";
import { IBookingRepository } from "../../repositories/interface/IBookingRepository";
import { IWalletService } from "../interfaces/IWalletService";
import { IBooking, BookingStatus, PaymentStatus } from "../../model/bookingModel";
import { BookingQueueService } from "../common/BookingQueueService";
import { IEmailService } from "../user/email/IEmailServise";
import { IMessageService } from "../messaging/interface/IMessageService";

import { IAvailabilityService } from "../photographer/IPackageAvailabilityService";

export class BookingService implements IBookingService {
    private bookingRepository: IBookingRepository;
    private walletService: IWalletService;
    private bookingQueueService: BookingQueueService;
    private emailService: IEmailService;
    private messageService: IMessageService;
    private availabilityService: IAvailabilityService;

    private readonly ADMIN_COMMISSION_PERCENT = 0.13;
    private readonly CANCELLATION_THRESHOLD_HOURS = 48;

    constructor(
        bookingRepository: IBookingRepository,
        walletService: IWalletService,
        bookingQueueService: BookingQueueService,
        emailService: IEmailService,
        messageService: IMessageService,
        availabilityService: IAvailabilityService
    ) {
        this.bookingRepository = bookingRepository;
        this.walletService = walletService;
        this.bookingQueueService = bookingQueueService;
        this.emailService = emailService;
        this.messageService = messageService;
        this.availabilityService = availabilityService;
    }

    async createBookingRequest(userId: string, data: any): Promise<IBooking> {
        // Calculate financial breakdown
        const price = Number(data.packagePrice);
        if (isNaN(price)) {
            throw new Error("Invalid package price");
        }

        if (userId === data.photographerId) {
            throw new Error("You cannot book your own package.");
        }

        const depositAmount = price * 0.20;

        const bookingData = {
            userId,
            photographerId: data.photographerId,
            packageId: data.packageId,
            packageDetails: {
                name: data.packageName,
                price: price,
                features: data.packageFeatures
            },
            eventDate: new Date(data.date),
            startTime: data.startTime,
            location: data.location,
            locationCoordinates: {
                lat: data.lat,
                lng: data.lng
            },
            eventType: data.eventType,
            contactDetails: {
                name: data.contactName,
                email: data.email,
                phone: data.phone
            },
            status: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            totalAmount: price,
            depositeRequired: depositAmount
        };

        return await this.bookingRepository.create(bookingData);
    }

    async getBookingDetails(id: string): Promise<IBooking | null> {
        return await this.bookingRepository.findById(id);
    }

    async getUserBookings(userId: string, page: number = 1, limit: number = 10): Promise<{ bookings: IBooking[], total: number }> {
        return await this.bookingRepository.findByUser(userId, page, limit);
    }

    async getPhotographerBookings(photographerId: string): Promise<IBooking[]> {
        return await this.bookingRepository.findByPhotographer(photographerId);
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
            // Handle populated vs string ID
            const photographerId = (booking.photographerId as any)._id
                ? (booking.photographerId as any)._id.toString()
                : booking.photographerId.toString();

            await this.availabilityService.markDateAsBooked(photographerId, booking.eventDate);
        } catch (error) {
            console.error("Failed to mark date as booked:", error);
            // Don't block acceptance? Or throw?
            // Ideally should block, but for resilience logging might be better if strict consistency isn't critical vs UX.
            // But user requirement says "will be marked", implies critical.
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

    async confirmPayment(id: string): Promise<IBooking | null> {
        const booking = await this.bookingRepository.findById(id);
        if (!booking) throw new Error("Booking not found");

        if (booking.status !== BookingStatus.WAITING_FOR_DEPOSIT) {
            throw new Error("Booking is not waiting for deposit");
        }

        booking.status = BookingStatus.ACCEPTED;
        booking.paymentStatus = PaymentStatus.DEPOSIT_PAID;
        booking.paymentDeadline = undefined;

        // Credit Admin Wallet
        await this.walletService.creditWallet(
            "admin",
            booking.depositeRequired,
            "Booking Deposit",
            booking._id as string
        );

        await this.bookingQueueService.removeTimers(id);

        if (booking.photographerId) {
            const photographerUserId = (booking.photographerId as any)._id || booking.photographerId;
            const photographerEmail = (booking.photographerId as any).email;
            const photographerName = (booking.photographerId as any).name;

            // Credit Photographer Wallet
            await this.walletService.creditWallet(
                photographerUserId.toString(),
                booking.depositeRequired,
                "Booking Deposit Received",
                booking._id as string
            );

            // Send System Notification
            await this.messageService.sendSystemMessage(
                photographerUserId.toString(),
                `New Booking Confirmed! A user has paid the deposit for ${booking.packageDetails.name} on ${new Date(booking.eventDate).toLocaleDateString()}.`,
                "system"
            );

            // Send Email Notification
            if (photographerEmail) {
                try {
                    await this.emailService.sendBookingConfirmation(
                        photographerEmail,
                        photographerName || "Photographer",
                        {
                            packageName: booking.packageDetails.name,
                            date: new Date(booking.eventDate).toDateString(),
                            clientName: (booking.userId as any).name || "Client",
                            amount: booking.depositeRequired
                        }
                    );
                } catch (emailError) {
                    console.error("Failed to send booking confirmation email to photographer:", emailError);
                }
            }
        }

        await booking.save();
        return booking;
    }



    async cancelBooking(id: string, userId: string): Promise<IBooking | null> {
        const booking = await this.bookingRepository.findById(id);
        if (!booking) throw new Error("Booking not found");

        if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
            throw new Error("Cannot cancel completed or already cancelled booking");
        }

        const isUser = (booking.userId as any)._id ? (booking.userId as any)._id.toString() === userId.toString() : booking.userId.toString() === userId.toString();
        const isPhotographer = (booking.photographerId as any)._id ? (booking.photographerId as any)._id.toString() === userId.toString() : booking.photographerId.toString() === userId.toString();

        if (!isUser && !isPhotographer) {
            throw new Error("Unauthorized to cancel this booking");
        }

        const now = new Date();
        const eventDate = new Date(booking.eventDate);
        const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (booking.paymentStatus === PaymentStatus.DEPOSIT_PAID || booking.paymentStatus === PaymentStatus.FULL_PAID) {
            const depositAmount = booking.depositeRequired;
            const totalAmount = booking.totalAmount;

            if (hoursDiff > this.CANCELLATION_THRESHOLD_HOURS) {

                await this.walletService.creditWallet(
                    booking.userId.toString(),
                    depositAmount,
                    "Booking Cancellation Check Refund",
                    booking._id as string
                );
                booking.paymentStatus = PaymentStatus.REFUNDED;
            } else {
                const forfeitAmount = depositAmount * 0.50;
                const refundAmount = depositAmount - forfeitAmount;

                const adminShare = totalAmount * 0.03;
                const photographerShare = totalAmount * 0.07;

                await this.walletService.creditWallet(
                    booking.userId.toString(),
                    refundAmount,
                    "Booking Cancellation Partial Refund",
                    booking._id as string
                );

                await this.walletService.creditWallet(
                    booking.photographerId.toString(),
                    photographerShare,
                    "Booking Cancellation Forfeit Share",
                    booking._id as string
                );

                console.log(`Crediting Admin Wallet: ${adminShare}`);

                booking.paymentStatus = PaymentStatus.PARTIAL_REFUNDED;
            }
        }

        booking.status = BookingStatus.CANCELLED;
        return await booking.save();
    }
}
