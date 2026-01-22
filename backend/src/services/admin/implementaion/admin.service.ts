import type { IAdminService } from "../../../interfaces/services/IAdminService.ts";
import type {
  IAdminUserQuery,
  IPaginationUsers,
  IUserResponse,
} from "../../../interfaces/admin/IAdminUser.interface.ts";
import type { IAdminRepository } from "../../../interfaces/repositories/IAdminRepository.ts";

export class AdminServices implements IAdminService {
  private readonly adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this.adminRepository = adminRepository;
  }

  getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers> {
    return this.adminRepository.getAllUser(query);
  }

  getUser(userId: string): Promise<IUserResponse | null> {
    return this.adminRepository.getUser(userId);
  }

  async blockUser(userId: string): Promise<IUserResponse | null> {
    return this.adminRepository.blockUser(userId);
  }

  async unblockUser(userId: string): Promise<IUserResponse | null> {
    return this.adminRepository.unblockUser(userId);
  }
}
