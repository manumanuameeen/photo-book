import React, { useState, useRef, useEffect } from "react";
import { Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import photobookLogo from "../../../assets/photoBook-icon.png";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import type { IAuthResponse } from "../types/user.types";

const OTP_LENGTH = 6;
const OTP_TIMER_DURATION = 120;

const VerifyOtp: React.FC = () => {
  const { user } = useAuthStore();
  const email = user?.email ?? "";
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState<number>(OTP_TIMER_DURATION);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fullOtp = otp.join("");
  const fullOtpEntered = fullOtp.length === OTP_LENGTH;

  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullOtpEntered || !email) {
      toast.error("Please enter a 6-digit OTP and make sure your email is present.");
      return;
    }
    try {

      setLoading(true);
      const response:IAuthResponse = await authService.verifyOtp({email,otp:fullOtp})
        toast.success( "OTP resent successfully!");
        console.log(response)
      navigate("/login")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "OTP verification failed");

    } finally {
      setLoading(false)
    }

  };

  const handleResend = async () => {
    if (timer === 0 && email) {
      try {
        setLoading(true);
        const response = await authService.resendOtp(email);
        toast.success(response.message || "OTP resent successfully!");
        setOtp(new Array(OTP_LENGTH).fill(""))
        setTimer(OTP_TIMER_DURATION);
        inputRefs.current[0]?.focus();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed tp resend OTP");
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-3">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Left Green Panel */}
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
            <div className="flex justify-between mb-8">
              {otp.map((value, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={value}
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-10 h-12 sm:w-12 sm:h-12 text-center text-lg border-2 rounded-lg focus:border-emerald-500 outline-none transition"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:bg-gray-400"
            >
              {loading ? "Processing..." : "Verify OTP"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            {timer > 0 ? (
              <p>Resend OTP in {timer}s</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={loading || timer > 0}
                className="text-emerald-600 font-medium hover:underline"
              >
                {loading ? "Processing..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
