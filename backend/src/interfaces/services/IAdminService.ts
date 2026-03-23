import type {
  IAdminUserQuery,
  IPaginationUsers,
  IUserResponse,
} from "../services/IAdminUserService";

export interface IAdminService {
  getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers>;
  getUser(userId: string): Promise<IUserResponse | null>;
  blockUser(userId: string): Promise<IUserResponse | null>;
  unblockUser(userId: string): Promise<IUserResponse | null>;
}
