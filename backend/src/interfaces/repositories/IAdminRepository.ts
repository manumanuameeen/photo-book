import { IUser } from "../../model/userModel.ts";
import { IBaseRepository } from "./IBaseRepository.ts";
import type {
  IPaginationUsers,
  IAdminUserQuery,
  IUserResponse,
} from "../admin/IAdminUser.interface.ts";

export interface IAdminRepository extends IBaseRepository<IUser> {
  getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers>;
  getUser(userId: string): Promise<IUserResponse | null>;
  blockUser(userId: string): Promise<IUserResponse | null>;
  unblockUser(userId: string): Promise<IUserResponse | null>;
}
