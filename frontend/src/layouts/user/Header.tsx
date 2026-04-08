import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../modules/auth/store/useAuthStore";
import {
  User,
  LogOut,
  LayoutDashboard,
  Home,
  Camera,
  ToolCase,
  MessageCircle,
  HelpCircle,
  Menu,
  X
} from "lucide-react";
import photoBookLogo from "../../assets/photoBook-icon.png"
import { toast } from "sonner";
import { ROUTES } from "../../constants/routes";
import NotificationDropdown from "../../components/common/NotificationDropdown";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, role } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    toast.success("Logout successfully")
    await logout();
    navigate({ to: ROUTES.AUTH.LOGIN });
  };

  const handleNavClick = (to: string) => {
    navigate({ to });
    setMobileMenuOpen(false);
  };

  return (
    <header className="shadow-sm py-4 px-4 md:px-12 border-b border-gray-100 transition-colors duration-300 bg-white sticky top-0 z-40">
      <div className="flex justify-between items-center max-w-7xl mx-auto">

        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavClick(ROUTES.USER.HOME)}>
          <img src={photoBookLogo} alt="PhotoBook" className="w-10 h-10" />
          <span className="text-lg md:text-xl font-bold text-gray-900">PhotoBook</span>
        </div>

        <nav className="hidden md:flex space-x-6 text-sm font-medium items-center text-gray-600">
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none"
            onClick={() => handleNavClick(ROUTES.USER.HOME)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick(ROUTES.USER.HOME)}
          >
            <Home size={16} />
            <span>Home</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none"
            onClick={() => handleNavClick(ROUTES.USER.PHOTOGRAPHER)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick(ROUTES.USER.PHOTOGRAPHER)}
          >
            <Camera size={16} />
            <span>Photographers</span>
          </div>
          
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none"
            onClick={() => handleNavClick(ROUTES.USER.RENTAL_MARKETPLACE)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick(ROUTES.USER.RENTAL_MARKETPLACE)}
          >
            <ToolCase size={16} />
            <span>Equipment</span>
          </div>
          {user && (
            <div
              role="button"
              tabIndex={0}
              className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none"
              onClick={() => handleNavClick('/chat')}
              onKeyDown={(e) => e.key === 'Enter' && handleNavClick('/chat')}
            >
              <MessageCircle size={16} />
              <span>Messages</span>
            </div>
          )}

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
                      handleNavClick(ROUTES.USER.DASHBOARD);
                      setDashboardMenuOpen(false);
                    }}
                  >
                    User Dashboard
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 font-semibold"
                    onClick={() => {
                      handleNavClick(ROUTES.PHOTOGRAPHER.DASHBOARD);
                      setDashboardMenuOpen(false);
                    }}
                  >
                    Photographer Dashboard
                  </button>
                </div>
              )}
            </div>
          ) : role === "user" && (
            <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors" onClick={() => handleNavClick(ROUTES.USER.DASHBOARD)}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
          )}
          <div
            role="button"
            tabIndex={0}
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors focus:outline-none text-green-600 font-bold"
            onClick={() => handleNavClick(ROUTES.USER.HOW_IT_WORKS)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick(ROUTES.USER.HOW_IT_WORKS)}
          >
            <HelpCircle size={16} />
            <span>Help</span>
          </div>
        </nav>

        {/* Right section: Notifications & Profile */}
        <div className="flex items-center space-x-2 md:space-x-4 relative">
          {user && (
            <NotificationDropdown />
          )}

          {!user ? (
            <>
              <button
                onClick={() => handleNavClick(ROUTES.AUTH.LOGIN)}
                className="hidden sm:block px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded transition duration-200 bg-gray-900 text-white hover:bg-gray-800"
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick(ROUTES.AUTH.SIGNUP)}
                className="hidden sm:block px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded transition duration-200 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="relative">

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-1 border border-gray-200 px-2 md:px-3 py-1 rounded-full hover:shadow bg-gray-50 text-gray-700"
              >
                <User size={16} />
                <span className="hidden sm:flex text-xs md:text-sm">{user.name}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 border rounded shadow-lg py-2 z-50 bg-white border-gray-200">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:opacity-80 text-gray-700 hover:bg-gray-50" onClick={() => {
                      handleNavClick(ROUTES.USER.PROFILE);
                      setProfileOpen(false);
                    }}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:opacity-80 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      handleNavClick(ROUTES.USER.DASHBOARD);
                      setProfileOpen(false);
                    }}
                  >
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:opacity-80 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      handleNavClick('/chat');
                      setProfileOpen(false);
                    }}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Messages
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:opacity-80 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      handleNavClick(ROUTES.USER.HOW_IT_WORKS);
                      setProfileOpen(false);
                    }}
                  >
                    <HelpCircle size={16} className="mr-2" />
                    How It Works
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-gray-600">
            <button
              onClick={() => handleNavClick(ROUTES.USER.HOME)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded w-full text-left"
            >
              <Home size={18} />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleNavClick(ROUTES.USER.PHOTOGRAPHER)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded w-full text-left"
            >
              <Camera size={18} />
              <span>Photographers</span>
            </button>
            <button
              onClick={() => handleNavClick(ROUTES.USER.RENTAL_MARKETPLACE)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded w-full text-left"
            >
              <ToolCase size={18} />
              <span>Equipment</span>
            </button>
            {user && (
              <button
                onClick={() => handleNavClick('/chat')}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded w-full text-left"
              >
                <MessageCircle size={18} />
                <span>Messages</span>
              </button>
            )}
            {(role === "user" || role === "photographer") && (
              <button
                onClick={() => handleNavClick(ROUTES.USER.DASHBOARD)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded w-full text-left"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            )}
            <button
              onClick={() => handleNavClick(ROUTES.USER.HOW_IT_WORKS)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded w-full text-left text-green-600 font-bold"
            >
              <HelpCircle size={18} />
              <span>Help</span>
            </button>
            {!user && (
              <div className="flex space-x-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleNavClick(ROUTES.AUTH.LOGIN)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded transition bg-gray-900 text-white hover:bg-gray-800"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick(ROUTES.AUTH.SIGNUP)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded transition border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
