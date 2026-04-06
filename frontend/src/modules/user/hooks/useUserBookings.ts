import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../../../services/api/bookingApi";
import { toast } from "sonner";

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
            toast.success("Booking cancelled successfully", { id: "cancel-success" });
        },
    });
};

export const useUserActions = () => {
    const queryClient = useQueryClient();

    const confirmEndWork = useMutation({
        mutationFn: (id: string) => bookingApi.confirmEndWork(id),
        onSuccess: () => {
            toast.success("Work completion confirmed!", { id: "confirm-work-success" });
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        },
        onError: () => {
            // apiClient handles the error toast
        }
    });

    const cancelBookingMutation = useMutation({
        mutationFn: ({ bookingId, reason, isEmergency }: { bookingId: string, reason?: string, isEmergency?: boolean }) =>
            bookingApi.cancelBooking(bookingId, reason, isEmergency),
        onSuccess: () => {
            toast.success("Booking cancelled.", { id: "cancel-booking-success" });
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        },
        onError: () => {
            // apiClient handles the error toast
        }
    });

    const confirmDelivery = useMutation({
        mutationFn: (id: string) => bookingApi.confirmDelivery(id),
        onSuccess: () => {
            toast.success("Delivery confirmed! Payment released to photographer.", { id: "confirm-delivery-success" });
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        },
        onError: () => {
            // apiClient handles the error toast
        }
    });

    const rescheduleMutation = useMutation({
        mutationFn: ({ bookingId, date, time, reason }: { bookingId: string, date: string, time: string, reason: string }) =>
            bookingApi.requestReschedule(bookingId, { newDate: new Date(date), newStartTime: time, reason }),
        onSuccess: () => {
            toast.success("Reschedule request sent", { id: "reschedule-success" });
            queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
        },
        onError: () => {
            // apiClient handles the error toast
        }
    });

    return { confirmEndWork, confirmDelivery, rescheduleMutation, cancelBookingMutation };
};
