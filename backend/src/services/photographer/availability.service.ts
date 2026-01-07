import { IAvailabilityService } from "./IPackageAvailabilityService";
import { IAvailabilityRepository } from "../../repositories/interface/IAvailabilityRepository";
import { SetAvailabilityDto } from "../../dto/package-availability.dto";
import { IAvailability, AvailabilityModel } from "../../model/availabilityModel";
import { BookingModel } from "../../model/bookingModel";
import { PhotographerModel } from "../../model/photographerModel";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import mongoose from "mongoose";

export class AvailabilityService implements IAvailabilityService {
    private _repository: IAvailabilityRepository;

    constructor(repository: IAvailabilityRepository) {
        this._repository = repository;
    }

    async setAvailability(photographerId: string, data: SetAvailabilityDto): Promise<IAvailability> {
        const date = new Date(data.date);
        date.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (date < now) {
            throw new AppError("Cannot change availability for past dates", HttpStatus.BAD_REQUEST);
        }

        const photographer = await PhotographerModel.findOne({ userId: new mongoose.Types.ObjectId(photographerId) });
        if (!photographer) {
            throw new AppError("Photographer not found", HttpStatus.NOT_FOUND);
        }

        const booking = await BookingModel.findOne({
            photographerId: new mongoose.Types.ObjectId(photographer.userId.toString()),
            eventDate: {
                $gte: date,
                $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
            },
            status: { $in: ["CONFIRMED", "PENDING"] }
        });

        if (booking) {
            throw new AppError("Cannot change availability for a date with an existing booking", HttpStatus.BAD_REQUEST);
        }

        const existing = await this._repository.findByPhotographerAndDate(photographerId, date);

        if (existing) {
            return (await this._repository.update(existing.id, {
                slots: data.slots as any,
                isFullDayAvailable: data.isFullDayAvailable
            }))!;
        } else {
            return await this._repository.create({
                photographer: new mongoose.Types.ObjectId(photographerId),
                date: date,
                slots: data.slots as any,
                isFullDayAvailable: data.isFullDayAvailable
            });
        }
    }


    async getAvailability(photographerId: string, startDate: Date, endDate: Date): Promise<IAvailability[]> {
        // 1. Get explicit availability from repo
        const availability = await this._repository.findByPhotographerAndDateRange(photographerId, startDate, endDate);

        // 2. Get bookings for this range
        // Note: photographerId here is expected to be the User ID (based on usage in setAvailability)
        const bookings = await BookingModel.find({
            photographerId: new mongoose.Types.ObjectId(photographerId),
            eventDate: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $in: ["CONFIRMED", "PENDING", "ACCEPTED", "WAITING_FOR_DEPOSIT", "PAID"] } // Added ACCEPTED/WAITING_FOR_DEPOSIT
        });

        // 3. Merge bookings into availability
        // We need to return IAvailability objects. 
        // If a date has a booking, we effectively create/overwrite an IAvailability object for it to show it as unavailable/booked.

        const availabilityMap = new Map<string, IAvailability>();

        // Populate map with existing availability settings
        availability.forEach(a => {
            availabilityMap.set(new Date(a.date).toISOString().split('T')[0], a);
        });

        // Overlay bookings
        bookings.forEach(booking => {
            const dateKey = new Date(booking.eventDate).toISOString().split('T')[0];

            // For now, assume a booking takes the full day or blocked slots. 
            // If we have detailed slot logic, we'd adjust specific slots.
            // But based on the simplified requirement, let's mark the day as fully booked or unavailable for now, 
            // or create a dummy availability entry that says "isFullDayAvailable: false" and empty slots.

            // To properly represent "Booked", we might want to return this info. 
            // However, the interface IAvailability might not have a "status" field for the day.
            // Typically: isFullDayAvailable: false, slots: [] means not available.
            // If we want to distinguish "Booked" vs "Not Set", we might need to rely on the frontend interpreting it, 
            // or simply ensure we return an entry for it.

            if (availabilityMap.has(dateKey)) {
                const existing = availabilityMap.get(dateKey)!;
                existing.isFullDayAvailable = false;
                existing.slots = []; // Clear slots if booked
            } else {
                // Create a virtual availability entry for the booked date
                // We cast to any/IAvailability because it's not a real mongoose doc
                const bookedEntry = {
                    photographer: new mongoose.Types.ObjectId(photographerId),
                    date: booking.eventDate,
                    isFullDayAvailable: false,
                    slots: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                } as any;
                availabilityMap.set(dateKey, bookedEntry);
            }
        });

        return Array.from(availabilityMap.values());
    }


    async checkAvailability(photographerId: string, date: Date, timeSlot: { start: string; end: string }): Promise<boolean> {
        date.setHours(0, 0, 0, 0);
        const avail = await this._repository.findByPhotographerAndDate(photographerId, date);

        if (!avail) return false; // Or true if default is available? Usually explicit availability required.

        if (avail.isFullDayAvailable && avail.slots.length === 0) return true; // Assuming empty slots + fullDay = all available

        // Check specific slot overlap
        // This logic can be complex depending on how slots are defined (blocks of availability? or blocks of bookings?)
        // Based on model: slots have status "AVAILABLE" | "BOOKED"

        const slot = avail.slots.find(s => s.startTime === timeSlot.start && s.endTime === timeSlot.end);
        if (slot && slot.status === 'AVAILABLE') return true;

        return false;
    }

    async blockRange(photographerId: string, startDate: Date, endDate: Date): Promise<void> {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (start < now) {
            throw new AppError("Start date cannot be in the past", HttpStatus.BAD_REQUEST);
        }

        if (start > end) {
            throw new AppError("Start date must be before end date", HttpStatus.BAD_REQUEST);
        }

        const photographer = await PhotographerModel.findOne({ userId: new mongoose.Types.ObjectId(photographerId) });
        if (!photographer) {
            throw new AppError("Photographer not found", HttpStatus.NOT_FOUND);
        }

        const booking = await BookingModel.findOne({
            userId: photographer.userId,
            eventDate: { $gte: start, $lte: end },
            status: { $in: ["CONFIRMED", "PENDING"] }
        });

        if (booking) {
            throw new AppError("Cannot block range that contains dates with existing bookings", HttpStatus.BAD_REQUEST);
        }

        const current = new Date(start);
        while (current <= end) {
            await this.setAvailability(photographerId, {
                date: new Date(current),
                slots: [],
                isFullDayAvailable: false
            });
            current.setDate(current.getDate() + 1);
        }
    }
    async markDateAsBooked(photographerId: string, date: Date): Promise<void> {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);

        const existing = await this._repository.findByPhotographerAndDate(photographerId, d);

        if (existing) {
            await this._repository.update(existing.id, {
                isFullDayAvailable: false,
                slots: []
            });
        } else {
            await this._repository.create({
                photographer: new mongoose.Types.ObjectId(photographerId),
                date: d,
                isFullDayAvailable: false,
                slots: []
            });
        }
    }
}
