import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import AdminHeader from '../../layouts/admin/AdminHeader.tsx'
import AdminSidebar from '../../layouts/admin/AdminSideBar.tsx'

export const Route = createFileRoute('/admin/__layout')({
  loader: async ({ location }) => {
    const cached = sessionStorage.getItem("auth-cache");
    if (cached) {
      try {
        const { user, expires } = JSON.parse(cached);
        if (Date.now() < expires && user.role === "admin") {
          return { user };
        }
      } catch {}
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw redirect({ to: "/auth/login", search: { redirect: location.href } });
    }

    const data = await res.json();
    if (data.data.user.role !== "admin") {
      throw redirect({ to: "/auth/login" });
    }

    sessionStorage.setItem("auth-cache", JSON.stringify({
      user: data.data.user,
      expires: Date.now() + 5 * 60 * 1000,
    }));

    return { user: data.data.user };
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