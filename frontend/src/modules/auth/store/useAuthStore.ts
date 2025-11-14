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

      setUser: (user: IUser) =>
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
          set({ user: null, isAuthenticated: false, role: null });
        } catch (error) {
          console.error("Logout failed:", error);
          throw error;
        }
      },

      rehydrateUser: async () => {
        const cached = sessionStorage.getItem("auth-cache");
        if (cached) {
          try {
            const { user, expires } = JSON.parse(cached);
            if (Date.now() < expires) {
              set({
                user,
                isAuthenticated: true,
                role: user.role as any,
              });
              return;
            }
          } catch {}
        }

        const data = await authService.getCurrentUser();
        if (data?.data?.user) {
          const cache = {
            user: data.data.user,
            expires: Date.now() + 5 * 60 * 1000,
          };
          sessionStorage.setItem("auth-cache", JSON.stringify(cache));
          set({
            user: data.data.user,
            isAuthenticated: true,
            role: data.data.user.role as any,
          });
        } else {
          set({ user: null, isAuthenticated: false, role: null });
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