import { IUser } from "../../model/userModel";

export interface IUserRepository {
  createUser(data: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(_id: string): Promise<IUser | null>;
  updateUser(_id: string, data: Partial<IUser>): Promise<IUser | null>;
}
