import { create } from "zustand";
import type { IUser } from "../types/user.types";
import { authService } from "../services/authService";
// import toast from "react-hot-toast";

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  logout: async () => {
    try {



      await authService.logout();
      set({ user: null });

    } catch (error) {
      console.log("Logout failed:", error)
    }
  }
}));