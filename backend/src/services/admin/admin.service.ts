import type { IAdminService } from "../../interfaces/services/IAdminService";
import type {
  IAdminUserQuery,
  IPaginationUsers,
  IUserResponse,
} from "../../interfaces/services/IAdminUserService";
import type { IAdminRepository } from "../../interfaces/repositories/IAdminRepository";
import redisClient from "../../config/redis";

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
    const result = await this._adminRepository.blockUser(userId);
    // Set Redis block flag so auth middleware can check without DB hit
    if (result) {
      await redisClient.set(`blocked:${userId}`, "true");
    }
    return result;
  }

  async unblockUser(userId: string): Promise<IUserResponse | null> {
    const result = await this._adminRepository.unblockUser(userId);
    // Remove Redis block flag
    if (result) {
      await redisClient.del(`blocked:${userId}`);
    }
    return result;
  }
}
