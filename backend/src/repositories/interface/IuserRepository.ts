import { IUser } from "../../model/userModel.ts";

export interface IUserRepository{
    createUser(data:Partial<IUser>):Promise<IUser>;
    findByEmail(email:string):Promise<IUser|null>;
    findById(id:string):Promise<IUser|null>;
    updateUser(id:string,data:Partial<IUser>):Promise<IUser|null>
}