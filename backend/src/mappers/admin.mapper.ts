import type { AdminUserQueryDtoType } from "../dto/admin.dto";
import type { IAdminUserQuery } from "../interfaces/services/IAdminUserService";

export class AdminMapper {
  static toQueryInput(dto: AdminUserQueryDtoType): IAdminUserQuery {
    return {
      page: dto.page,
      limit: dto.limit,
      sort: dto.sort,
      search: dto.search.trim(),
      isBlocked: dto.isBlocked,
    };
  }

  static toUserResponse(user: import("../models/user.model").IUser) {
    return {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };
  }
}
