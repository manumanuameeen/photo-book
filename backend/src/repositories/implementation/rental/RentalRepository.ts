import { RentalItemModel, IRentalItem } from "../../../models/rentalItem.model";
import { RentalOrderModel, IRentalOrder } from "../../../models/rentalOrder.model";
import { BaseRepository } from "../../base/BaseRepository";
import mongoose, { FilterQuery } from "mongoose";
import { IRentalRepository } from "../../../interfaces/repositories/IRentalRepository";

export class RentalRepository extends BaseRepository<IRentalItem> implements IRentalRepository {
  constructor() {
    super(RentalItemModel);
  }

  async createItem(data: Partial<IRentalItem>): Promise<IRentalItem> {
    return await this.create(data);
  }

  async getItems(
    filter: FilterQuery<IRentalItem> = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: IRentalItem[]; total: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this._model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this._model.countDocuments(filter),
    ]);
    return { items, total };
  }

  async getItemById(id: string): Promise<IRentalItem | null> {
    return await this._model.findById(id).populate("ownerId", "name email profileImage phone role");
  }

  async updateItem(id: string, data: Partial<IRentalItem>): Promise<IRentalItem | null> {
    return await this.update(id, data);
  }

  async deleteItem(id: string): Promise<boolean> {
    return await this.delete(id);
  }

  async getUserListings(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: IRentalItem[]; total: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this._model.find({ ownerId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this._model.countDocuments({ ownerId: userId }),
    ]);
    return { items, total };
  }

  async updateItemStatus(id: string, status: string): Promise<IRentalItem | null> {
    return await this._model.findByIdAndUpdate(id, { status }, { new: true });
  }
  async createOrder(data: Partial<IRentalOrder>): Promise<IRentalOrder> {
    return await RentalOrderModel.create(data);
  }

  async getOrderById(id: string): Promise<IRentalOrder | null> {
    return await RentalOrderModel.findById(id)
      .populate({
        path: "items",
        populate: { path: "ownerId", select: "name email phone profileImage" },
      })
      .populate("renterId", "name email");
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<IRentalOrder> = { renterId: userId };

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      const items = await this._model
        .find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        })
        .select("_id");

      const itemIds = items.map((i) => i._id);

      const orConditions: FilterQuery<IRentalOrder>[] = [{ items: { $in: itemIds } }];
      if (mongoose.Types.ObjectId.isValid(search)) {
        orConditions.push({ _id: search });
      }
      filter.$or = orConditions;
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
    return await RentalOrderModel.findByIdAndUpdate(id, data, { new: true });
  }

  async getOwnerOrders(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number; totalPages: number }> {
    const itemFilter: FilterQuery<IRentalItem> = { ownerId: new mongoose.Types.ObjectId(ownerId) };

    if (search) {
      itemFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const items = await this._model.find(itemFilter).select("_id");
    const itemIds = items.map((i) => i._id);

    if (itemIds.length === 0) return { items: [], total: 0, totalPages: 0 };

    const skip = (page - 1) * limit;
    const orderFilter: FilterQuery<IRentalOrder> = { items: { $in: itemIds } };

    if (status && status !== "ALL") {
      orderFilter.status = status.toUpperCase();
    }
    const [orders, total] = await Promise.all([
      RentalOrderModel.find(orderFilter)
        .populate("items")
        .populate("renterId", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RentalOrderModel.countDocuments(orderFilter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return { items: orders, total, totalPages };
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
    const filter: FilterQuery<IRentalOrder> = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      const searchConditions: FilterQuery<IRentalOrder>[] = [];

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: search });
      }
      if (searchConditions.length > 0) {
        filter.$or = searchConditions;
      }
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

    const filter: FilterQuery<IRentalOrder> = {
      paymentStatus: { $in: ["DEPOSIT_PAID", "FULL_PAID"] },
      status: { $nin: ["COMPLETED", "CANCELLED", "REJECTED"] },
    };

    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        filter._id = search;
      }
    }

    const [orders, totalCount] = await Promise.all([
      RentalOrderModel.find(filter)
        .populate({
          path: "items",
          populate: { path: "ownerId", select: "name email phone profileImage" },
        })
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
}
