
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPhotographerApi } from "../../../services/api/adminPhotographerApi";
import type {
    GetPhotographersParams,
    Photographer
} from "../types/photographer.types";
import { toast } from "sonner";

export const usePhotographerManagement = () => {
    const queryClient = useQueryClient();

    const usePhotographers = (params: GetPhotographersParams) => {
        return useQuery({
            queryKey: ['photographers', params],
            queryFn: async () => {
                const response = await adminPhotographerApi.getPhotographers({
                    ...params,
                    status: params.status || "APPROVED"
                });
                return response;
            },
            placeholderData: (previousData) => previousData,
        });
    };
   
    const usePhotographerById = (id: string | null) => {
        return useQuery({
            queryKey: ['photographer', id],
            queryFn: async () => {
                if (!id) return null;
                return await adminPhotographerApi.getPhotographerById(id);
            },
            enabled: !!id,
        });
    };

   
    const blockPhotographerMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
            await adminPhotographerApi.blockPhotographer(id, reason);
        },
        onSuccess: () => {
            toast.success("Photographer blocked successfully");
            queryClient.invalidateQueries({ queryKey: ['photographers'] });
            queryClient.invalidateQueries({ queryKey: ['photographer'] });
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message || "Failed to block photographer";
            toast.error(errorMessage);
        }
    });

    const unblockPhotographerMutation = useMutation({
        mutationFn: async (id: string) => {
            await adminPhotographerApi.unblockPhotographer(id);
        },
        onSuccess: () => {
            toast.success("Photographer unblocked successfully");
            queryClient.invalidateQueries({ queryKey: ['photographers'] });
            queryClient.invalidateQueries({ queryKey: ['photographer'] });
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message || "Failed to unblock photographer";
            toast.error(errorMessage);
        }
    });

    return {
        usePhotographers,
        usePhotographerById,
        blockPhotographer: blockPhotographerMutation.mutateAsync,
        unblockPhotographer: unblockPhotographerMutation.mutateAsync,
        isBlocking: blockPhotographerMutation.isPending,
        isUnblocking: unblockPhotographerMutation.isPending
    };
};
