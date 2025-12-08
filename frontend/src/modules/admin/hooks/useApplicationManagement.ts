
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPhotographerApi } from "../../../services/api/adminPhotographerApi";
import type {
    GetPhotographersParams,
    PaginatedPhotographersResponse,
    Photographer
} from "../types/photographer.types";
import { toast } from "sonner";

export const useApplicationManagement = () => {
    const queryClient = useQueryClient();

    // Query for fetching applications
    const useApplications = (params: GetPhotographersParams) => {
        return useQuery({
            queryKey: ['applications', params],
            queryFn: async () => {
                const response = await adminPhotographerApi.getApplications({
                    ...params,
                    status: params.status || "PENDING"
                });
                return response;
            },
            placeholderData: (previousData) => previousData,
        });
    };

    // Query for fetching a single application details
    const useApplicationById = (id: string) => {
        return useQuery({
            queryKey: ['application', id],
            queryFn: async () => {
                if (!id) return null;
                const data = await adminPhotographerApi.getApplicationById(id);
                return data;
            },
            enabled: !!id,
        });
    };

    // Mutation for approving application
    const approveApplicationMutation = useMutation({
        mutationFn: async ({ id, message }: { id: string; message: string }) => {
            await adminPhotographerApi.approveApplication(id, message);
        },
        onSuccess: () => {
            toast.success("Application approved successfully");
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['application'] });
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message || "Failed to approve application";
            toast.error(errorMessage);
        }
    });

    // Mutation for rejecting application
    const rejectApplicationMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            await adminPhotographerApi.rejectApplication(id, reason);
        },
        onSuccess: () => {
            toast.success("Application rejected");
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['application'] });
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message || "Failed to reject application";
            toast.error(errorMessage);
        }
    });

    return {
        useApplications,
        useApplicationById,
        approveApplication: approveApplicationMutation.mutateAsync,
        rejectApplication: rejectApplicationMutation.mutateAsync,
        isApproving: approveApplicationMutation.isPending,
        isRejecting: rejectApplicationMutation.isPending
    };
};
