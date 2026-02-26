import { IRentalItem } from "../../../model/rentalItemModel.ts";
import { IRentalOrder } from "../../../model/rentalOrderModel.ts";

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
