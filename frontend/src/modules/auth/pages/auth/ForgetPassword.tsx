
import React, { useState } from 'react';
import { Mail } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useForgetPassword } from "../../hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";
import photobookLogo from "../../../../assets/photoBook-icon.png";
// import type { ApiError } from '../../types/apiError';
import { getErrorMessage } from '../../../../utils/errorhandler';
import { ROUTES } from '../../../../constants/routes';

const Colors = {
  darkGreen: "#2e4a2d",
  gold: "#f7b731",
};

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const forgetPasswordMutation = useForgetPassword();
  const [email, setEmail] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format.');
      return;
    }

    // console.log("Submitting forget password for:", email.trim().toLowerCase());

    forgetPasswordMutation.mutate(
      { email: email.trim().toLowerCase() }, 
      {
        onSuccess: (response) => {
        //   console.log("✅ Forget password success:", response);
          toast.success(response.message || "Reset code sent to your email!");
          
          const normalizedEmail = email.trim().toLowerCase();
          sessionStorage.setItem('resetPasswordEmail', normalizedEmail);
          console.log("📧 Stored email in sessionStorage:", normalizedEmail);
          
          setTimeout(() => {
            console.log("🔄 Navigating to /auth/reset-otp");
            navigate({ to: "/auth/reset-otp" });
          }, 1000);
        },
        onError: (error: unknown) => {
          console.error(" Forget password error:", error);
          const errorMessage = getErrorMessage(error)
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden">
        
        {/* Green Panel */}
        <div
          className="flex-1 text-white p-8 flex flex-col justify-between rounded-l-xl md:rounded-t-xl lg:rounded-l-xl lg:rounded-t-none"
          style={{ backgroundColor: Colors.darkGreen }}
        >
          <div>
            <h2 className="text-3xl leading-snug mt-8 mb-2">
              Forgot Your
              <br />
              <span className="italic font-bold text-amber-300 font-serif">
                Password?
              </span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs opacity-90">
              Don't worry! Enter your email and we'll send you a code to reset your password.
            </p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-r-xl md:rounded-b-xl lg:rounded-r-xl lg:rounded-b-none">
          <div className="flex items-center mb-4">
            <img
              src={photobookLogo}
              alt="PhotoBook Logo"
              style={{ width: 180, height: 120, marginRight: 20 }}
            />
          </div>

          <div className="flex border-b mb-6 text-sm">
            <div className="px-3 py-2 text-green-700 font-semibold border-b-2 border-green-700">
              Forgot Password
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="w-full flex items-center border border-gray-300 focus-within:border-green-500 rounded-md bg-white transition">
                <div className="p-2 text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full p-2 text-sm placeholder-gray-500 focus:outline-none bg-transparent"
                  disabled={forgetPasswordMutation.isPending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgetPasswordMutation.isPending}
              className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {forgetPasswordMutation.isPending ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate({ to: ROUTES.AUTH.LOGIN})}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition duration-150"
            >
              &larr; Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;