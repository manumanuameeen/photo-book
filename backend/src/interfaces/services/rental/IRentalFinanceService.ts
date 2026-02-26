import { IRentalOrder } from "../../../model/rentalOrderModel.ts";

export interface IRentalFinanceDashboardStats {
  hosting: {
    totalEarnings: number;
    activeRentals: number;
    totalListings: number;
    totalOrders: number;
    monthlyEarnings: Array<{ month: string; amount: number }>;
    recentActivity: IRentalOrder[];
  };
  renting: {
    totalSpent: number;
    activeRents: number;
    totalOrders: number;
    recentActivity: IRentalOrder[];
  };
}

export interface IRentalFinanceService {
  createInitialPaymentSession(
    order: IRentalOrder,
    depositAmount: number,
    renterEmail: string,
  ): Promise<string>;

  confirmRentalPayment(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;

  createDepositPaymentIntent(orderId: string): Promise<{ url: string; sessionId: string }>;

  createBalancePaymentIntent(orderId: string): Promise<{ url: string; sessionId: string }>;

  payRentalDeposit(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;

  payRentalBalance(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;

  releaseFundsToOwners(order: IRentalOrder): Promise<void>;

  processCancellationRefund(
    order: IRentalOrder,
    cancelledByUserId: string,
    isEmergency?: boolean,
  ): Promise<void>;

  refundOrderPayment(orderId: string): Promise<void | boolean>;

  handleRescheduleFinancials(
    order: IRentalOrder,
    newStartDate: Date,
    newEndDate: Date,
  ): Promise<{
    newTotalAmount: number;
    balanceAdjustment: number;
    refundAmount: number;
    requiresPayment: boolean;
    newAmountPaid?: number;
  }>;

  getRentalDashboardStats(userId: string): Promise<IRentalFinanceDashboardStats>;
}
