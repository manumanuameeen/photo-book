import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { paymentApi } from "../../services/api/payment.ts";
import toast from "react-hot-toast";

interface CheckoutFormProps {
    amount: number;
    userId: string;
    onSuccess?: () => void;
    onConfirmPayment?: (paymentIntentId: string) => Promise<void>;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, userId, onSuccess, onConfirmPayment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            setErrorMessage(error.message ?? "An error occurred");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                if (onConfirmPayment) {
                    await onConfirmPayment(paymentIntent.id);
                } else {
                    await paymentApi.confirmPayment(paymentIntent.id, userId, amount);
                }
                toast.success("Payment successful!");
                onSuccess?.();
            } catch (err) {
                setErrorMessage("Failed to confirm payment with server.");
            }
            setIsProcessing(false);
        } else {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-4 border rounded shadow">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
            <button
                disabled={!stripe || isProcessing}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {isProcessing ? "Processing..." : `Pay $${amount}`}
            </button>
        </form>
    );
};
