import { IAdminService } from "../IAdminService";
import { IAdminUserQuery, IPaginationUsers, IUserResponse } from "../../../interfaces/admin/IAdminUser.interface";
import { IAdminRepository } from "repositories/interface/IAdminReporitory";


export class AdminServices implements IAdminService {

    private adminRepository: IAdminRepository;

    constructor(adminRepository: IAdminRepository) {
        this.adminRepository = adminRepository
    }

    getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers> {
        return this.adminRepository.getAllUser(query);
    }

    getUserById(userId: string): Promise<IUserResponse | null> {
        return this.adminRepository.getUserById(userId);
    }

    async blockUser(userId: string): Promise<IUserResponse | null> {
    return this.adminRepository.blockUser(userId);
  }

  async unblockUser(userId: string): Promise<IUserResponse | null> {
    return this.adminRepository.unblockUser(userId);
  }
}





