import { RentalOrderModel, IRentalOrder } from "../../../models/rentalOrder.model.ts";
import { BaseRepository } from "../../base/BaseRepository.ts";
import { IRentalOrderRepository } from "../../../interfaces/repositories/rental/IRentalOrderRepository.ts";
import { IRecentActivity } from "../../../interfaces/services/rental/IRentalOrderService.ts";
import mongoose from "mongoose";

export class RentalOrderRepository
  extends BaseRepository<IRentalOrder>
  implements IRentalOrderRepository
{
  constructor() {
    super(RentalOrderModel);
  }

  async createOrder(data: Partial<IRentalOrder>): Promise<IRentalOrder> {
    return await this.create(data);
  }

  async getOrderById(id: string): Promise<IRentalOrder | null> {
    return await RentalOrderModel.findById(id).populate("items").populate("renterId", "name email");
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { renterId: userId };

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        filter._id = search;
      }
    }

    const [items, total] = await Promise.all([
      RentalOrderModel.find(filter)
        .populate({
          path: "items",
          populate: { path: "ownerId", select: "name email phone profileImage" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RentalOrderModel.countDocuments(filter),
    ]);
    return { items, total };
  }

  async updateOrder(id: string, data: Partial<IRentalOrder>): Promise<IRentalOrder | null> {
    return await this.update(id, data);
  }

  async getOwnerOrders(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const pipeline: mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: "rentalitems",
          localField: "items",
          foreignField: "_id",
          as: "populatedItems",
        },
      },
      { $unwind: "$populatedItems" },
      {
        $match: {
          $or: [
            { "populatedItems.ownerId": new mongoose.Types.ObjectId(ownerId) },
            { "populatedItems.ownerId": ownerId },
          ],
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "populatedItems.name": { $regex: search, $options: "i" } },
            { "populatedItems.category": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    if (status && status !== "ALL") {
      pipeline.push({ $match: { status: status.toUpperCase() } });
    }

    pipeline.push({
      $group: {
        _id: "$_id",
        createdAt: { $first: "$createdAt" },
      },
    });

    const [ordersResult, totalResult] = await Promise.all([
      RentalOrderModel.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      RentalOrderModel.aggregate([...pipeline, { $count: "total" }]),
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(total / limit) || 1;

    if (ordersResult.length === 0) return { items: [], total: 0, totalPages: 0 };

    const orderIds = ordersResult.map((o) => o._id);
    const populatedOrders = await RentalOrderModel.find({ _id: { $in: orderIds } })
      .populate("items")
      .populate("renterId", "name email profileImage")
      .sort({ createdAt: -1 });

    return { items: populatedOrders, total, totalPages };
  }

  async getItemOrders(itemId: string): Promise<IRentalOrder[]> {
    return await RentalOrderModel.find({ items: itemId });
  }

  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ orders: IRentalOrder[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search && mongoose.Types.ObjectId.isValid(search)) {
      filter._id = search;
    }

    const [orders, total] = await Promise.all([
      RentalOrderModel.find(filter)
        .populate("items")
        .populate("renterId", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RentalOrderModel.countDocuments(filter),
    ]);
    return { orders, total };
  }

  async findEscrowHoldings(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ orders: IRentalOrder[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {
      paymentStatus: { $in: ["DEPOSIT_PAID", "FULL_PAID"] },
      status: { $nin: ["COMPLETED", "CANCELLED", "REJECTED"] },
    };

    if (search && mongoose.Types.ObjectId.isValid(search)) {
      filter._id = search;
    }

    const [orders, totalCount] = await Promise.all([
      RentalOrderModel.find(filter)
        .populate("items")
        .populate("renterId", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RentalOrderModel.countDocuments(filter),
    ]);
    return { orders, total: totalCount };
  }

  async getAdminStats(): Promise<{
    revenue: number;
    volume: number;
    escrow: number;
    payouts: number;
  }> {
    const stats = await RentalOrderModel.aggregate([
      {
        $facet: {
          volume: [
            { $match: { paymentStatus: { $in: ["DEPOSIT_PAID", "FULL_PAID"] } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          revenue: [
            { $match: { status: "COMPLETED" } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$totalAmount", 0.08] } } } },
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
            { $group: { _id: null, total: { $sum: { $multiply: ["$totalAmount", 0.92] } } } },
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

  async getOwnerStats(ownerId: string): Promise<{
    totalEarnings: number;
    activeRentals: number;
    totalOrders: number;
    monthlyEarnings: Array<{ month: string; amount: number }>;
    recentActivity: Array<IRecentActivity>;
  }> {
    const refinedStats = await RentalOrderModel.aggregate([
      {
        $lookup: {
          from: "rentalitems",
          localField: "items",
          foreignField: "_id",
          as: "rentalItems",
        },
      },
      { $unwind: "$rentalItems" },
      { $match: { "rentalItems.ownerId": new mongoose.Types.ObjectId(ownerId) } },
      {
        $facet: {
          totalEarnings: [
            { $match: { status: "COMPLETED", paymentStatus: "FULL_PAID" } },
            {
              $addFields: {
                days: {
                  $ceil: {
                    $divide: [{ $subtract: ["$endDate", "$startDate"] }, 1000 * 60 * 60 * 24],
                  },
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$rentalItems.pricePerDay", "$days", 0.92] } },
              },
            },
          ],

          totalOrders: [{ $group: { _id: "$_id" } }, { $count: "count" }],

          activeRentals: [
            {
              $match: { status: { $in: ["ONGOING", "SHIPPED", "WAITING_FOR_DEPOSIT", "PENDING"] } },
            },
            { $group: { _id: "$_id" } },
            { $count: "count" },
          ],

          recentActivity: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "renterId",
                foreignField: "_id",
                as: "renter",
                pipeline: [{ $project: { name: 1, email: 1, profileImage: 1 } }],
              },
            },
            { $unwind: "$renter" },
            {
              $project: {
                _id: 1,
                status: 1,
                startDate: 1,
                endDate: 1,
                totalAmount: 1,
                renter: 1,
                itemName: "$rentalItems.name",
                itemImage: { $arrayElemAt: ["$rentalItems.images", 0] },
              },
            },
          ],

          monthlyEarnings: [
            { $match: { status: "COMPLETED", paymentStatus: "FULL_PAID" } },
            {
              $addFields: {
                days: {
                  $ceil: {
                    $divide: [{ $subtract: ["$endDate", "$startDate"] }, 1000 * 60 * 60 * 24],
                  },
                },
              },
            },
            {
              $group: {
                _id: {
                  month: { $month: "$endDate" },
                  year: { $year: "$endDate" },
                },
                amount: { $sum: { $multiply: ["$rentalItems.pricePerDay", "$days", 0.92] } },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ]);

    const data = refinedStats[0];

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const formattedEarnings = (data.monthlyEarnings || []).map(
      (m: { _id: { month: number }; amount: number }) => ({
        month: `${months[m._id.month - 1]}`,
        amount: m.amount,
      }),
    );

    return {
      totalEarnings: data.totalEarnings[0]?.total || 0,
      activeRentals: data.activeRentals[0]?.count || 0,
      totalOrders: data.totalOrders[0]?.count || 0,
      monthlyEarnings: formattedEarnings,
      recentActivity: data.recentActivity || [],
    };
  }

  async getRenterStats(renterId: string): Promise<{
    totalSpent: number;
    activeRents: number;
    totalOrders: number;
    recentActivity: Array<IRecentActivity>;
  }> {
    const objectId = new mongoose.Types.ObjectId(renterId);
    const stats = await RentalOrderModel.aggregate([
      { $match: { renterId: objectId } },
      {
        $facet: {
          totalSpent: [
            { $match: { status: "COMPLETED", paymentStatus: "FULL_PAID" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          activeRents: [
            {
              $match: { status: { $in: ["ONGOING", "SHIPPED", "WAITING_FOR_DEPOSIT", "PENDING"] } },
            },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
          totalOrders: [{ $group: { _id: null, count: { $sum: 1 } } }],
          recentActivity: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "rentalitems",
                localField: "items",
                foreignField: "_id",
                as: "rentalItems",
              },
            },
            {
              $project: {
                _id: 1,
                status: 1,
                startDate: 1,
                endDate: 1,
                totalAmount: 1,
                itemName: { $arrayElemAt: ["$rentalItems.name", 0] },
                itemImage: { $arrayElemAt: [{ $arrayElemAt: ["$rentalItems.images", 0] }, 0] },
              },
            },
          ],
        },
      },
    ]);

    const data = stats[0];
    return {
      totalSpent: data.totalSpent[0]?.total || 0,
      activeRents: data.activeRents[0]?.count || 0,
      totalOrders: data.totalOrders[0]?.count || 0,
      recentActivity: data.recentActivity || [],
    };
  }
}
