import {create} from "zustand";
import type{ IUser } from "../types/user.types";

interface AuthState {
    user :IUser|null;
    isAuthenticated:boolean;
    setUser:(user:IUser)=>void;
    clearUser:()=>void;
}

export const useAuthStore = create<AuthState>((set)=>({
    user:null,
    isAuthenticated:false,
    setUser:(user)=>set({user,isAuthenticated:true}),
    clearUser:()=>set({user:null,isAuthenticated:false})
}))

