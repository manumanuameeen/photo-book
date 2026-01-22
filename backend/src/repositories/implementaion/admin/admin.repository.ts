import { User, IUser } from "../../../model/userModel.ts";
import { BaseRepository } from "../../base/BaseRepository.ts";
import type { IAdminRepository } from "../../../interfaces/repositories/IAdminRepository.ts";
import type {
  IUserResponse,
  IAdminUserQuery,
  IPaginationUsers,
} from "../../../interfaces/admin/IAdminUser.interface.ts";
import { AdminMapper } from "../../../mappers/admin.mapper.ts";

export class AdminRepository extends BaseRepository<IUser> implements IAdminRepository {
  constructor() {
    super(User);
  }

  async getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers> {
    const { limit, page, search, sort, isBlocked } = query;
    const skip = (page - 1) * limit;

    const roleFilter = { role: { $nin: ["admin", "photographer"] } };

    const filterQuery: any = { ...roleFilter };

    if (search) {
      filterQuery.name = { $regex: search, $options: "i" };
    }

    if (isBlocked && isBlocked !== "all") {
      filterQuery.isBlocked = isBlocked === "true";
    }

    const users = await this._model
      .find(filterQuery)
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formatedUser: IUserResponse[] = (users as unknown as IUser[]).map(
      AdminMapper.toUserResponse,
    );

    const total = await this._model.countDocuments(filterQuery);

    return {
      users: formatedUser,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(userId: string): Promise<IUserResponse | null> {
    const user = await this._model.findById(userId).lean();
    if (!user) return null;

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };
  }

  async blockUser(userId: string): Promise<IUserResponse | null> {
    const user = await this._model
      .findByIdAndUpdate(userId, { isBlocked: true }, { new: true })
      .lean();
    if (!user) return null;

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };
  }

  async unblockUser(userId: string): Promise<IUserResponse | null> {
    const user = await this._model
      .findByIdAndUpdate(userId, { isBlocked: false }, { new: true })
      .lean();
    if (!user) return null;

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };
  }
}
