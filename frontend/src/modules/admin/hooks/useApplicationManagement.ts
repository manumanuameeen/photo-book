
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPhotographerApi } from "../../../services/api/adminPhotographerApi";
import type {
    GetPhotographersParams
} from "../types/photographer.types";
import { toast } from "sonner";
import { getErrorMessage, type ApiError } from "../../../utils/errorhandler";

export const useApplicationManagement = () => {
    const queryClient = useQueryClient();

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

    const approveApplicationMutation = useMutation({
        mutationFn: async ({ id, message }: { id: string; message: string }) => {
            await adminPhotographerApi.approveApplication(id, message);
        },
        onSuccess: () => {
            toast.success("Application approved successfully");
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['application'] });
        },
        onError: (err: ApiError) => {
            toast.error(getErrorMessage(err));
        }
    });

    const rejectApplicationMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            await adminPhotographerApi.rejectApplication(id, reason);
        },
        onSuccess: () => {
            toast.success("Application rejected");
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['application'] });
        },
        onError: (err: ApiError) => {
            toast.error(getErrorMessage(err));
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
