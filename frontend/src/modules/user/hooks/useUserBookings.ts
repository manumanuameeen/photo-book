import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../../../services/api/bookingApi";
import toast from "react-hot-toast";

export const useUserBookings = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["userBookings", page, limit],
        queryFn: () => bookingApi.getUserBookings(page, limit),
        placeholderData: (previousData) => previousData,
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => bookingApi.cancelBooking(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
        },
    });
};

export const useUserActions = () => {
    const queryClient = useQueryClient();

    const confirmEndWork = useMutation({
        mutationFn: (id: string) => bookingApi.confirmEndWork(id),
        onSuccess: () => {
            toast.success("Work completion confirmed!");
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        },
        onError: (error: unknown) => {
            console.error("Confirm End Work Error:", error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to confirm work completion");
        }
    });

    const cancelBookingMutation = useMutation({
        mutationFn: ({ bookingId, reason, isEmergency }: { bookingId: string, reason?: string, isEmergency?: boolean }) =>
            bookingApi.cancelBooking(bookingId, reason, isEmergency),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        },
        onError: (error: unknown) => {
            console.error("Cancel Error:", error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to cancel booking");
        }
    });

    const confirmDelivery = useMutation({
        mutationFn: (id: string) => bookingApi.confirmDelivery(id),
        onSuccess: () => {
            toast.success("Delivery confirmed! Payment released to photographer.");
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to confirm delivery");
        }
    });

    const rescheduleMutation = useMutation({
        mutationFn: ({ bookingId, date, time, reason }: { bookingId: string, date: string, time: string, reason: string }) =>
            bookingApi.requestReschedule(bookingId, { newDate: new Date(date), newStartTime: time, reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
            toast.success("Reschedule request sent");
        },
        onError: (error: unknown) => {
            console.error("Reschedule Error:", error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to reschedule");
        }
    });

    return { confirmEndWork, confirmDelivery, rescheduleMutation, cancelBookingMutation };
};
