
import apiClient from "../../../../services/apiClient";
import type { IAdminUserRepo } from "../interface/IAdminUserRepo";
import type { IUserListResponce, IUserResponse } from "../../types/admin.type";
import type { IPagination } from "../../types/IPagination";


class AdminUserRepositoryClass implements IAdminUserRepo {



    
    async getAllUsers(params: IPagination): Promise<IUserListResponce> {
        console.log("params from front repo",params)
        const res = await apiClient.get<IUserListResponce>(
            `/admin/users?page=${params.page}&limit=${params.limit}&search=${params.search}`
        );
        console.log("data from repo get al  user",res.data)
        return res.data;
    }

    async getUserById(id: string): Promise<IUserResponse> {
        const res = await apiClient.get(`/admin/users/${id}`);
        return res.data;
    }

    async blockUser(id: string): Promise<IUserResponse> {
        const res = await apiClient.patch(`/admin/users/${id}/block`);
        return res.data;
    }

    async unblockUser(id: string): Promise<IUserResponse> {
        const res = await apiClient.patch(`/admin/users/${id}/unblock`);
        return res.data;
    }
}


export const AdminUserRepository = new AdminUserRepositoryClass()