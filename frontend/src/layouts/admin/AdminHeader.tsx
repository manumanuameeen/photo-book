import React, { useState } from "react";
import { UserCircle, ChevronDown, Bell, Mail, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuthStore } from "../../modules/auth/store/useAuthStore.ts";
import { confirm } from "../../components/ConfirmToaster.tsx";
import {ROUTES} from "../../constants/routes.ts"


const AdminHeader: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    confirm(
      "Are you sure you need to Logout",
      async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        setIsDropdownOpen(false);

        try {
          await logout();
          toast.success("Logout successfully");

          setTimeout(() => {
            navigate({ to: ROUTES.AUTH.LOGIN });
          }, 1200);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Logout failed";
          toast.error(message);
          setIsLoggingOut(false);
        }
      },
      () => {
        toast.info("Logout Cancelled");
        setIsLoggingOut(false);
      }
    );
  };

  return (
    <header className="bg-white px-6 py-4 shadow-sm border-b border-gray-200 flex justify-between items-center sticky top-0 z-50">

      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome back!</p>
        </div>


      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Mail className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#00693E] rounded-full"></span>
        </button>

        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoggingOut}
          >
            <div className="w-9 h-9  from-[#00693E] to-[#008848] rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || "admin@photobook.com"}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "admin@photobook.com"}
                  </p>
                </div>

                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <UserCircle className="w-4 h-4" />
                  My Profile
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Mail className="w-4 h-4" />
                  Messages
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>

                <hr className="my-1" />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;