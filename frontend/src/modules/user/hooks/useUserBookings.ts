import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../../../services/api/bookingApi";

export const useUserBookings = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["userBookings", page, limit],
        queryFn: () => bookingApi.getUserBookings(page, limit),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page for smoother UX
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
