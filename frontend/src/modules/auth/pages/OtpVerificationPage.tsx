import { useState } from "react";
import { authService } from "../services/authService";
export default function OtpVerificationPage() {
  const [form, setForm] = useState({ email: "", otp: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authService.verifyOtp(form);
    console.log("OTP verified:", res);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="OTP" onChange={(e) => setForm({ ...form, otp: e.target.value })} />
      <button type="submit">Verify</button>
    </form>
  );
}
