import { User, IUser } from "../../model/userModel.ts";
import { IUserRepository } from "../interface/IuserRepository.ts";
export class UserRepositery implements IUserRepository {

    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new User(data)
        return await user.save();
    }

    async findByEmail(email:string):Promise<IUser|null>{
         return await User.findOne({email:email})
    }

    async findById(_id: string): Promise<IUser | null> {
        return await User.findById(_id).exec()
    }

    async updateUser(id: string,data:Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,data,{new :true}).exec();
    }
}

