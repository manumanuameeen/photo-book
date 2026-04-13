import { RentalItemModel, IRentalItem } from "../../models/rentalItem.model";
import { BaseRepository } from "../base/BaseRepository";
import { IRentalItemRepository } from "../../interfaces/repositories/rental/IRentalItemRepository";
import { FilterQuery } from "mongoose";

export class RentalItemRepository
  extends BaseRepository<IRentalItem>
  implements IRentalItemRepository
{
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
}

