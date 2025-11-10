
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

export interface IUserListResponce {
  success: boolean;
  message: string;
  users: {
    users: IUser[];
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface IUserResponse {
  success: boolean;
  message: string;
  data: IUser;
}

