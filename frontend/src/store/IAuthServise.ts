import type { IUser } from "../interfaces/user/Iuser";


export  interface AuthState{
    user:IUser,
    isAuthenticated:boolean;
    loading:boolean;
    login:(payload:{email:string;password:string})=>Promise<void>;
    logout:()=>Promise<void>;
    fetchUser :()=>Promise<void>
}

