import { create } from "zustand";
import type { IUser } from "../types/user.types";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  role: "user" | "admin" | "photographer" | null;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
  rehydrateUser:()=>Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  role: null,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      role: user.role as "user"|"admin"|"photographer",
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      role: null,
    }),


  logout: async () => {
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        role: null,
      });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Logout failed:", error);
      toast.error("Failed to logout");
    }
  },
  rehydrateUser:async () => {
    try {
      const data = await authService.getCurrentUser()
      if(data?.user){
        set({user:data.user})
      }else{
        set({user:null});
      }
    } catch (error) {
      console.log("Rehdrate Failed",error);
      set({user:null});
    }
  }
}));
