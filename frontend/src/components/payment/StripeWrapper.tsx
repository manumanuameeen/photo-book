import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./CheckoutForm.tsx";
import { paymentApi } from "../../services/api/payment.ts";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeWrapperProps {
    amount: number;
    userId: string;
    currency?: string;
    onSuccess?: () => void;
    onConfirmPayment?: (paymentIntentId: string) => Promise<void>;
}

export const StripeWrapper: React.FC<StripeWrapperProps> = ({ amount, userId, currency = "usd", onSuccess, onConfirmPayment }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        paymentApi.createPaymentIntent(amount, currency).then((data) => {
            setClientSecret(data.clientSecret);
        });
    }, [amount, currency]);

    if (!clientSecret) {
        return <div>Loading payment details...</div>;
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm amount={amount} userId={userId} onSuccess={onSuccess} onConfirmPayment={onConfirmPayment} />
        </Elements>
    );
};
