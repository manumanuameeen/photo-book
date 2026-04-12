import { IRentalItem } from "../../models/rentalItem.model";
import { IRentalOrder } from "../../models/rentalOrder.model";
import { CreateRentalItemDTO, UpdateRentalItemDTO } from "../../dto/rental.dto";

export interface IRentalService {
  createRentalItem(data: CreateRentalItemDTO): Promise<IRentalItem>;
  getAllRentalItems(
    category?: string,
    page?: number,
    limit?: number,
    userId?: string,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  getAdminRentalItems(
    status?: string,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  getRentalItemDetails(itemId: string): Promise<IRentalItem>;
  updateRentalItem(itemId: string, data: UpdateRentalItemDTO): Promise<IRentalItem>;
  deleteRentalItem(itemId: string): Promise<void>;
  getUserRentalItems(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ items: IRentalItem[]; total: number }>;
  updateRentalItemStatus(
    id: string,
    status: string,
    userId: string,
    role: string,
  ): Promise<IRentalItem | null>;

  rentItem(
    renterId: string,
    itemIds: string[],
    startDate: Date,
    endDate: Date,
    paymentIntentId?: string,
    paymentMethod?: "ONLINE" | "CASH" | "wallet" | "stripe",
    frontendUrl?: string,
  ): Promise<{ order: IRentalOrder; clientSecret?: string }>;
  confirmRentalPayment(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;
  getUserRentalOrders(
    userId: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }>;
  returnItem(orderId: string): Promise<IRentalOrder>;

  getOwnerRentalOrders(
    ownerId: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<{ items: IRentalOrder[]; total: number }>;
  acceptRentalOrder(orderId: string, ownerId: string): Promise<IRentalOrder>;
  rejectRentalOrder(orderId: string, ownerId: string): Promise<IRentalOrder>;
  getAllRentalOrders(
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<{ orders: IRentalOrder[]; total: number }>;
  updateOrderStatus(
    orderId: string,
    status: string,
    userId: string,
    role?: string,
  ): Promise<IRentalOrder>;
  getOrderDetails(orderId: string): Promise<IRentalOrder>;

  createDepositPaymentIntent(
    orderId: string,
    frontendUrl?: string,
  ): Promise<{ url: string; sessionId: string }>;
  payRentalDeposit(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;
  createBalancePaymentIntent(
    orderId: string,
    frontendUrl?: string,
  ): Promise<{ url: string; sessionId: string }>;
  payRentalBalance(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;
  completeRentalOrder(orderId: string): Promise<IRentalOrder>;

  checkItemAvailability(itemId: string, startDate: Date, endDate: Date): Promise<boolean>;
  getUnavailableDates(
    itemId: string,
  ): Promise<{ startDate: Date; endDate: Date; reason?: string; type: "BOOKED" | "BLOCKED" }[]>;
  blockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
    userId?: string,
    role?: string,
  ): Promise<IRentalItem>;
  unblockRentalDates(
    itemId: string,
    startDate: Date,
    endDate: Date,
    userId: string,
    role?: string,
  ): Promise<IRentalItem>;
  getRentalDashboardStats(userId: string): Promise<IRentalDashboardStats>;
  toggleLike(id: string, userId: string): Promise<IRentalItem>;

  requestReschedule(
    orderId: string,
    requestedStartDate: Date,
    requestedEndDate: Date,
    reason: string,
  ): Promise<IRentalOrder>;

  respondToReschedule(
    orderId: string,
    action: "approve" | "reject",
    userId: string,
    role?: string,
  ): Promise<IRentalOrder>;
  cancelRentalOrder(
    orderId: string,
    userId: string,
    reason?: string,
    isEmergency?: boolean,
  ): Promise<IRentalOrder>;
}

export interface IRentalDashboardStats {
  hosting: {
    totalEarnings: number;
    activeRentals: number;
    totalListings: number;
    totalOrders: number;
    monthlyEarnings: { month: string; amount: number }[];
    recentActivity: IRentalOrder[];
  };
  renting: {
    totalSpent: number;
    activeRents: number;
    totalOrders: number;
    recentActivity: IRentalOrder[];
  };
}
