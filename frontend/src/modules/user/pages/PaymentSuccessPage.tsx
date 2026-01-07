import { useNavigate } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

export function PaymentSuccessPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="text-green-600 w-16 h-16" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-500 mb-8">
                    Your deposit has been received and your booking is now confirmed.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate({ to: "/main/home" })}
                        className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Go Home
                    </button>
                    <button
                        // Assuming user bookings route exists, strictly it's usually /profile or /bookings
                        // Based on routeTree: /photographer/bookings (for photog), but for user?
                        // Likely in profile. assuming /main/profile for now.
                        onClick={() => navigate({ to: "/main/profile" })}
                        className="flex-1 py-3 px-6 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 transition-colors"
                    >
                        View Bookings
                    </button>
                </div>
            </div>
        </div>
    );
}
