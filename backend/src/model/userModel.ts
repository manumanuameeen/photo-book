import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt  from "bcrypt";
import { UserRole } from "../interfaces/user/userRole.enum.ts";
import { UserStatus } from "../interfaces/user/userStatus.enum.ts";



export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    walletBalance: number;
    otp:string;
    otpExpires?:Date;
    createdAt?: Date;
    updatedAt?: Date;

    comparePassword(enterPassword: string): Promise<boolean>;

}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    phone: {
        type: String,
        required: true
    },
    role:{
        type:String,
        enum:Object.values(UserRole),
        default:UserRole.USER
    },
    status:{
        type:String,
        enum:Object.values(UserStatus),
        default:UserStatus.ACTIVE
    },
    walletBalance:{
        type:Number,
        default:0
    },
    otp:{
        type:String,
        default:null,
    },
    otpExpires:{
        type: Date,
        default:null
    },

},{timestamps:true})


userSchema.pre<IUser>("save",async function (next) {
if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
    next();
})

userSchema.methods.comparePassword = async function (enterPassword:string):Promise<boolean>{
    return await bcrypt.compare(enterPassword,this.password)
}

export const User = mongoose.model<IUser>("User",userSchema);