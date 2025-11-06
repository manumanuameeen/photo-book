import React, { useState } from "react";
import { useVerifyOtp } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function OtpVerificationPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const verify = useVerifyOtp();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    verify.mutate({ email, otp }, {
      onSuccess: () => navigate("/"),
    });
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Verify OTP</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        <button type="submit" disabled={verify.isLoading}>Verify</button>
      </form>
      {verify.isError && <div style={{color:'red'}}>{(verify.error as any)?.response?.data?.message || 'Invalid OTP'}</div>}
    </div>
  );
}
