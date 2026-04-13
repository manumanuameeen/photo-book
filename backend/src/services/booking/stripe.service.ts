import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

import { IStripeService } from "../../interfaces/services/IStripeService";

export interface StripeMetadata {
  type?: string;
  bookingId?: string;
  orderId?: string;
  [key: string]: string | number | undefined;
}

export class StripeService implements IStripeService {
  private readonly _stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("⚠️ STRIPE_SECRET_KEY is missing! Stripe functionality will fail.");
    }
    this._stripe = new Stripe((process.env.STRIPE_SECRET_KEY as string) || "dummy_key_for_dev", {
      apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = "usd",
    metadata: Record<string, string | number> = {},
  ): Promise<{ id: string; clientSecret: string }> {
    try {
      const paymentIntent = await this._stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata: this._stringifyMetadata(metadata),
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return { id: paymentIntent.id, clientSecret: paymentIntent.client_secret as string };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred during payment intent creation");
    }
  }

  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return await this._stripe.paymentIntents.retrieve(id);
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refundConfig: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };
      if (amount) {
        refundConfig.amount = Math.round(amount * 100);
      }
      return await this._stripe.refunds.create(refundConfig);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Refund failed: ${message}`);
    }
  }
  async createCheckoutSession(
    amount: number,
    currency: string = "usd",
    metadata: Record<string, string | number> = {},
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string,
  ): Promise<{ url: string; id: string }> {
    try {
      const session = await this._stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name:
                  metadata.type === "booking_deposit"
                    ? "Booking Deposit"
                    : metadata.type === "rental_initial_payment"
                      ? "Rental Deposit"
                      : "Rental Balance",
                description: `Payment for ${metadata.bookingId || metadata.orderId}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        metadata: this._stringifyMetadata(metadata),
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session URL");
      }

      return { url: session.url, id: session.id };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred during checkout session creation");
    }
  }
  async retrieveCheckoutSession(id: string): Promise<Stripe.Checkout.Session> {
    return await this._stripe.checkout.sessions.retrieve(id);
  }

  private _stringifyMetadata(metadata: StripeMetadata): Record<string, string> {
    const stringified: Record<string, string> = {};
    for (const key in metadata) {
      if (Object.prototype.hasOwnProperty.call(metadata, key)) {
        const value = metadata[key];
        if (value !== undefined) {
          stringified[key] = String(value);
        }
      }
    }
    return stringified;
  }
}
