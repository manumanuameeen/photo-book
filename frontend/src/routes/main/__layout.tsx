import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Header from "../../layouts/user/Header";
import Footer from "../../layouts/user/Footer";
import { ROUTES } from "../../constants/routes";

interface CacheData {
  user: {
    role: string;
    [key: string]: unknown;
  };
  expires: number;
}

export const Route = createFileRoute("/main/__layout")({
  loader: async ({ location }) => {
    const publicPaths = [
      ROUTES.USER.HOME,
      "/main/home",
      ROUTES.USER.PHOTOGRAPHER,
      ROUTES.USER.RENTAL_MARKETPLACE,
      ROUTES.USER.HOW_IT_WORKS,
      ROUTES.USER.RULES,
      "/main/photographer/", // Include details
      "/main/rentals/",     // Include details
    ];

    const isPublic = publicPaths.some(path =>
      location.pathname === path || (path !== "/" && location.pathname.startsWith(path))
    );

    const cached = sessionStorage.getItem("auth-cache");
    let userRole = null;
    let isAuthenticated = false;

    if (cached) {
      try {
        const { user: cachedUser, expires }: CacheData = JSON.parse(cached);
        if (Date.now() < expires) {
          userRole = cachedUser.role;
          isAuthenticated = true;
        }
      } catch (error) {
        console.error("Auth cache parse error", error);
      }
    }

    if (!isAuthenticated) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            userRole = data.data?.user?.role;
            isAuthenticated = true;
          }
        }
      } catch (error) {
        console.error("Token refresh failed", error);
      }
    }

    if (isAuthenticated && userRole === "admin") {
      throw redirect({ to: ROUTES.ADMIN.DASHBOARD });
    }

    if (!isPublic && !isAuthenticated) {
      throw redirect({
        to: ROUTES.AUTH.LOGIN,
        search: {
          redirect: location.pathname,
          message: "Please login to access more features",
        },
      });
    }
  },

  component: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});
