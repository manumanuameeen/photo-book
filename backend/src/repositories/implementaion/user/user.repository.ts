import { User } from "../../../model/userModel.ts";
import type { IUser } from "../../../model/userModel.ts";
import type { IUserRepository } from "../../../interfaces/repositories/IUserRepository.ts";
import { BaseRepository } from "../../base/BaseRepository.ts";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const data = await this.findOne({ email: email.toLowerCase().trim() });
    return data;
  }
}
