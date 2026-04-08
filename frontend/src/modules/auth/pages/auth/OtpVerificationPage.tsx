import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/useAuthStore";
import photobookLogo from "../../../../assets/photoBook-icon.png";
import { useNavigate } from '@tanstack/react-router'
import { useVerifyOtp, useResendOtp } from "../../hooks/useAuth";
import { ROUTES } from "../../../../constants/routes";

const OTP_LENGTH = 6;
const OTP_TIMER_DURATION = 30;

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const { clearUser } = useAuthStore();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState<number>(OTP_TIMER_DURATION);
  
  // Use session storage as the source of truth for the pending email
  const [email] = useState<string | null>(sessionStorage.getItem("pendingVerificationEmail"));

  const fullOtp = otp.join("");
  const fullOtpEntered = fullOtp.length === OTP_LENGTH;

  useEffect(() => {
    if (!email) {
      toast.error("No pending verification found. Please sign up again.", { id: "no-email" });
      const timeoutId = setTimeout(() => {
        navigate({ to: ROUTES.AUTH.SIGNUP });
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
    console.log("📧 [OTP Page] Session email found:", email);
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullOtpEntered) {
      toast.error("Please enter a complete 6-digit OTP.", { id: "otp-incomplete" });
      return;
    }

    if (!email) {
      toast.error("Session expired. Please sign up again.", { id: "email-missing" });
      navigate({ to: ROUTES.AUTH.SIGNUP });
      return;
    }

    setIsVerifying(true);
    console.log("🔐 [OTP Verification] Submitting OTP:", { email, otp: fullOtp });

    verifyOtpMutation.mutate(
      { email, otp: fullOtp },
      {
        onSuccess: () => {
          console.log("✅ [OTP Verification] OTP verified successfully!");
          toast.success("Account verified successfully! You can now login.", { id: "verify-success" });
          sessionStorage.removeItem("pendingVerificationEmail");
          clearUser(); // Ensure no partial state remains
          setTimeout(() => {
            navigate({ to: ROUTES.AUTH.LOGIN });
          }, 1500);
        },
        onError: (error) => {
          console.error("❌ [OTP Verification] Verification failed:", error);
          setIsVerifying(false);
          // apiClient handles the error toast
        },
      }
    );
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;

    console.log("📧 [OTP Resend] Resending OTP to:", email);
    resendOtpMutation.mutate(email, {
      onSuccess: (response) => {
        console.log("✅ [OTP Resend] OTP resent successfully!", response);
        toast.success(response.message || "OTP resent successfully!", { id: "resend-success" });
        setOtp(new Array(OTP_LENGTH).fill(""));
        setTimer(OTP_TIMER_DURATION);
      },
      onError: (error) => {
        console.error("❌ [OTP Resend] Failed to resend OTP:", error);
        // apiClient handles the error toast
      },
    });
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 animate-pulse">Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-3">
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden min-h-[500px]">
        <div
          className="flex-1 text-white p-8 flex flex-col justify-between rounded-l-xl md:rounded-t-xl lg:rounded-l-xl lg:rounded-t-none relative overflow-hidden"
          style={{ backgroundColor: "#006039" }}
        >
          <div className="relative z-10">
            <button 
              onClick={() => navigate({ to: ROUTES.AUTH.SIGNUP })}
              className="flex items-center text-white/80 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft size={18} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to Signup
            </button>
            <h2 className="text-3xl leading-snug mb-2 font-light">
              Verify Your<br />
              <span className="italic font-bold text-amber-300 font-serif">Email OTP</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs opacity-90">
              We've sent a secure code to your inbox. Enter it below to unlock your account.
            </p>
          </div>
          <div className="relative z-10 opacity-30">
            <Mail size={120} strokeWidth={1} />
          </div>
        </div>

        <div className="flex-1 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center mb-8">
            <img src={photobookLogo} alt="Logo" className="h-12" />
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-500 text-sm">
              We've sent a code to <span className="text-gray-900 font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between mb-4 gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      const newOtp = [...otp];
                      newOtp[idx] = val.slice(-1);
                      setOtp(newOtp);
                      const fullCode = newOtp.join("");
                      console.log(`🔢 [OTP Input] Digit ${idx + 1} entered. Current OTP: ${fullCode.padEnd(OTP_LENGTH, '_')}`);
                      if (val && idx < OTP_LENGTH - 1) {
                        (e.target.nextElementSibling as HTMLInputElement)?.focus();
                      }
                      if (fullCode.length === OTP_LENGTH) {
                        console.log("✨ [OTP Input] Full 6-digit OTP entered and ready for submission");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                        (e.currentTarget.previousElementSibling as HTMLInputElement)?.focus();
                      }
                    }}
                    className="w-full h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || verifyOtpMutation.isPending || !fullOtpEntered}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition shadow-lg shadow-green-900/20 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isVerifying || verifyOtpMutation.isPending ? "Verifying..." : "Confirm Code"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Didn't receive the code?</p>
            {timer > 0 ? (
              <p className="text-gray-400 text-xs">
                You can resend in <span className="font-semibold text-gray-600">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className="text-green-700 font-semibold text-sm hover:underline hover:text-green-800 transition-colors"
              >
                {resendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;