export interface CreatePaymentIntentDTO {
  amount: number;
  currency: string;
}

export interface ConfirmPaymentDTO {
  paymentIntentId: string;
  userId: string;
  amount: number;
  description?: string;
}
