import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import type { UserRoleType } from "../interfaces/user/userRole.enum.ts";
import UserRole from "../interfaces/user/userRole.enum.ts";
import type { UserStatusType } from "../interfaces/user/userStatus.enum.ts";
import UserStatus from "../interfaces/user/userStatus.enum.ts";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  bio?: string;
  location?: string;
  lat?: number;
  lng?: number;
  role: UserRoleType;
  status: UserStatusType;
  isBlocked: boolean;
  walletBalance: number;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, required: true },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    isBlocked: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
