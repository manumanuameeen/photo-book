export class BookingQueueService {
  constructor() {
    console.log("Redis Timer service disabled. Switching to Cron jobs.");
  }

  async addPaymentTimer(bookingId: string) {
    console.log(`[Mock] Added payment timers for booking ${bookingId} (handled by Cron)`);
  }

  async removeTimers(bookingId: string) {
    console.log(`[Mock] Removed timers for booking ${bookingId} (handled by Cron)`);
  }
}
