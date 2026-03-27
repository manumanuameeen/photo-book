import { IRentalOrder } from "../../../models/rentalOrder.model";
import { IRecentActivity } from "../../services/rental/IRentalOrderService";

export interface IRentalOrderRepository {
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
  getOwnerStats(ownerId: string): Promise<{
    totalEarnings: number;
    activeRentals: number;
    totalOrders: number;
    monthlyEarnings: Array<{ month: string; amount: number }>;
    recentActivity: Array<IRecentActivity>;
  }>;
  getRenterStats(renterId: string): Promise<{
    totalSpent: number;
    activeRents: number;
    totalOrders: number;
    recentActivity: Array<IRecentActivity>;
  }>;
}
