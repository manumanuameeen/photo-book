import type { IUser } from "../../models/user.model";

export interface IUserRepository {
  create(data: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(_id: string): Promise<IUser | null>;
  update(_id: string, data: Partial<IUser>): Promise<IUser | null>;
}
