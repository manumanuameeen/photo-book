import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../modules/auth/store/useAuthStore";
import {
  User,
  LogOut,
  LayoutDashboard,
  Home,
  Camera,
  Calendar,
  ToolCase,
  Bell
} from "lucide-react";
import photoBookLogo from "../../assets/photoBook-icon.png"
import { toast } from "sonner";
import { ROUTES } from "../../constants/routes";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, role } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);

  const handleLogout = async () => {
    toast.success("Logout successfully")
    await logout();
    navigate({ to: ROUTES.AUTH.LOGIN });
  };

  return (
    <header className="shadow-sm py-4 px-6 md:px-12 border-b border-gray-100 transition-colors duration-300 bg-white">
      <div className="flex justify-between items-center max-w-7xl mx-auto">

        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate({ to: ROUTES.USER.HOME })}>
          <img src={photoBookLogo} alt="PhotoBook" className="w-10 h-10" />
          <span className="text-xl font-bold text-gray-900">PhotoBook</span>
        </div>


        <nav className="hidden md:flex space-x-6 text-sm font-medium items-center text-gray-600">
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none"
            onClick={() => navigate({ to: ROUTES.USER.HOME })}
            onKeyDown={(e) => e.key === 'Enter' && navigate({ to: ROUTES.USER.HOME })}
          >
            <Home size={16} />
            <span>Home</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none"
            onClick={() => navigate({ to: ROUTES.USER.PHOTOGRAPHER })}
            onKeyDown={(e) => e.key === 'Enter' && navigate({ to: ROUTES.USER.PHOTOGRAPHER })}
          >
            <Camera size={16} />
            <span>Photographers</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none"
            onClick={() => navigate({ to: ROUTES.USER.BOOKING })}
            onKeyDown={(e) => e.key === 'Enter' && navigate({ to: ROUTES.USER.BOOKING })}
          >
            <Calendar size={16} />
            <span>Book Session</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none"
            onClick={() => navigate({ to: ROUTES.USER.RENTAL_MARKETPLACE } as any)}
            onKeyDown={(e) => e.key === 'Enter' && navigate({ to: ROUTES.USER.RENTAL_MARKETPLACE } as any)}
          >
            <ToolCase size={16} />
            <span>Equipment</span>
          </div>


          {role === "photographer" ? (
            <div className="relative">
              <div
                className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors"
                onClick={() => setDashboardMenuOpen(!dashboardMenuOpen)}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </div>
              {dashboardMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 border rounded shadow-lg py-2 z-50 bg-white border-gray-200">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                    onClick={() => {
                      navigate({ to: ROUTES.USER.DASHBOARD as any });
                      setDashboardMenuOpen(false);
                    }}
                  >
                    User Dashboard
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 font-semibold"
                    onClick={() => {
                      navigate({ to: ROUTES.PHOTOGRAPHER.DASHBOARD });
                      setDashboardMenuOpen(false);
                    }}
                  >
                    Photographer Dashboard
                  </button>
                </div>
              )}
            </div>
          ) : role === "user" && (
            <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors" onClick={() => navigate({ to: ROUTES.USER.DASHBOARD as any })}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
          )}
        </nav>

        <div className="flex items-center space-x-4 relative">
          {user && (
            <div
              className="p-2 text-gray-500 hover:text-gray-900 cursor-pointer relative transition-colors"
              onClick={() => navigate({ to: ROUTES.USER.DASHBOARD as any, search: { tab: 'notifications' } as any })}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </div>
          )}

          {!user ? (
            <>
              <button
                onClick={() => navigate({ to: ROUTES.AUTH.LOGIN })}
                className="px-4 py-2 text-sm font-semibold rounded transition duration-200 bg-gray-900 text-white hover:bg-gray-800"
              >
                Login
              </button>
              <button
                onClick={() => navigate({ to: ROUTES.AUTH.SIGNUP })}
                className="px-4 py-2 text-sm font-semibold rounded transition duration-200 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="relative">

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-1 border border-gray-200 px-3 py-1 rounded-full hover:shadow bg-gray-50 text-gray-700"
              >
                <User size={18} />
                <span className="flex item-center text-">{user.name}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 border rounded shadow-lg py-2 z-50 bg-white border-gray-200">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:opacity-80 text-gray-700 hover:bg-gray-50" onClick={() => navigate({ to: ROUTES.USER.PROFILE })}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:opacity-80 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      navigate({ to: ROUTES.USER.DASHBOARD as any });
                      setProfileOpen(false);
                    }}
                  >
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:opacity-80 hover:bg-gray-50"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
