import { createFileRoute } from '@tanstack/react-router';
import { useState } from "react";
import {
  CreditCard,
  Clock,
  Calendar,
} from 'lucide-react';
import { useUserBookings } from "../../../modules/user/hooks/useUserBookings";
import { bookingApi } from "../../../services/api/bookingApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute('/main/__layout/bookings')({
  component: UserBookingsPage,
});

function UserBookingsPage() {
  const [page, setPage] = useState(1);
  const LIMIT = 5;
  const { data, isLoading, refetch } = useUserBookings(page, LIMIT);
  const queryClient = useQueryClient();

  // Handle data structure
  const bookings = data?.bookings || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'waiting_for_deposit': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handlePayment = async (bookingId: string) => {
    const toastId = toast.loading("Processing payment...");
    try {
      await bookingApi.confirmPayment(bookingId);
      toast.success("Deposit paid successfully!", { id: toastId });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed", { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-400">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="bg-[#1E5631] h-16 w-full shadow-sm"></div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-500 mb-8">Manage your photography sessions and requests.</p>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-6 flex justify-between items-center">
            Booking History
            <span className="text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{total} Total</span>
          </h2>

          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
              <h3 className="text-gray-700 font-medium">No bookings yet</h3>
              <p className="text-sm text-gray-500 mt-1">When you book a photographer, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div key={booking._id} className="p-5 rounded-lg border border-gray-100 hover:border-green-100 hover:bg-green-50/10 transition-colors bg-gray-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{booking.packageDetails?.name || booking.packageId?.name || "Custom Package"}</h4>
                      <p className="text-sm text-gray-500">with <span className="font-medium text-gray-700">{booking.photographerId?.name || "Photographer"}</span></p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status === 'waiting_for_deposit' ? 'Awaiting Deposit' : booking.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>{booking.eventDate ? format(new Date(booking.eventDate), 'PPP') : 'Date TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">${booking.totalAmount}</span>
                    </div>
                  </div>

                  {booking.status === 'waiting_for_deposit' && (
                    <div className="mt-4 bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-orange-800">Deposit Required: ${booking.depositeRequired}</span>
                        {booking.paymentDeadline && (
                          <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                            Expires: {format(new Date(booking.paymentDeadline), 'h:mm a, MMM d')}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handlePayment(booking._id)}
                        className="w-full sm:w-auto py-2 px-6 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <CreditCard size={16} />
                        Pay Deposit & Confirm
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
