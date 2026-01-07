import { BookingModel, IBooking, BookingStatus } from "../../../model/bookingModel";
import { BaseRepository } from "../../base/BaseRepository";
import { IBookingRepository } from "../../interface/IBookingRepository";

export class BookingRepository extends BaseRepository<IBooking> implements IBookingRepository {
    constructor() {
        super(BookingModel);
    }

    async findById(id: string): Promise<IBooking | null> {
        return await this._model.findById(id)
            .populate('userId', 'name email profileImage')
            .populate('photographerId', 'name email profileImage')
            .populate('packageId');
    }

    async updateStatus(id: string, status: string): Promise<IBooking | null> {
        return await this._model.findByIdAndUpdate(id, { status }, { new: true });
    }

    async findByUser(userId: string, page: number = 1, limit: number = 10): Promise<{ bookings: IBooking[], total: number }> {
        const skip = (page - 1) * limit;
        const total = await this._model.countDocuments({ userId });
        const bookings = await this._model.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('photographerId', 'name profileImage')
            .populate('packageId');

        return { bookings, total };
    }

    async findByPhotographer(photographerId: string): Promise<IBooking[]> {
        return await this._model.find({ photographerId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name profileImage')
            .populate('packageId');
    }
}
