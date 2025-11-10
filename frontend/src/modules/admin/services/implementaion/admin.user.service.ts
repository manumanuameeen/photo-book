

import type { IAdminUserService } from "../interface/IAdminUserService";
import type { IUserResponse,IUserListResponce } from "../../types/admin.type";
import type { IPagination } from "../../types/IPagination";
import type { IAdminUserRepo } from "../../repositories/interface/IAdminUserRepo";
import { AdminUserRepository } from "../../repositories/implementation/adminUser.repository";
 class AdminUserServiceClass implements IAdminUserService{


    private adminUserRepository: IAdminUserRepo

    constructor(adminUserRespo:IAdminUserRepo){
        this.adminUserRepository = adminUserRespo;
    }


    async getalluser(params: IPagination): Promise<IUserListResponce> {
        return this.adminUserRepository.getAllUsers(params);
    }

    async getuserbyId(id: string): Promise<IUserResponse> {
        return this.adminUserRepository.getUserById(id);
    }

    async blockuser(id: string): Promise<IUserResponse> {
        return this.adminUserRepository.blockUser(id)
    }

    async unblockUser(id: string): Promise<IUserResponse> {
        return this.adminUserRepository.unblockUser(id)
    }

}


export const AdminUserService = new AdminUserServiceClass(AdminUserRepository)