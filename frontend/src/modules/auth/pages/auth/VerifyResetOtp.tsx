import React, { useState, useEffect } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import photobookLogo from "../../../../assets/photoBook-icon.png";
import { useNavigate } from '@tanstack/react-router';
import { useVerifyResetOtp, useForgetPassword } from "../../hooks/useAuth";
import { ROUTES } from "../../../../constants/routes";

const OTP_LENGTH = 6;
const OTP_TIMER_DURATION = 30;

const VerifyResetOtp: React.FC = () => {
  const navigate = useNavigate();
  const verifyResetOtpMutation = useVerifyResetOtp();
  const resendOtpMutation = useForgetPassword();

  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const [timer, setTimer] = useState<number>(OTP_TIMER_DURATION);
  
  const email = sessionStorage.getItem('resetPasswordEmail') || "";

  const fullOtpEntered = otp.length === OTP_LENGTH;

  useEffect(() => {
    if (!email && !isVerifying) {
      toast.error("No active reset session found.", { id: "no-reset-session" });
      const timeoutId = setTimeout(() => {
        navigate({ to: ROUTES.AUTH.FORGOT_PASSWORD });
      }, 2000);
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
      toast.error("Please enter the complete 6-digit code.", { id: "otp-incomplete" });
      return;
    }

    setIsVerifying(true);

    verifyResetOtpMutation.mutate(
      { email, otp },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Code verified! Now set your new password.", { id: "verify-success" });
          navigate({ to: ROUTES.AUTH.RESET_PASSWORD });
        },
        onError: () => {
          setIsVerifying(false);
          // apiClient handles the error toast
        },
      }
    );
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: (response) => {
          toast.success(response.message || "New code sent to your email.", { id: "resend-success" });
          setOtp("");
          setTimer(OTP_TIMER_DURATION);
        },
        onError: () => {
          // apiClient handles this
        },
      }
    );
  };

  if (!email && !isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 animate-pulse">Redirecting to forgot password...</p>
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
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden min-h-[500px]">
        <div 
          className="flex-1 text-white p-8 flex flex-col justify-between rounded-l-xl md:rounded-t-xl lg:rounded-l-xl lg:rounded-t-none relative overflow-hidden" 
          style={{ backgroundColor: "#006039" }}
        >
          <div className="relative z-10">
            <button 
              onClick={() => navigate({ to: ROUTES.AUTH.FORGOT_PASSWORD })}
              className="flex items-center text-white/80 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft size={18} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Change Email
            </button>
            <h2 className="text-3xl leading-snug mb-2 font-light">
              Verify Your<br />
              <span className="italic font-bold text-amber-300 font-serif">Reset Code</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs opacity-90">
              Enter the security code we sent to your email to verify your identity.
            </p>
          </div>
          <div className="relative z-10 opacity-30">
            <Lock size={120} strokeWidth={1} />
          </div>
        </div>

        <div className="flex-1 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center mb-8">
            <img src={photobookLogo} alt="PhotoBook Logo" className="h-12" />
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-500 text-sm">
              We've sent a code to <span className="text-gray-900 font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
                  setOtp(value);
                }}
                placeholder="6-digit code"
                maxLength={OTP_LENGTH}
                className="w-full h-14 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none text-2xl text-center tracking-[0.5em] font-mono transition-colors"
                disabled={isVerifying || verifyResetOtpMutation.isPending}
                inputMode="numeric"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || verifyResetOtpMutation.isPending || !fullOtpEntered}
              className="w-full bg-green-700 text-white py-3.5 rounded-xl font-semibold hover:bg-green-800 transition shadow-lg shadow-green-900/20 disabled:bg-gray-300 disabled:shadow-none"
            >
              {isVerifying || verifyResetOtpMutation.isPending ? "Verifying..." : "Verify Identity"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Code still didn't arrive?</p>
            {timer > 0 ? (
              <p className="text-gray-400 text-xs">
                Resend available in <span className="font-semibold text-gray-600">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className="text-green-700 font-semibold text-sm hover:underline hover:text-green-800 transition-colors"
              >
                {resendOtpMutation.isPending ? "Sending code..." : "Resend Security Code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtp;