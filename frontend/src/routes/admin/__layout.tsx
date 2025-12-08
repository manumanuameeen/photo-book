import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import AdminHeader from '../../layouts/admin/AdminHeader.tsx'
import AdminSidebar from '../../layouts/admin/AdminSideBar.tsx'
import { ROUTES } from "../../constants/routes.ts";

interface CacheData {
  user: {
    role: string;
    [key: string]: unknown;
  };
  expires: number;
}

export const Route = createFileRoute('/admin/__layout')({
  loader: async ({ location }) => {
    console.log("🔍 Admin layout loader started");

    const cached = sessionStorage.getItem("auth-cache");
    if (cached) {
      try {
        const { user, expires }: CacheData = JSON.parse(cached);
        if (Date.now() < expires && user.role === "admin") {
          console.log("✅ Using cached admin user");
          return { user };
        }
        console.log("⚠️ Cache expired or user not admin");
      } catch (error) {
        console.error("❌ Failed to parse cache:", error);
        sessionStorage.removeItem("auth-cache");
      }
    }
    try {
      console.log("🔄 Attempting token refresh...");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("refresh response status:", res.status);

      if (!res.ok) {
        console.log("refresh failed, redirecting to login");
        throw redirect({
          to: ROUTES.AUTH.LOGIN,
          search: { redirect: location.href }
        });
      }

      const data = await res.json();
      console.log("refresh successful:", data);

      if (!data.success || !data.data?.user) {
        console.log("invalid response structure");
        throw redirect({ to: ROUTES.AUTH.LOGIN });
      }

      if (data.data.user.role !== "admin") {
        console.log("user is not admin");
        throw redirect({ to: ROUTES.AUTH.LOGIN });
      }

      const cacheData: CacheData = {
        user: data.data.user,
        expires: Date.now() + 5 * 60 * 1000,
      };
      sessionStorage.setItem("auth-cache", JSON.stringify(cacheData));
      // console.log("✅ User cached successfully");

      return { user: data.data.user };
    } catch (error) {
      console.error("❌ Loader error:", error);

      if (error instanceof Response) {
        throw error;
      }

      sessionStorage.removeItem("auth-cache");

      throw redirect({ to: ROUTES.AUTH.LOGIN });
    }
  },

  component: () => (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - fixed width, full height */}
      <div className="flex-shrink-0 h-full">
        <AdminSidebar />
      </div>

      {/* Main Content - flexible width, scrolls vertically */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  ),
});