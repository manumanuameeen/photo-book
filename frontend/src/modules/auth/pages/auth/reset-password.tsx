import React, { useState, } from 'react';
import { Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useResetPassword } from "../../hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";
import photobookLogo from "../../../../assets/photoBook-icon.png";
import { ROUTES } from '../../../../constants/routes';

const Colors = {
  darkGreen: "#2e4a2d",
};


interface ResetPasswordError {
  response?: {
    data?: {
      message?: string
    };
  };
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const getEmail = (): string => {
    return sessionStorage.getItem('resetPasswordEmail') || "";
  };

  const email = getEmail();

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors.");
      return;
    }

    resetPasswordMutation.mutate(
      {
        email,
        newPassword: password,
        confirmPassword,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Password reset successful!");

          sessionStorage.removeItem('resetPasswordEmail');
          navigate({ to:  ROUTES.AUTH.LOGIN });

        },
        onError: (error: unknown) => {
          const typedError = error as ResetPasswordError
          const errorMessage = typedError.response?.data?.message || "Failed to reset password. Please try again.";
          toast.error(errorMessage);
          console.error("Reset password error:", error);
        },
      }
    );
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting...</p>
        </div>
      </div>
    );
  }

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
              Reset Your
              <br />
              <span className="italic font-bold text-amber-300 font-serif">
                Password
              </span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs opacity-90">
              Enter your new password below.
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
              Reset Password
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className={`w-full flex items-center border ${errors.password ? 'border-red-500' : 'border-gray-300 focus-within:border-green-500'} rounded-md bg-white transition`}>
                  <div className="p-2 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Enter new password"
                    className="w-full p-2 text-sm placeholder-gray-500 focus:outline-none bg-transparent"
                    disabled={resetPasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className={`w-full flex items-center border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus-within:border-green-500'} rounded-md bg-white transition`}>
                  <div className="p-2 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={confirmPasswordVisible ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                    placeholder="Confirm new password"
                    className="w-full p-2 text-sm placeholder-gray-500 focus:outline-none bg-transparent"
                    disabled={resetPasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    {/* {confirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />} */}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending || !password || !confirmPassword}
              className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate({ to: ROUTES.AUTH.LOGIN })}
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

export default ResetPassword;