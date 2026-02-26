import { useNavigate, useSearch } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { ROUTES } from "../../../constants/routes";
import { useEffect, useState } from "react";
import { rentalApi } from "../../../services/api/rentalApi";
import toast from "react-hot-toast";

export function PaymentSuccessPage() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false }) as { session_id?: string; order_id?: string };
    const [isConfirming, setIsConfirming] = useState(true);

    useEffect(() => {
        const confirmPayment = async () => {
            const sessionId = search.session_id;
            const orderId = search.order_id;

            if (!sessionId || !orderId) {
                console.warn('Missing session_id or order_id in URL');
                setIsConfirming(false);
                return;
            }

            try {
                await rentalApi.payDeposit(orderId, sessionId);
                toast.success('Payment confirmed! Your rental is now active.');
                setIsConfirming(false);
            } catch (error: unknown) {
                console.error('Payment confirmation error:', error);
                const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to confirm payment';
                toast.error(errorMessage);
                setIsConfirming(false);
            }
        };

        confirmPayment();
    }, [search.session_id, search.order_id]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="text-green-600 w-16 h-16" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isConfirming ? 'Confirming Payment...' : 'Payment Successful!'}
                </h1>
                <p className="text-gray-500 mb-8">
                    {isConfirming
                        ? 'Please wait while we confirm your payment...'
                        : 'Your deposit has been received and your rental is now confirmed.'
                    }
                </p>

                {!isConfirming && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate({ to: ROUTES.USER.HOME })}
                            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Go Home
                        </button>
                        <button
                            onClick={() => navigate({ to: ROUTES.USER.PROFILE })}
                            className="flex-1 py-3 px-6 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 transition-colors"
                        >
                            View Rentals
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
