import React, { useState, useRef, useEffect } from "react";
import { Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import photobookLogo from "../../../../assets/photoBook-icon.png";

import { useNavigate } from '@tanstack/react-router'
import { useVerifyOtp, useResendOtp } from "../../hooks/useAuth";

const OTP_LENGTH = 6;
const OTP_TIMER_DURATION = 120;

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearUser } = useAuthStore();
  
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  const [isVerifying, setIsVerifying] = useState(false);
  
  const getEmail = (): string => {
    const sessionEmail = sessionStorage.getItem('pendingVerificationEmail');
    if (sessionEmail) return sessionEmail;
    if (user?.email) return user.email;
    return "";
  };

  const email = getEmail();

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState<number>(OTP_TIMER_DURATION);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const fullOtp = otp.join("");
  const fullOtpEntered = fullOtp.length === OTP_LENGTH;

  useEffect(() => {
    if (isVerifying) return; 
    
    if (!email) {
      toast.error("No email found. Please sign up first.");
      const timeoutId = setTimeout(() => {
        navigate({ to: "/auth/signup" });
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
      toast.error("Email is missing. Please sign up again.");
      navigate({ to: "/auth/signup" });
      return;
    }

  
    setIsVerifying(true);

    verifyOtpMutation.mutate(
      { email, otp: fullOtp },
      {
        onSuccess: (response) => {
          toast.success("OTP verified successfully!");
          console.log("Verify OTP response:", response);
          
       
          sessionStorage.removeItem('pendingVerificationEmail');
          clearUser();
          
         
          navigate({ to: "/auth/login" });
        },
        onError: (error: any) => {
        
          setIsVerifying(false);
          
          const errorMessage =
            error.response?.data?.message || "OTP verification failed";
          toast.error(errorMessage);
          console.error("OTP verification error:", error);
        },
      }
    );
  };

  const handleResend = async () => {
    if (timer > 0) return;

    if (!email) {
      toast.error("Email is missing. Please sign up again.");
      navigate({ to: "/auth/signup" });
      return;
    }

    resendOtpMutation.mutate(email, {
      onSuccess: (response) => {
        toast.success(response.message || "OTP resent successfully!");
        setOtp(new Array(OTP_LENGTH).fill(""));
        setTimer(OTP_TIMER_DURATION);
        inputRefs.current[0]?.focus();
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Failed to resend OTP";
        toast.error(errorMessage);
      },
    });
  };

  const isLoading = verifyOtpMutation.isPending || resendOtpMutation.isPending;

  if (!email && !isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-3">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden">
        
        <div
          className="flex-1 text-white p-8 flex flex-col justify-between rounded-l-xl md:rounded-t-xl lg:rounded-l-xl lg:rounded-t-none"
          style={{ backgroundColor: "#006039" }}
        >
          <div>
            <h2 className="text-3xl leading-snug mt-8 mb-2">
              Verify Your
              <br />
              <span className="italic font-bold text-amber-300 font-serif">
                Email OTP
              </span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs opacity-90">
              Enter the 6-digit OTP sent to your email to continue.
            </p>
          </div>
        </div>
        
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
              Verify OTP
            </div>
          </div>

          <p className="text-gray-600 mb-6 flex items-center">
            <Mail size={18} className="mr-1" />
            OTP sent to <span className="font-medium ml-1">{email}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={fullOtp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
                  const newOtp = value.split("");
                  while (newOtp.length < OTP_LENGTH) {
                    newOtp.push("");
                  }
                  setOtp(newOtp);
                }}
                placeholder="Enter 6-digit OTP"
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
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            {timer > 0 ? (
              <p>
                Resend OTP in <span className="font-semibold">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-emerald-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
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