import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUser } from "../types/user.types";
import { getErrorMessage } from "../../../utils/errorhandler";

interface AuthState {
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
  role: "user" | "admin" | "photographer" | null;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
  rehydrateUser: () => Promise<void>;
}

interface CacheData {
  user: IUser;
  expires: number;
}

interface RefreshResponse {
  success: boolean;
  message?: string;
  data?: {
    user: IUser;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,

      setUser: (user: IUser) => {
        console.log("🔐 Setting user in store:", user);

        const cache: CacheData = {
          user,
          expires: Date.now() + 5 * 60 * 1000,
        };
        sessionStorage.setItem("auth-cache", JSON.stringify(cache));

        set({
          user,
          isAuthenticated: true,
          role: user.role as "user" | "admin" | "photographer",
        });
      },

      clearUser: () => {
        console.log("🚪 Clearing user from store");
        sessionStorage.removeItem("auth-cache");
        set({
          user: null,
          isAuthenticated: false,
          role: null,
        });
      },

      logout: async () => {
        try {
          console.log("🚪 Logout initiated");

          const res = await fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000/api/v1" : "/api/v1")}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            console.warn("⚠️ Logout API failed, but clearing local state anyway");
          }

          console.log("✅ Logout successful");
        } catch (error: unknown) {
          console.error("❌ Logout error:", getErrorMessage(error));
        } finally {
          sessionStorage.removeItem("auth-cache");
          set({ user: null, isAuthenticated: false, role: null });
        }
      },

      rehydrateUser: async () => {
        console.log("🔄 Rehydrating user...");

        const cached = sessionStorage.getItem("auth-cache");
        if (cached) {
          try {
            const { user, expires }: CacheData = JSON.parse(cached);
            if (Date.now() < expires) {
              console.log("✅ Using cached user");
              set({
                user,
                isAuthenticated: true,
                role: user.role as "user" | "admin" | "photographer",
              });
              return;
            }
            console.log("⚠️ Cache expired");
          } catch (err: unknown) {
            console.error("❌ Failed to parse cache:", getErrorMessage(err));
            sessionStorage.removeItem("auth-cache");
          }
        }

        try {
          console.log("🔄 Attempting token refresh for rehydration...");

          const res = await fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000/api/v1" : "/api/v1")}/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("📡 Rehydration refresh status:", res.status);

          if (!res.ok) {
            console.log("❌ Refresh failed during rehydration");
            set({ user: null, isAuthenticated: false, role: null });
            return;
          }

          const data = (await res.json()) as RefreshResponse;

          if (data.success && data.data?.user) {
            console.log("✅ Rehydration successful");

            const cache: CacheData = {
              user: data.data.user,
              expires: Date.now() + 5 * 60 * 1000,
            };
            sessionStorage.setItem("auth-cache", JSON.stringify(cache));

            set({
              user: data.data.user,
              isAuthenticated: true,
              role: data.data.user.role as "user" | "admin" | "photographer",
            });
          } else {
            console.log("❌ Invalid response structure");
            set({ user: null, isAuthenticated: false, role: null });
          }
        } catch (err: unknown) {
          console.error("❌ Failed to rehydrate user:", getErrorMessage(err));
          sessionStorage.removeItem("auth-cache");
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