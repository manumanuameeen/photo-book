import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rentalApi } from '../services/api/rentalApi';
import { toast } from 'sonner';

export function useRentalDashboard(enabled = true) {
    const [period, setPeriod] = useState<string>("1y");

    const statsQuery = useQuery({
        queryKey: ['rental-dashboard-stats', period],
        queryFn: async () => {
            const response = await rentalApi.getDashboardStats(period);
            return response.data;
        },
        enabled,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
      if (!statsQuery.error) return;

        const err = statsQuery.error;
        if (err instanceof Error) {
            console.error("Failed to fetch rental dashboard stats", err);
            const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to load dashboard statistics";
            toast.error(msg);
        }
    }, [statsQuery.error]);

    return {
        stats: statsQuery.data ?? null,
        isLoading: statsQuery.isLoading,
        error: statsQuery.error,
        period,
        setPeriod,
        refetch: statsQuery.refetch,
    };
}
