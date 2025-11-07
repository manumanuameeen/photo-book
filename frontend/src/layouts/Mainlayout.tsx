import { Outlet } from "@tanstack/react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}