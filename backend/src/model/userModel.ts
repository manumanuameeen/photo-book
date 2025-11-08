import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import type { UserRole } from "../interfaces/user/userRole.enum";
import type { UserStatus } from "../interfaces/user/userStatus.enum";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  isBlocked: Boolean;
  walletBalance: number;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values({} as any), default: "user" },
    status: { type: String, enum: Object.values({} as any), default: "active" },
    isBlocked: {type:Boolean,default:false},
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
