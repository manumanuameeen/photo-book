
import type { IPagination } from "../../types/IPagination"
import type {IUserListResponce,IUserResponse,} from "../../types/admin.type"

export interface  IAdminUserService{

    getalluser(params:IPagination):Promise<IUserListResponce>;
    getuserbyId(id:string):Promise<IUserResponse>;
    blockuser(id:string):Promise<IUserResponse>;
    unblockUser(id:string):Promise<IUserResponse>;

}