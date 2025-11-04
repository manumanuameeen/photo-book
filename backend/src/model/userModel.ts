// import mongoose, { Document, Schema, Types } from "mongoose";
// import bcrypt from "bcrypt";
// /
// import UserStatus from "../interfaces/user/userStatus.enum";
// import UserRole from "../interfaces/user/userRole.enum";
// export interface IUser extends Document {
//   _id: Types.ObjectId;
//   name: string;
//   email: string;
//   password: string;
//   phone: string;
//   role: UserRole;
//   status: UserStatus;
//   walletBalance: number;
//   otp?: string;
//   otpExpires?: Date;
//   createdAt?: Date;
//   updatedAt?: Date;
//   comparePassword(enteredPassword: string): Promise<boolean>;
// }

// const userSchema = new Schema<IUser>(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true, minlength: 8 },
//     phone: { type: String, required: true },
//     role: {
//       type: String,
//       enum: Object.values(UserRole),
//       default: UserRole.USER,
//     },
//     status: {
//       type: String,
//       enum: Object.values(UserStatus),
//       default: UserStatus.ACTIVE,
//     },
//     walletBalance: { type: Number, default: 0 },
//     otp: { type: String, default: null },
//     otpExpires: { type: Date },
//   },
//   { timestamps: true }
// );


// userSchema.pre("save", async function (next) {
//   const user = this as IUser;
//   if (!(this as any).isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(user.password, salt);
//   next();
// });


// userSchema.methods.comparePassword = async function (
//   enteredPassword: string
// ): Promise<boolean> {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// export const User = mongoose.model<IUser>("User", userSchema);

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
  walletBalance: number;
  otp?: string;
  otpExpires?: Date;
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
    walletBalance: { type: Number, default: 0 },
    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
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