import { BookingModel, BookingStatus } from '../../model/bookingModel.ts';
import { container } from '../../di/container.ts';

export class CronService {
    public static init() {
        const RUN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

        const runJob = async () => {
            console.log('Running Cron: Checking for expired bookings...');
            try {
                const now = new Date();

                const expiredBookings = await BookingModel.find({
                    status: BookingStatus.WAITING_FOR_DEPOSIT,
                    paymentDeadline: { $lt: now }
                });

                if (expiredBookings.length === 0) {
                    console.log('No expired bookings found.');
                    return;
                }

                console.log(`Found ${expiredBookings.length} expired bookings. Processing cancellations...`);

                const bookingService = container.bookingService;

                for (const booking of expiredBookings) {
                    const bookingId = (booking as any)._id;
                    try {
                        console.log(`Cancelling expired booking: ${bookingId}`);
                        await bookingService.cancelBooking(bookingId.toString(), 'system-auto-expiry');
                    } catch (err: any) {
                        console.error(`Failed to auto-cancel booking ${bookingId}: ${err.message}`);
                    }
                }
            } catch (error) {
                console.error('Error running expired booking cron job:', error);
            }
        };

        // Run immediately on startup (optional but good for dev)
        // runJob(); 

        setInterval(runJob, RUN_INTERVAL_MS);

        console.log('CronService initialized: Payment expiry check scheduled every 5 minutes.');
    }
}
