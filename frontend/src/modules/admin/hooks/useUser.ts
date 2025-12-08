import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminUserService } from "../services/implements/admin.user.service";
import type { IPagination } from "../types/IPagination";



export const useAdminUser = (page = 1, limit = 10, search = "") => {

    const  params: IPagination = {
        page: page,
        limit: limit,
        search: search
    }

    return useQuery({
        queryKey: ['admin-user', params],
        queryFn: () => AdminUserService.getalluser(params)
    });

};


export const useAdminById = (id: string) => {
    return useQuery({
        queryKey: ["admin-user", id],
        queryFn: () => AdminUserService.getuserbyId(id),
        enabled: !!id,
    })
}


export const useBlockUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AdminUserService.blockuser(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user"], exact: false }),
    });
}


export const useUnblockUser = () => {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AdminUserService.unblockUser(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user"],exact:false })
    })
}