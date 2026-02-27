import { createFileRoute, redirect } from "@tanstack/react-router";
import Header from "../layouts/user/Header";
import Footer from "../layouts/user/Footer";
import HomePage from "../modules/user/pages/Home";
import { ROUTES } from "../constants/routes";

interface CacheData {
    user: {
        role: string;
        [key: string]: unknown;
    };
    expires: number;
}

export const Route = createFileRoute("/")({
    loader: async () => {
        const cached = sessionStorage.getItem("auth-cache");
        if (cached) {
            try {
                const { user, expires }: CacheData = JSON.parse(cached);
                if (Date.now() < expires && user.role === "admin") {
                    throw redirect({ to: ROUTES.ADMIN.DASHBOARD });
                }
            } catch (error) {
                if (error instanceof Response) throw error;
            }
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data?.user?.role === "admin") {
                    throw redirect({ to: ROUTES.ADMIN.DASHBOARD });
                }
            }
        } catch (error) {
            if (error instanceof Response) throw error;
        }
    },

    component: () => (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <HomePage />
            </main>
            <Footer />
        </div>
    ),
});
