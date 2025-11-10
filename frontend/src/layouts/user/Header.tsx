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
  ToolCase
} from "lucide-react";
import photoBookLogo  from "../../assets/photoBook-icon.png"

const Colors = {
  darkGreen: "#2e4a2d",
  lightGreen: "#5c8c5c",
  gold: "#f7b731",
  bgCream: "#e5efe1",
  white: "#ffffff",
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/auth/login" });
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 md:px-12 border-b border-gray-100">
      <div className="flex justify-between items-center max-w-7xl mx-auto">

        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate({ to: "/main/home" })}>
          <img src={photoBookLogo} alt="PhotoBook" className="w-10 h-10" />
          <span className="text-xl font-bold" style={{ color: Colors.darkGreen }}>PhotoBook</span>
        </div>

     
        <nav className="hidden md:flex space-x-6 text-sm font-medium items-center">
          <div className="flex items-center space-x-1 cursor-pointer" onClick={() => navigate({ to: "/main/home" })}>
            <Home size={16} />
            <span>Home</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer">
            <Camera size={16} />
            <span>Photographers</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer">
            <Calendar size={16} />
            <span>Book Session</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer">
            <ToolCase size={16} />
            <span>Equipment</span>
          </div>

         
          {user && (
            <div className="flex items-center space-x-1 cursor-pointer" 
            // onClick={() => navigate({ to: "/dashboard" })}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
          )}
        </nav>

        <div className="flex items-center space-x-4 relative">
          {!user ? (
            <>
              <button
                onClick={() => navigate({ to: "/auth/login" })}
                className="px-4 py-2 text-sm font-semibold rounded transition duration-200"
                style={{ backgroundColor: Colors.darkGreen, color: Colors.white }}
              >
                Login
              </button>
              <button
                onClick={() => navigate({ to: "/auth/signup" })}
                className="px-4 py-2 text-sm font-semibold rounded transition duration-200"
                style={{ backgroundColor: Colors.gold, color: Colors.darkGreen }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="relative">
            
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-1 border border-gray-200 px-3 py-1 rounded-full hover:shadow"
              style={{backgroundColor:Colors.bgCream,color:Colors.darkGreen}}

              >
                <User size={18} />
                <span className="flex item-center text-">{user.name}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg py-2 z-50">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                    // onClick={() => navigate({ to: "/profile" })}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                    // onClick={() => navigate({ to: "/h" })}
                  >
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
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
