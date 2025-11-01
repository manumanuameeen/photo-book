import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const createAccessToken = (userId: string) => {
     if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })
};

export const createRefreshToken = (userId:string)=>{
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }
    return jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn:"7d"
    })
};

