import type { IUserListResponce, IUserResponse } from "../../types/admin.type"
import type{IPagination} from "../../types/IPagination"

export interface IAdminUserRepo{

    getAllUsers(params:IPagination):Promise<IUserListResponce>;
    getUserById(id:string):Promise<IUserResponse>;
    blockUser(id:string):Promise<IUserResponse>;
    unblockUser(id:string):Promise<IUserResponse>;
 
}