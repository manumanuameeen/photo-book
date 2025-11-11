import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUser } from "../types/user.types";
import { authService } from "../services/authService";

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  role: "user" | "admin" | "photographer" | null;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
  rehydrateUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          role: user.role as "user" | "admin" | "photographer",
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
        } catch (error) {
          console.error("Logout failed:", error);
          throw error;
        }
      },

      rehydrateUser: async () => {
        try {
          const data = await authService.getCurrentUser();
          if (data?.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              role: data.user.role as "user" | "admin" | "photographer",
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              role: null,
            });
          }
        } catch (error) {
          console.error("Rehydrate Failed", error);
          set({
            user: null,
            isAuthenticated: false,
            role: null,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);
