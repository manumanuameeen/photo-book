import mongoose from "mongoose";
import { BookingModel, IBooking } from "../../../model/bookingModel.ts";
import { BaseRepository } from "../../base/BaseRepository.ts";
import { IBookingRepository } from "../../../interfaces/repositories/IBookingRepository.ts";

export class BookingRepository extends BaseRepository<IBooking> implements IBookingRepository {
  constructor() {
    super(BookingModel);
  }

  async findById(id: string): Promise<IBooking | null> {
    return await this._model
      .findById(id)
      .populate("userId", "name email profileImage")
      .populate("photographerId", "name email profileImage")
      .populate("packageId");
  }

  async findByBookingId(bookingId: string): Promise<IBooking | null> {
    return await this._model
      .findOne({ bookingId })
      .populate("userId", "name email profileImage")
      .populate("photographerId", "name email profileImage")
      .populate("packageId");
  }

  async updateStatus(id: string, status: string): Promise<IBooking | null> {
    return await this._model.findByIdAndUpdate(id, { status }, { new: true });
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: mongoose.FilterQuery<IBooking> = { userId };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { "packageDetails.name": { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const total = await this._model.countDocuments(query);
    const bookings = await this._model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("photographerId", "name email profileImage phone")
      .populate("packageId");

    return { bookings, total };
  }

  async findByPhotographer(
    photographerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const skip = (page - 1) * limit;

    const query: mongoose.FilterQuery<IBooking> = { photographerId };
    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { "contactDetails.name": { $regex: search, $options: "i" } },
        { "packageDetails.name": { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
      ];
    }

    const total = await this._model.countDocuments(query);
    const bookings = await this._model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email profileImage phone")
      .populate("packageId");

    return { bookings, total };
  }

  async findEscrowHoldings(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const skip = (page - 1) * limit;

    const query: mongoose.FilterQuery<IBooking> = {
      paymentStatus: { $in: ["DEPOSIT_PAID", "FULL_PAID"] },
      status: { $nin: ["COMPLETED", "CANCELLED", "REJECTED"] },
    };

    if (search) {
      query.$or = [
        { "contactDetails.name": { $regex: search, $options: "i" } },
        { "packageDetails.name": { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
      ];
    }

    const total = await this._model.countDocuments(query);
    const bookings = await this._model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email profileImage phone")
      .populate("photographerId", "name email profileImage phone")
      .populate("packageId");

    return { bookings, total };
  }
  async getAdminStats(): Promise<{
    revenue: number;
    volume: number;
    escrow: number;
    payouts: number;
  }> {
    const stats = await this._model.aggregate([
      {
        $facet: {
          volume: [
            { $match: { paymentStatus: { $in: ["DEPOSIT_PAID", "FULL_PAID"] } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          revenue: [
            { $match: { status: "COMPLETED" } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$totalAmount", 0.13] } } } },
          ],
          escrow: [
            {
              $match: {
                paymentStatus: { $in: ["DEPOSIT_PAID", "FULL_PAID"] },
                status: { $nin: ["COMPLETED", "CANCELLED", "REJECTED"] },
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          payouts: [
            { $match: { status: "COMPLETED" } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$totalAmount", 0.87] } } } },
          ],
        },
      },
    ]);

    const result = stats[0];
    return {
      volume: result.volume[0]?.total || 0,
      revenue: result.revenue[0]?.total || 0,
      escrow: result.escrow[0]?.total || 0,
      payouts: result.payouts[0]?.total || 0,
    };
  }
}
