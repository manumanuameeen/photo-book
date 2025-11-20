import { User } from "../../../model/userModel.ts";
import type { IAdminRepository } from "../../interface/IAdminReporitory.ts";
import type {
  IUserResponse,
  IAdminUserQuery,
  IPaginationUsers,
} from "../../../interfaces/admin/IAdminUser.interface.ts";
import { AdminMapper } from "../../../mappers/admin.mapper.ts";

export class AdminRepository implements IAdminRepository {
  async getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers> {
    const { limit, page, search, sort } = query;
    const skip = (page - 1) * limit;
    const roleFilter = { role: { $ne: "admin" } }; // only user
    const searchQuery = search
      ? { ...roleFilter, name: { $regex: search, $options: "i" } }
      : roleFilter;

    const users = await User.find(searchQuery)
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formatedUser: IUserResponse[] = users.map(AdminMapper.toUserResponse);

    const total = await User.countDocuments(searchQuery);

    return {
      users: formatedUser,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(userId: string): Promise<IUserResponse | null> {
    const user = await User.findById(userId).lean();
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
    const user = await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true }).lean();
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
    const user = await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true }).lean();
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
