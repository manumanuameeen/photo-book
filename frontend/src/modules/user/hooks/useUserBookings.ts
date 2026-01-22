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
        mutationFn: bookingApi.cancelBooking,
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
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to confirm work completion");
        }
    });

    const confirmDelivery = useMutation({
        mutationFn: (id: string) => bookingApi.confirmDelivery(id),
        onSuccess: () => {
            toast.success("Delivery confirmed! Payment released to photographer.");
            queryClient.invalidateQueries({ queryKey: ["userBookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to confirm delivery");
        }
    });

    return { confirmEndWork, confirmDelivery };
};
