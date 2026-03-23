import { IRentalOrder } from "../../../models/rentalOrder.model.ts";

export interface IRentalPaymentService {
  createDepositPaymentIntent(orderId: string): Promise<{ url: string; sessionId: string }>;
  payRentalDeposit(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;
  createBalancePaymentIntent(orderId: string): Promise<{ url: string; sessionId: string }>;
  payRentalBalance(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;
  completeRentalOrder(orderId: string): Promise<IRentalOrder>;
  confirmRentalPayment(orderId: string, paymentIntentId: string): Promise<IRentalOrder>;
}
