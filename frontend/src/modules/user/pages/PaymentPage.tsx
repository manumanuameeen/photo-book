import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { bookingApi } from "../../../services/api/bookingApi";
import { StripeWrapper } from "../../../components/payment/StripeWrapper";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "../../../constants/routes";

export function PaymentPage() {
    const { id } = useParams({ strict: false });
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [booking, setBooking] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookingAndIntent = async () => {
            try {
                if (!id) return;
                const [bookingData, intentData] = await Promise.all([
                    bookingApi.getBookingDetails(id),
                    bookingApi.createPaymentIntent(id)
                ]);
                setBooking(bookingData);
                setClientSecret(intentData.clientSecret);
            } catch (error) {
                console.error("Failed to load booking or payment intent:", error);
                toast.error("Failed to load booking details");
            } finally {
                setLoading(false);
            }
        };
        fetchBookingAndIntent();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
        );
    }

    if (!booking || !id) {
        return <div className="text-center p-10">Booking not found.</div>;
    }

    const handleSuccess = () => {
        navigate({ to: ROUTES.USER.PAYMENT_SUCCESS } as any);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="md:flex">
                    <div className="p-8 w-full">
                        <div className="uppercase tracking-wide text-sm text-green-500 font-semibold mb-1">
                            Complete Your Booking
                        </div>
                        <h1 className="block mt-1 text-lg leading-tight font-medium text-black">
                            Payment required for {booking.packageDetails?.name}
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Please pay the deposit to confirm your booking with {booking.photographerId?.name || "the photographer"}.
                        </p>

                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Total Amount</span>
                                <span className="font-medium">${booking.totalAmount}</span>
                            </div>
                            <div className="flex justify-between mb-6 text-lg font-bold">
                                <span className="text-gray-900">Deposit Due</span>
                                <span className="text-green-600">${booking.depositeRequired}</span>
                            </div>

                            {booking.paymentStatus === 'DEPOSIT_PAID' ? (
                                <div className="text-center text-green-600 font-bold py-4 bg-green-50 rounded-lg">
                                    Deposit Already Paid!
                                </div>
                            ) : (
                                <StripeWrapper
                                    amount={booking.depositeRequired}
                                    userId={user?._id || ""}
                                    clientSecret={clientSecret}
                                    onSuccess={handleSuccess}
                                    onConfirmPayment={async (paymentIntentId) => {
                                        await bookingApi.confirmPayment(id, paymentIntentId);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
