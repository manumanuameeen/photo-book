import type { IAdminService } from "../../../interfaces/services/IAdminService";
import type {
  IAdminUserQuery,
  IPaginationUsers,
  IUserResponse,
} from "../../../interfaces/services/IAdminUserService";
import type { IAdminRepository } from "../../../interfaces/repositories/IAdminRepository";

export class AdminServices implements IAdminService {
  private readonly _adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this._adminRepository = adminRepository;
  }

  getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers> {
    return this._adminRepository.getAllUser(query);
  }

  getUser(userId: string): Promise<IUserResponse | null> {
    return this._adminRepository.getUser(userId);
  }

  async blockUser(userId: string): Promise<IUserResponse | null> {
    return this._adminRepository.blockUser(userId);
  }

  async unblockUser(userId: string): Promise<IUserResponse | null> {
    return this._adminRepository.unblockUser(userId);
  }
}
