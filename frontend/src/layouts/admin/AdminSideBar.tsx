import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { adminDashboardApi } from '../../services/api/adminDashboardApi';
import {
  LayoutDashboard,
  Users,
  Camera,
  LogOut,
  Tag,
  Package,
  FileCheck,
  ShoppingBag,
  ListOrdered,
  Wallet,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../modules/auth/store/useAuthStore.ts";

import { toast } from "sonner"
import { confirm } from "../../components/ConfirmToaster.tsx";
import { ROUTES } from "../../constants/routes.ts";

const navItems = [
  { id: 1, name: "Dashboard", icon: <LayoutDashboard size={20} />, path: ROUTES.ADMIN.DASHBOARD },
  { id: 2, name: "Users", icon: <Users size={20} />, path: ROUTES.ADMIN.USERS },
  { id: 3, name: "Photographers", icon: <Camera size={20} />, path: ROUTES.ADMIN.PHOTOGRAPHERS },
  { id: 4, name: "Categories", icon: <Tag size={20} />, path: ROUTES.ADMIN.CATEGORIES },
  { id: 5, name: "Packages", icon: <Package size={20} />, path: ROUTES.ADMIN.PACKAGES },
  { id: 6, name: "Applications", icon: <FileCheck size={20} />, path: ROUTES.ADMIN.APPLICATIONS },
  { id: 7, name: "Rentals", icon: <ShoppingBag size={20} />, path: ROUTES.ADMIN.RENTAL_MANAGEMENT },
  { id: 8, name: "Rental Orders", icon: <ListOrdered size={20} />, path: ROUTES.ADMIN.RENTAL_ORDERS },
  { id: 9, name: "Wallet", icon: <Wallet size={20} />, path: ROUTES.ADMIN.WALLET },
  { id: 10, name: "Reports", icon: <AlertTriangle size={20} />, path: ROUTES.ADMIN.REPORTS },
  { id: 11, name: "Rules & Policies", icon: <BookOpen size={20} />, path: ROUTES.ADMIN.RULES },
];

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore()
  const [active, setActive] = useState<number>(1);

  // Fetch admin stats for notifications (shared query key with dashboard)
  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminDashboardApi.getStats,
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

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
                {item.name === "Reports" && (stats?.pendingReportsCount || 0) > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {stats?.pendingReportsCount}
                  </span>
                )}
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