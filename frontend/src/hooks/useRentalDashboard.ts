import { useState, useEffect, useCallback } from 'react';
import { rentalApi } from '../services/api/rentalApi';
import type { IRentalDashboardStats } from '../types/rental';
import { toast } from 'sonner';

export function useRentalDashboard() {
    const [stats, setStats] = useState<IRentalDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<string>("1y");

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await rentalApi.getDashboardStats(period);
            if (response.success) {
                setStats(response.data);
            }
        } catch (err: unknown) {
            console.error("Failed to fetch rental dashboard stats", err);
            const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to load dashboard statistics";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, error, period, setPeriod, refetch: fetchStats };
}
