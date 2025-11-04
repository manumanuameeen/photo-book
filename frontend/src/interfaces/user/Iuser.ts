

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | "photorapher"; 
  status: 'active' | 'blocked';
  walletBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}
