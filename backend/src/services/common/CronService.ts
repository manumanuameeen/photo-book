import { BookingModel, BookingStatus } from "../../model/bookingModel.ts";
import { RentalStatus } from "../../model/rentalOrderModel.ts";

import { IBookingService } from "../../interfaces/services/IBookingService.ts";
import { ICronService } from "../../interfaces/services/ICronService.ts";

export class CronService {
  private static _bookingService: IBookingService;

  public static init(bookingService: IBookingService) {
    this._bookingService = bookingService;
    const RUN_INTERVAL_MS = 5 * 60 * 1000;

    const runJob = async () => {
      console.log("Running Cron: Checking for expired bookings...");
      try {
        const now = new Date();

        const expiredBookings = await BookingModel.find({
          status: BookingStatus.WAITING_FOR_DEPOSIT,
          paymentDeadline: { $lt: now },
        });

        if (expiredBookings.length > 0) {
          console.log(`Found ${expiredBookings.length} expired bookings.`);

          for (const booking of expiredBookings) {
            try {
              await CronService._bookingService.cancelBooking(
                booking._id.toString(),
                "system-auto-expiry",
              );
            } catch (e: unknown) {
              const errorMessage = e instanceof Error ? e.message : "Unknown error";
              console.error(`Failed to cancel booking ${booking._id}:`, errorMessage);
            }
          }
        }

        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

        const { RentalOrderModel } = await import("../../model/rentalOrderModel.ts");

        const expiredRentals = await RentalOrderModel.find({
          status: RentalStatus.WAITING_FOR_DEPOSIT,
          updatedAt: { $lt: twoHoursAgo },
        });

        if (expiredRentals.length > 0) {
          console.log(`Found ${expiredRentals.length} expired rental orders.`);
          for (const order of expiredRentals) {
            try {
              order.status = RentalStatus.CANCELLED;
              await order.save();
              console.log(`Cancelled expired rental order: ${order._id}`);
            } catch (e: unknown) {
              const errorMessage = e instanceof Error ? e.message : "Unknown error";
              console.error(`Failed to cancel rental order ${order._id}:`, errorMessage);
            }
          }
        }
      } catch (error) {
        console.error("Error running cron job:", error);
      }
    };

    setInterval(runJob, RUN_INTERVAL_MS);

    console.log("CronService initialized: Payment expiry check scheduled every 5 minutes.");
  }
}
