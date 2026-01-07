import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

export class StripeService {
    private stripe: Stripe;

    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn("⚠️ STRIPE_SECRET_KEY is missing! Stripe functionality will fail.");
        }
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string || "dummy_key_for_dev", {
            apiVersion: "2025-12-15.clover",
        });
    }

    async createPaymentIntent(
        amount: number,
        currency: string = "usd",
        metadata: any = {}
    ): Promise<string> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return paymentIntent.client_secret as string;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
        return await this.stripe.paymentIntents.retrieve(id);
    }
}
