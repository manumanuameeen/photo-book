import { IRentalOrder } from "../../../model/rentalOrderModel.ts";

export interface IRecentActivity {
  _id: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  totalAmount: number;
  itemName?: string;
  itemImage?: string;
  renter?: { name: string; email: string; profileImage?: string };
}

export interface IRentalDashboardStats {
  hosting: {
    totalEarnings: number;
    activeRentals: number;
    totalListings: number;
    totalOrders: number;
    monthlyEarnings: { month: string; amount: number }[];
    recentActivity: IRecentActivity[];
    totalReviews?: number;
    averageRating?: number;
  };
  renting: {
    totalSpent: number;
    activeRents: number;
    totalOrders: number;
    recentActivity: IRecentActivity[];
    photographerSpending?: number;
  };
}

export interface IRentalOrderService {
  rentItem(
    renterId: string,
    itemIds: string[],
    startDate: Date,
    endDate: Date,
    paymentIntentId?: string,
    paymentMethod?: "ONLINE" | "CASH",
  ): Promise<{ order: IRentalOrder; clientSecret?: string }>;

  getUserRentalOrders(
    userId: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }>;

  getOwnerRentalOrders(
    ownerId: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }>;

  acceptRentalOrder(orderId: string, ownerId: string): Promise<IRentalOrder>;
  rejectRentalOrder(orderId: string, ownerId: string): Promise<IRentalOrder>;
  updateOrderStatus(
    orderId: string,
    status: string,
    userId: string,
    role?: string,
  ): Promise<IRentalOrder>;

  getOrderDetails(orderId: string): Promise<IRentalOrder>;
  cancelRentalOrder(orderId: string, userId: string): Promise<IRentalOrder>;

  requestReschedule(
    orderId: string,
    startDate: Date,
    endDate: Date,
    reason: string,
  ): Promise<IRentalOrder>;

  respondToReschedule(orderId: string, decision: "accepted" | "rejected"): Promise<IRentalOrder>;

  getRentalDashboardStats(userId: string): Promise<IRentalDashboardStats>;
}
