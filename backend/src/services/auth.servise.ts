import { UserRepositery } from "../repositories/implementaion/user.repositery.ts";
import { IUser } from "../model/userModel.ts";
import { IUserRepository } from "../repositories/interface/IuserRepository.ts";
import { randomInt } from "crypto";
import redisClient from "../config/redis.ts";
import { createAccessToken, createRefreshToken } from "../utils/token.ts";



export class AuthService {

    private userRepositery: UserRepositery
    constructor(userRepo: IUserRepository = new UserRepositery()) {
        this.userRepositery = userRepo
    }

    private generateOtp(): string {
        return randomInt(100000, 999999).toString()
    }

    private async sendOtp(email: string, otp: string): Promise<void> {
        console.log(`OTP for ${email}:${otp}`)
    }

    async signup(data: Partial<IUser>) {
        const { name, email, password, phone } = data;

        if (!name || !email || !password || !phone) {
            throw new Error("All fields are required");
        }

        const existingUser = await this.userRepositery.findByEmail(email!)
        if (existingUser) {
            throw new Error("user already exists");
        }

        const otp = this.generateOtp();
        
        const otpExpires = new Date(Date.now() + 2 * 60 * 1000);
        
        const newUser = await this.userRepositery.createUser({
            name,
            email,
            password,
            phone,
            otp,
            otpExpires,
        });

        await this.sendOtp(email, otp)

        return {
            message: "otp sent to email",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }
        }
    }

    async verifyOtp(email: string, otp: string) {
        const user = await this.userRepositery.findByEmail(email)
        if (!user) throw new Error("User notfound");

        if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            throw new Error("Invalid or expired OTP");
        }

        await this.userRepositery.updateUser(user.id.toString(), {
            otp: undefined,
            otpExpires: undefined,
        })
        return this.issueTokens(user)
    }

    async login(email:string,password:string){
        const user =await this.userRepositery.findByEmail(email)
        if(!user)throw new Error("Invalid Credention")

            const match = await user.comparePassword(password)
            if(!match)throw new Error("Invalid creadentials");

            return this.issueTokens(user)
    }

    async refresh(oldRefreshToken:string){
        const storedId = await redisClient.get(`rt:${oldRefreshToken}`);
        if(!storedId) throw new Error("invalid refresh Token");

        const user = await this.userRepositery.findById(storedId);
        if(!user) throw new Error("User not found");

        const {accessToken,refreshToken} = this.issueTokens(user);
        await redisClient.del(`rt:${oldRefreshToken}`);
        redisClient.setEx(`rt:${refreshToken}`, 7 * 24 * 60 * 60, user._id.toString());

        return {accessToken,refreshToken};
    }

    async logout(refreshToken:string){
        await redisClient.del(`rt:${refreshToken}`);
    }

  private issueTokens(user:IUser) {
    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());
    redisClient.setEx(`rt:${refreshToken}`, 7 * 24 * 60 * 60, user._id.toString());
    return { accessToken, refreshToken, user };
}

}