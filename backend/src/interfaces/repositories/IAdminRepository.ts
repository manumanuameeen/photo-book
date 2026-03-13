import { IUser } from "../../models/user.model.ts";
import { IBaseRepository } from "./IBaseRepository.ts";
import type {
  IPaginationUsers,
  IAdminUserQuery,
  IUserResponse,
} from "../services/IAdminUserService.ts";

export interface IAdminRepository extends IBaseRepository<IUser> {
  getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers>;
  getUser(userId: string): Promise<IUserResponse | null>;
  blockUser(userId: string): Promise<IUserResponse | null>;
  unblockUser(userId: string): Promise<IUserResponse | null>;
}
