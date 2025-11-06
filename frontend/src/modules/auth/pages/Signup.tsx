import React, { useState } from "react";
import { useSignup } from "../hooks/useAuth";
import type { ApiError } from "../../../types/apiError";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const mutation = useSignup();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const error = mutation.error as ApiError | null;

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Signup</h2>
      <form onSubmit={onSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <button type="submit" disabled={mutation.isLoading}>Sign up</button>
      </form>

      {mutation.isError && (
        <div style={{ color: "red" }}>
          {error?.response?.data?.message || error?.message || "Signup failed"}
        </div>
      )}
      {mutation.isSuccess && <div style={{ color: "green" }}>OTP sent successfully</div>}
    </div>
  );
}
