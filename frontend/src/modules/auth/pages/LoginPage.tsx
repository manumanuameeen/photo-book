import { useState } from "react";
import { authService } from "../services/authService";
import { useAuthStore } from "../../../store/useAuthStore";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authService.login(form);
    setUser(res.user);
    console.log("Login success:", res);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Login</button>
    </form>
  );
}
