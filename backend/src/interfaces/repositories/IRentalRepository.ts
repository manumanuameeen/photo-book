import { IRentalItem } from "../../model/rentalItemModel.ts";
import { IRentalOrder } from "../../model/rentalOrderModel.ts";

import { IBaseRepository } from "./IBaseRepository.ts";

export interface IRentalRepository extends IBaseRepository<IRentalItem> {
  createItem(data: Partial<IRentalItem>): Promise<IRentalItem>;
  getItems(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  getItemById(id: string): Promise<IRentalItem | null>;
  updateItem(id: string, data: Partial<IRentalItem>): Promise<IRentalItem | null>;
  deleteItem(id: string): Promise<boolean>;
  getUserListings(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  updateItemStatus(id: string, status: string): Promise<IRentalItem | null>;

  createOrder(data: Partial<IRentalOrder>): Promise<IRentalOrder>;
  getOrderById(id: string): Promise<IRentalOrder | null>;
  getUserOrders(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }>;
  updateOrder(id: string, data: Partial<IRentalOrder>): Promise<IRentalOrder | null>;
  getOwnerOrders(
    ownerId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }>;
  getItemOrders(itemId: string): Promise<IRentalOrder[]>;
  getAllOrders(
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<{ orders: IRentalOrder[]; total: number }>;
  findEscrowHoldings(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ orders: IRentalOrder[]; total: number }>;
  getAdminStats(): Promise<{ revenue: number; volume: number; escrow: number; payouts: number }>;
  toggleLike(itemId: string, userId: string): Promise<IRentalItem | null>;
}
