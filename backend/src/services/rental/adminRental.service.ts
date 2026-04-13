import { IAdminRentalService } from "../../interfaces/services/rental/IAdminRentalService";
import { IRentalItem } from "../../models/rentalItem.model";
import { IRentalOrder } from "../../models/rentalOrder.model";
import { IRentalItemRepository } from "../../interfaces/repositories/rental/IRentalItemRepository";
import { IRentalOrderRepository } from "../../interfaces/repositories/rental/IRentalOrderRepository";

export class AdminRentalService implements IAdminRentalService {
  private readonly _itemRepo: IRentalItemRepository;
  private readonly _orderRepo: IRentalOrderRepository;

  constructor(itemRepo: IRentalItemRepository, orderRepo: IRentalOrderRepository) {
    this._itemRepo = itemRepo;
    this._orderRepo = orderRepo;
  }

  async getAdminRentalItems(
    status?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ items: IRentalItem[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (status && status !== "ALL") filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    return await this._itemRepo.getItems(filter, page, limit);
  }

  async getAllRentalOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ orders: IRentalOrder[]; total: number }> {
    return await this._orderRepo.getAllOrders(page, limit, search, status);
  }
}

