import type { AdminUserQueryDtoType } from "../dto/admin.dto.ts";
import type { IAdminUserQuery } from "../interfaces/admin/IAdminUser.interface.ts";

export class AdminMapper {
  static toQueryInput(dto: AdminUserQueryDtoType): IAdminUserQuery {
    return {
      page: dto.page,
      limit: dto.limit,
      sort: dto.sort,
      search: dto.search.trim(),
    };
  }

  static toUserResponse(user: any) {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };
  }
}
