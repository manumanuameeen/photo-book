import { User } from "../../../models/user.model";
import type { IUser } from "../../../models/user.model";
import type { IUserRepository } from "../../../interfaces/repositories/IUserRepository";
import { BaseRepository } from "../../base/BaseRepository";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const data = await this.findOne({ email: email.toLowerCase().trim() });
    return data;
  }
}
