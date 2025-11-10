import { Outlet, createFileRoute } from "@tanstack/react-router";
import Header from "../../layouts/user/Header";
import Footer from "../../layouts/user/Footer";

export const Route = createFileRoute("/main/__layout")({
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
