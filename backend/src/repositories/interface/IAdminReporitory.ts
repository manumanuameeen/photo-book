import type {  IPaginationUsers,IAdminUserQuery, IUserResponse } from "../../interfaces/admin/IAdminUser.interface.ts";

export interface IAdminRepository{
    getAllUser(query:IAdminUserQuery):Promise<IPaginationUsers>;
    getUserById(userId:string):Promise<IUserResponse | null>;
    blockUser(userId: string): Promise<IUserResponse | null>;
  unblockUser(userId: string): Promise<IUserResponse | null>;
}