export interface IPaymentService {
  processDepositPayment(
    entityId: string,
    entityType: "rental" | "booking",
    paymentIntentId: string,
    amountPaid: number,
  ): Promise<void>;

  processBalancePayment(
    entityId: string,
    entityType: "rental" | "booking",
    paymentIntentId: string,
    amountPaid: number,
  ): Promise<void>;

  releaseFunds(entityId: string, entityType: "rental" | "booking", ownerId?: string): Promise<void>;

  processRefund(
    entityId: string,
    entityType: "rental" | "booking",
    amount: number,
    reason: string,
  ): Promise<void>;
}
