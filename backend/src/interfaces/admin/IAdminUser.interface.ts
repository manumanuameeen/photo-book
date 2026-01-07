export interface IAdminUserQuery {
  page: number;
  limit: number;
  sort: string;
  search: string;
  isBlocked?: "true" | "false" | "all";
}

export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

export interface IPaginationUsers {
  users: IUserResponse[];
  total: number;
  totalPages: number;
  currentPage: number;
}
