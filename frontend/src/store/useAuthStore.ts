import { create } from "zustand";
import type { IUser } from "../interfaces/user/Iuser";



interface AuthState{
    isAuthenticated:boolean;
    user:IUser|null;
    setUser:(user:IUser)=>void;
    clearUser:()=>void
}


export const useAuthStore = create<AuthState>((set)=>({
    isAuthenticated:false,
    user:null,
    setUser:(user:IUser)=>set({isAuthenticated:true,user}),
    clearUser:()=>set({isAuthenticated:false,user:null}),
}))