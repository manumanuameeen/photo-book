import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useResetPassword } from "../../hooks/useAuth";
import { toast } from "sonner";
import photobookLogo from "../../../../assets/photoBook-icon.png";
import { ROUTES } from '../../../../constants/routes';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const email = sessionStorage.getItem('resetPasswordEmail') || "";

  useEffect(() => {
    if (!email) {
      toast.error("No active reset session found.", { id: "no-reset-session" });
      const timeoutId = setTimeout(() => {
        navigate({ to: ROUTES.AUTH.FORGOT_PASSWORD });
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", { id: "pass-mismatch" });
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.", { id: "pass-too-short" });
      return;
    }

    resetPasswordMutation.mutate(
      { email, newPassword: password, confirmPassword },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Password reset successfully! Please login.", { id: "reset-success" });
          sessionStorage.removeItem('resetPasswordEmail');
          setTimeout(() => {
            navigate({ to: ROUTES.AUTH.LOGIN });
          }, 2000);
        },
        onError: () => {
          
        },
      }
    );
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 animate-pulse">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3">
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden min-h-[500px]">
        <div
          className="flex-1 text-white p-8 flex flex-col justify-between rounded-l-xl md:rounded-t-xl lg:rounded-l-xl lg:rounded-t-none relative overflow-hidden"
          style={{ backgroundColor: "#006039" }}
        >
          <div className="relative z-10">
            <button 
              onClick={() => navigate({ to: ROUTES.AUTH.LOGIN })}
              className="flex items-center text-white/80 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft size={18} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Abandon Reset
            </button>
            <h2 className="text-3xl leading-snug mb-2 font-light">
              Secure Your<br />
              <span className="italic font-bold text-amber-300 font-serif">New Password</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs opacity-90">
              Create a strong, unique password to keep your photography journey safe.
            </p>
          </div>
          <div className="relative z-10 opacity-30">
            <Lock size={120} strokeWidth={1} />
          </div>
        </div>

        <div className="flex-1 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center mb-8">
            <img src={photobookLogo} alt="Logo" className="h-12" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-colors pr-10"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-colors pr-10"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {confirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full bg-green-700 text-white py-3.5 rounded-xl font-bold hover:bg-green-800 transition shadow-lg shadow-green-900/20 disabled:bg-gray-300 disabled:shadow-none"
            >
              {resetPasswordMutation.isPending ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;