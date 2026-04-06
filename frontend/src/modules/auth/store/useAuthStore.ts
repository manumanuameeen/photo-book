import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUser } from "../types/user.types";

interface AuthState {
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  role: "user" | "admin" | "photographer" | null;
  accessToken: string | null;
  setUser: (user: IUser, accessToken?: string, isVerified?: boolean) => void;
  setVerified: (status: boolean) => void;
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
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isVerified: false,
      role: null,
      accessToken: null,

      setUser: (user: IUser, accessToken?: string, isVerified = true) => {
        console.log("🔐 Setting user in store:", user, "Verified:", isVerified);

        if (isVerified) {
          const cache: CacheData = {
            user,
            expires: Date.now() + 5 * 60 * 1000,
          };
          sessionStorage.setItem("auth-cache", JSON.stringify(cache));
          if (accessToken) {
            sessionStorage.setItem("access-token", accessToken);
          }
        }

        set({
          user,
          isAuthenticated: isVerified,
          isVerified,
          role: user.role as "user" | "admin" | "photographer",
          accessToken: accessToken || get().accessToken,
        });
      },

      setVerified: (status: boolean) => {
        set((state) => ({
          ...state,
          isVerified: status,
          isAuthenticated: status,
        }));
      },

      clearUser: () => {
        console.log("🚪 Clearing user from store");
        sessionStorage.removeItem("auth-cache");
        sessionStorage.removeItem("access-token");
        set({
          user: null,
          isAuthenticated: false,
          isVerified: false,
          role: null,
          accessToken: null,
        });
      },

      logout: async () => {
        try {
          console.log("🚪 Logout initiated");
          await fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000/api/v1" : "/api/v1")}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
          console.log("✅ Logout successful");
        } catch (error: unknown) {
          console.error("❌ Logout error:", error);
        } finally {
          get().clearUser();
        }
      },

      rehydrateUser: async () => {
        console.log("🔄 Rehydrating user...");

        const cached = sessionStorage.getItem("auth-cache");
        const cachedToken = sessionStorage.getItem("access-token");
        if (cached) {
          try {
            const { user, expires }: CacheData = JSON.parse(cached);
            if (Date.now() < expires) {
              console.log("✅ Using cached user");
              set({
                user,
                isAuthenticated: true,
                isVerified: true,
                role: user.role as "user" | "admin" | "photographer",
                accessToken: cachedToken,
              });
              return;
            }
          } catch {
            sessionStorage.removeItem("auth-cache");
            sessionStorage.removeItem("access-token");
          }
        }

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000/api/v1" : "/api/v1")}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (!res.ok) {
            get().clearUser();
            return;
          }

          const data = (await res.json()) as RefreshResponse & { data?: { accessToken?: string } };
          if (data.success && data.data?.user) {
            get().setUser(data.data.user, data.data.accessToken, true);
          } else {
            get().clearUser();
          }
        } catch {
          get().clearUser();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isVerified: state.isVerified,
        role: state.role,
        accessToken: state.accessToken,
      }),
    }
  )
);