// import { Queue, Worker, Job } from 'bullmq';
// import IORedis from 'ioredis';
// import { BookingModel } from '../../model/bookingModel';
// import { IBookingService } from '../interfaces/IBookingService';
// import { container } from '../../di/container';

// const redisConnection = new IORedis({
//     host: process.env.REDIS_HOST || 'localhost',
//     port: parseInt(process.env.REDIS_PORT || '6379'),
//     maxRetriesPerRequest: null
// });

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
