import { IAvailabilityService } from "../../interfaces/services/IPackageAvailabilityService.ts";
import { IAvailabilityRepository } from "../../interfaces/repositories/IAvailabilityRepository.ts";
import { SetAvailabilityDto } from "../../dto/package-availability.dto.ts";
import { IAvailability } from "../../models/availability.model.ts";
import { BookingModel } from "../../models/booking.model.ts";
import { PhotographerModel } from "../../models/photographer.model.ts";
import { AppError } from "../../utils/AppError.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import mongoose from "mongoose";

export class AvailabilityService implements IAvailabilityService {
  private readonly _repository: IAvailabilityRepository;

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

    const photographer = await PhotographerModel.findOne({
      userId: new mongoose.Types.ObjectId(photographerId),
    });
    if (!photographer) {
      throw new AppError("Photographer not found", HttpStatus.NOT_FOUND);
    }

    const booking = await BookingModel.findOne({
      photographerId: new mongoose.Types.ObjectId(photographer.userId.toString()),
      eventDate: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $in: ["CONFIRMED", "PENDING"] },
    });

    if (booking) {
      throw new AppError(
        "Cannot change availability for a date with an existing booking",
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this._repository.findByPhotographerAndDate(photographerId, date);

    if (existing) {
      return (await this._repository.update(existing.id, {
        slots: data.slots as IAvailability["slots"],
        isFullDayAvailable: data.isFullDayAvailable,
      }))!;
    } else {
      return await this._repository.create({
        photographer: new mongoose.Types.ObjectId(photographerId),
        date: date,
        slots: data.slots as IAvailability["slots"],
        isFullDayAvailable: data.isFullDayAvailable,
      });
    }
  }

  async getAvailability(
    photographerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<IAvailability[]> {
    const availability = await this._repository.findByPhotographerAndDateRange(
      photographerId,
      startDate,
      endDate,
    );

    const bookings = await BookingModel.find({
      photographerId: new mongoose.Types.ObjectId(photographerId),
      eventDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: { $in: ["CONFIRMED", "PENDING", "ACCEPTED", "WAITING_FOR_DEPOSIT", "PAID"] },
    });

    const availabilityMap = new Map<string, IAvailability>();

    availability.forEach((a) => {
      availabilityMap.set(new Date(a.date).toISOString().split("T")[0], a);
    });

    bookings.forEach((booking) => {
      const dateKey = new Date(booking.eventDate).toISOString().split("T")[0];

      if (availabilityMap.has(dateKey)) {
        const existing = availabilityMap.get(dateKey)!;
        existing.isFullDayAvailable = false;
        existing.slots = [];
      } else {
        const bookedEntry = {
          photographer: new mongoose.Types.ObjectId(photographerId),
          date: booking.eventDate,
          isFullDayAvailable: false,
          slots: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IAvailability;
        availabilityMap.set(dateKey, bookedEntry);
      }
    });

    return Array.from(availabilityMap.values());
  }

  async checkAvailability(
    photographerId: string,
    date: Date,
    timeSlot: { start: string; end: string },
  ): Promise<boolean> {
    date.setHours(0, 0, 0, 0);
    const avail = await this._repository.findByPhotographerAndDate(photographerId, date);

    if (!avail) return false;

    if (avail.isFullDayAvailable && avail.slots.length === 0) return true;

    const slot = avail.slots.find(
      (s) => s.startTime === timeSlot.start && s.endTime === timeSlot.end,
    );
    if (slot?.status === "AVAILABLE") return true;

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

    const photographer = await PhotographerModel.findOne({
      userId: new mongoose.Types.ObjectId(photographerId),
    });
    if (!photographer) {
      throw new AppError("Photographer not found", HttpStatus.NOT_FOUND);
    }

    const booking = await BookingModel.findOne({
      userId: photographer.userId,
      eventDate: { $gte: start, $lte: end },
      status: { $in: ["CONFIRMED", "PENDING"] },
    });

    if (booking) {
      throw new AppError(
        "Cannot block range that contains dates with existing bookings",
        HttpStatus.BAD_REQUEST,
      );
    }

    const current = new Date(start);
    while (current <= end) {
      await this.setAvailability(photographerId, {
        date: new Date(current),
        slots: [],
        isFullDayAvailable: false,
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
        slots: [],
      });
    } else {
      await this._repository.create({
        photographer: new mongoose.Types.ObjectId(photographerId),
        date: d,
        isFullDayAvailable: false,
        slots: [],
      });
    }
  }

  async deleteAvailability(photographerId: string, date: Date): Promise<void> {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const existing = await this._repository.findByPhotographerAndDate(photographerId, d);
    if (existing) {
      const booking = await BookingModel.findOne({
        photographerId: new mongoose.Types.ObjectId(photographerId),
        eventDate: {
          $gte: d,
          $lt: new Date(d.getTime() + 24 * 60 * 60 * 1000),
        },
        status: { $in: ["CONFIRMED", "PENDING", "ACCEPTED", "WAITING_FOR_DEPOSIT", "PAID"] },
      });

      if (booking) {
        throw new AppError(
          "Cannot delete availability for a date with an existing booking",
          HttpStatus.BAD_REQUEST,
        );
      }

      await this._repository.delete(existing.id);
    }
  }
  async unblockRange(photographerId: string, startDate: Date, endDate: Date): Promise<void> {
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
      throw new AppError("Start date cannot be after end date", HttpStatus.BAD_REQUEST);
    }

    const booking = await BookingModel.findOne({
      photographerId: new mongoose.Types.ObjectId(photographerId),
      eventDate: { $gte: start, $lte: end },
      status: { $in: ["CONFIRMED", "PENDING", "ACCEPTED", "WAITING_FOR_DEPOSIT", "PAID"] },
    });

    if (booking) {
      throw new AppError(
        "Cannot unblock range that strictly contains dates with existing bookings",
        HttpStatus.BAD_REQUEST,
      );
    }

    const current = new Date(start);
    while (current <= end) {
      const d = new Date(current);
      d.setHours(0, 0, 0, 0);
      const existing = await this._repository.findByPhotographerAndDate(photographerId, d);
      if (existing) {
        await this._repository.delete(existing.id);
      }
      current.setDate(current.getDate() + 1);
    }
  }
}
