import Stripe from "stripe";

export interface IStripeService {
  createPaymentIntent(
    amount: number,
    currency?: string,
    metadata?: Record<string, string | number>,
  ): Promise<{ id: string; clientSecret: string }>;

  retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent>;

  refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund>;

  createCheckoutSession(
    amount: number,
    currency: string,
    metadata: Record<string, string | number>,
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string,
  ): Promise<{ url: string; id: string }>;

  retrieveCheckoutSession(id: string): Promise<Stripe.Checkout.Session>;
}
