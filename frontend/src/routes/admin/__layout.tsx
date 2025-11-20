import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import AdminHeader from '../../layouts/admin/AdminHeader.tsx'
import AdminSidebar from '../../layouts/admin/AdminSideBar.tsx'

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
          to: "/auth/login",
          search: { redirect: location.href }
        });
      }

      const data = await res.json();
      console.log("refresh successful:", data);

      if (!data.success || !data.data?.user) {
        console.log("invalid response structure");
        throw redirect({ to: "/auth/login" });
      }

      if (data.data.user.role !== "admin") {
        console.log("user is not admin");
        throw redirect({ to: "/auth/login" });
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

      throw redirect({ to: "/auth/login" });
    }
  },

  component: () => (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  ),
});