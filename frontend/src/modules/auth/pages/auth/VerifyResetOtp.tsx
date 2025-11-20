import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import photobookLogo from "../../../../assets/photoBook-icon.png";
import { useNavigate } from '@tanstack/react-router';
import { useVerifyResetOtp, useForgetPassword } from "../../hooks/useAuth";
import { ROUTES } from "../../../../constants/routes";

const OTP_LENGTH = 6;
const OTP_TIMER_DURATION = 30;


interface ResetOtpError {
  response?: {
    data?: {
      message?: string
    };
  };

}

interface ResendOtpError {
  response?: {
    data: {
      message?: string
    };
  };
}


const VerifyResetOtp: React.FC = () => {
  const navigate = useNavigate();
  const verifyResetOtpMutation = useVerifyResetOtp();
  const resendOtpMutation = useForgetPassword();

  const [isVerifying, setIsVerifying] = useState(false);

  const getEmail = (): string => {
    const sessionEmail = sessionStorage.getItem('resetPasswordEmail');
    if (sessionEmail) return sessionEmail;
    return "";
  };

  const email = getEmail();
  const [otp, setOtp] = useState<string>("");
  const [timer, setTimer] = useState<number>(OTP_TIMER_DURATION);

  const fullOtpEntered = otp.length === OTP_LENGTH;

  useEffect(() => {
    if (isVerifying) return;

    if (!email) {
      toast.error("No email found. Please start the password reset process.");
      const timeoutId = setTimeout(() => {
        navigate({ to: ROUTES.AUTH.RESET_PASSWORD });
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [email, navigate, isVerifying]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullOtpEntered) {
      toast.error("Please enter a complete 6-digit OTP.");
      return;
    }

    if (!email) {
      toast.error("Email is missing. Please start over.");
      navigate({ to: ROUTES.AUTH.RESET_PASSWORD });
      return;
    }

    setIsVerifying(true);

    verifyResetOtpMutation.mutate(
      { email, otp },
      {
        onSuccess: (response) => {
          toast.success(response.message || "OTP verified! Set your new password.");

          // Navigate to reset password page
          navigate({ to: ROUTES.AUTH.RESET_PASSWORD });
        },
        onError: (error: unknown) => {
          console.log("Reset OTP error")
          const typedError = error as ResetOtpError
          const errorMessage = typedError.response?.data?.message || "Reset Otp failed"
          setIsVerifying(false);
          toast.error(errorMessage);
          console.error("OTP verification error:", error);
        },
      }
    );
  };

  const handleResend = async () => {
    if (timer > 0) return;

    if (!email) {
      toast.error("Email is missing. Please start over.");
      navigate({ to: ROUTES.AUTH.RESET_PASSWORD });
      return;
    }

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: (response) => {
          toast.success(response.message || "OTP resent successfully!");
          setOtp("");
          setTimer(OTP_TIMER_DURATION);
        },
        onError: (error: unknown) => {
          const typedError = error as ResendOtpError
          const errorMessage = typedError.response?.data?.message || "Failed to resend OTP";
          toast.error(errorMessage);
        },
      }
    );
  };

  const isLoading = verifyResetOtpMutation.isPending || resendOtpMutation.isPending;

  if (!email && !isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-3">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden">

        <div className="flex-1 text-white p-8 flex flex-col justify-between rounded-l-xl md:rounded-t-xl lg:rounded-l-xl lg:rounded-t-none" style={{ backgroundColor: "#006039" }}>
          <div>
            <h2 className="text-3xl leading-snug mt-8 mb-2">
              Verify Your
              <br />
              <span className="italic font-bold text-amber-300 font-serif">Reset Code</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs opacity-90">
              Enter the 6-digit code sent to your email.
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white p-6 sm:p-8 rounded-r-xl md:rounded-b-xl lg:rounded-r-xl lg:rounded-b-none">
          <div className="flex items-center mb-4">
            <img src={photobookLogo} alt="PhotoBook Logo" style={{ width: 180, height: 120, marginRight: 20 }} />
          </div>

          <div className="flex border-b mb-6 text-sm">
            <div className="px-3 py-2 text-green-700 font-semibold border-b-2 border-green-700">
              Verify Code
            </div>
          </div>

          <p className="text-gray-600 mb-6 flex items-center">
            <Mail size={18} className="mr-1" />
            Code sent to <span className="font-medium ml-1">{email}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Reset Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
                  setOtp(value);
                }}
                placeholder="Enter 6-digit code"
                maxLength={OTP_LENGTH}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg text-center tracking-widest"
                disabled={isLoading}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !fullOtpEntered}
              className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {verifyResetOtpMutation.isPending ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            {timer > 0 ? (
              <p>
                Resend code in <span className="font-semibold">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-emerald-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendOtpMutation.isPending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate({ to: ROUTES.AUTH.FORGOT_PASSWORD })}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition duration-150"
            >
              &larr; Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtp;