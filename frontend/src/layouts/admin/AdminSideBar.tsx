import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Camera,
  BookOpen,
  Key,
  Wallet,
  MessageSquare,
  Grid,
  LogOut,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../modules/auth/store/useAuthStore.ts";
// import toast from "react-hot-toast";
import { toast } from "sonner"
import { confirm } from "../../components/ConfirmToaster.tsx";
import { ROUTES } from "../../constants/routes.ts";

interface NavItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 1, name: "Dashboard", icon: <LayoutDashboard size={20} />, path: ROUTES.ADMIN.DASHBOARD },
  { id: 2, name: "Users", icon: <Users size={20} />, path: ROUTES.ADMIN.USERS },
  { id: 3, name: "Photographers", icon: <Camera size={20} />, path: ROUTES.ADMIN.PHOTOGRAPHERS },
  { id: 4, name: "Bookings", icon: <BookOpen size={20} />, path: "/admin/bookings" }, // TODO: Add to routes
  { id: 5, name: "Rentals", icon: <Key size={20} />, path: "/admin/rentals" }, // TODO: Add to routes
  { id: 6, name: "Wallet", icon: <Wallet size={20} />, path: "/admin/wallet" }, // TODO: Add to routes
  { id: 7, name: "Chat", icon: <MessageSquare size={20} />, path: "/admin/chat" }, // TODO: Add to routes
  { id: 8, name: "Category", icon: <Grid size={20} />, path: "/admin/category" }, // TODO: Add to routes
];

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore()
  const [active, setActive] = useState<number>(1);




  const handleNavClick = (id: number, path: string) => {
    setActive(id);
    navigate({ to: path });
  };


  const handleLogout = () => {
    confirm(
      "Are you sure you need to logout",
      async () => {
        try {
          await logout();
          toast.success("Logged out successfully");
          setTimeout(() => {
            navigate({ to: ROUTES.AUTH.LOGIN });
          }, 1200);
        } catch {
          toast.error("Logout failed");
        }
      },
      () => {
        toast.info("Logout Cancelled");
      }
    );
  };

  return (
    <aside className="w-64 bg-white flex flex-col h-full shadow-xl border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10  from-[#00693E] to-[#008848] rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">📸</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">PhotoBook</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className=" mt-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavClick(item.id, item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active === item.id
                  ? "bg-[#00693E] text-white shadow-md shadow-green-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" onClick={handleLogout}>
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;