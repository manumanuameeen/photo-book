import { User } from "../../../model/userModel.ts";
import type { IAdminRepository } from "../../interface/IAdminReporitory.ts";
import type {
  IUserResponse,
  IAdminUserQuery,
  IPaginationUsers,
} from "../../../interfaces/admin/IAdminUser.interface.ts";

export class AdminRepository implements IAdminRepository {
  async getAllUser(query: IAdminUserQuery): Promise<IPaginationUsers> {
    const { limit, page, search, sort } = query;
    const skip = (page - 1) * limit;
    const searchQuery = search ? { name: { $regex: search, $options: "i" } } : {};

    const users = await User.find(searchQuery)
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    console.log("user from adminusrrepo", users);
    const formatedUser: IUserResponse[] = users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    }));

    const total = await User.countDocuments(searchQuery);

    return {
      users: formatedUser,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string): Promise<IUserResponse | null> {
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
