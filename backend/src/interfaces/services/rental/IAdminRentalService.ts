import { IRentalItem } from "../../../models/rentalItem.model.ts";
import { IRentalOrder } from "../../../models/rentalOrder.model.ts";

export interface IAdminRentalService {
  getAdminRentalItems(
    status?: string,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ items: IRentalItem[]; total: number }>;

  getAllRentalOrders(
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<{ orders: IRentalOrder[]; total: number }>;
}
