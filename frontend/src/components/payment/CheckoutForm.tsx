import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { paymentApi } from "../../services/api/payment.ts";
import { toast } from "sonner";

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
            const msg = error.message ?? "An error occurred";
            setErrorMessage(msg);
            toast.error(msg, { id: "stripe-error" });
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                if (onConfirmPayment) {
                    await onConfirmPayment(paymentIntent.id);
                } else {
                    await paymentApi.confirmPayment(paymentIntent.id, userId, amount);
                }
                toast.success("Payment successful!", { id: "payment-success" });
                onSuccess?.();
            } catch (err) {
                const msg = "Failed to confirm payment with server.";
                setErrorMessage(msg);
                toast.error(msg, { id: "server-confirm-error" });
                console.error(err);
            }
            setIsProcessing(false);
        } else {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 bg-white border border-gray-100 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Payment</h3>
            <PaymentElement className="mb-4" />
            {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                    {errorMessage}
                </div>
            )}
            <button
                disabled={!stripe || isProcessing}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
                {isProcessing ? "Processing..." : `Securely Pay $${amount}`}
            </button>
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                🔒 Secured by Stripe
            </p>
        </form>
    );
};
