import React, { useState, memo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import photobookLogo from "../../../assets/photoBook-icon.png";

import { useNavigate } from "@tanstack/react-router";
import { useLogin } from "../hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

interface LoginFormData {
  email: string;
  password: string;
}

type ValidationErrors = Partial<Record<keyof LoginFormData, string>>;

const GreenPanel: React.FC = () => (
  <div
    className="flex-1 text-white p-8 flex flex-col justify-between rounded-l-xl md:rounded-t-xl lg:rounded-l-xl lg:rounded-t-none"
    style={{ backgroundColor: "#006039" }}
  >
    <div>
      <h2 className="text-3xl leading-snug mt-8 mb-2">
        Welcome Back to Your
        <br />
        <span className="italic font-bold text-amber-300 font-serif">
          Photography Journey
        </span>
      </h2>
      <p className="text-sm leading-relaxed max-w-xs opacity-90">
        Sign in to continue capturing your perfect moments.
      </p>
    </div>

    {/* Demo credentials display */}
    <div className="mt-8 hidden lg:block">
      <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
        Demo Accounts
      </h3>
      {[
        { title: "Regular User", email: "user@example.com", pass: "user123" },
        { title: "Photographer", email: "photo@example.com", pass: "photo123" },
        { title: "Admin", email: "admin@example.com", pass: "admin123" },
      ].map((user, index) => (
        <div
          key={index}
          className="bg-white/20 p-2 rounded-lg mb-2 border-l-4 border-green-500 transition hover:bg-white/30 shadow-sm"
        >
          <h4 className="font-semibold text-sm mb-1">{user.title}</h4>
          <p className="text-xs leading-tight">Email: {user.email}</p>
          <p className="text-xs leading-tight">Password: {user.pass}</p>
        </div>
      ))}
    </div>
  </div>
);

interface InputFieldProps {
  Icon: React.ElementType;
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = memo(
  ({ Icon, placeholder, name, value, onChange, type, error }) => {
    const borderClass = error
      ? "border-red-500"
      : "border-gray-300 focus-within:border-green-500";
    
    return (
      <div className="w-full">
        <div className={`w-full flex items-center border ${borderClass} rounded-md bg-white transition`}>
          {Icon && (
            <div className="p-2 text-gray-400">
              <Icon size={16} />
            </div>
          )}
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full p-2 text-sm placeholder-gray-500 focus:outline-none bg-transparent"
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

interface FormPanelProps {
  formData: LoginFormData;
  errors: ValidationErrors;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  passwordVisible: boolean;
  setPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  navigate: ReturnType<typeof useNavigate>;
}

const FormPanel: React.FC<FormPanelProps> = ({
  formData,
  errors,
  handleChange,
  handleSubmit,
  passwordVisible,
  setPasswordVisible,
  loading,
  navigate,
}) => (
  <div className="flex-1 bg-white p-6 sm:p-8 rounded-r-xl md:rounded-b-xl lg:rounded-r-xl lg:rounded-b-none">
    <div className="flex items-center mb-4">
      <img
        src={photobookLogo}
        alt="PhotoBook Logo"
        style={{ width: 180, height: 120, marginRight: 20 }}
      />
    </div>


    <div className="flex border-b mb-6 sm:mb-6 text-sm">
      <div className="px-3 py-2 text-green-700 font-semibold border-b-2 border-green-700">
        Login
      </div>
      <div
        className="px-3 py-2 text-gray-500 font-medium cursor-pointer"
        onClick={() => navigate({to:"/auth/signup"})}
      >
        Sign Up
      </div>
    </div>

    <form onSubmit={handleSubmit} className="space-y-3">
      <InputField
        Icon={Mail}
        placeholder="Email Address"
        name="email"
        value={formData.email}
        onChange={handleChange}
        type="email"
        error={errors.email}
      />

      <div className="relative">
        <InputField
          Icon={Lock}
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          type={passwordVisible ? "text" : "password"}
          error={errors.password}
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-gray-400 p-1"
          onClick={() => setPasswordVisible(!passwordVisible)}
        >
          {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 text-white font-semibold py-2.5 rounded-md shadow-md hover:bg-green-800 transition duration-200 mt-4 disabled:opacity-70 text-sm"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

      <div className="text-center pt-2">
        <button
          type="button"
          // onClick={() => navigate("/forgot-password")}
        
          className="text-xs text-green-700 hover:underline font-medium"
        >
          Forgot your password?
        </button>
      </div>
    </form>
  </div>
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (data: LoginFormData): ValidationErrors => {
    const validationErrors: ValidationErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!data.email) {
      validationErrors.email = "Email is required.";
    } else if (!emailRegex.test(data.email)) {
      validationErrors.email = "Invalid email format.";
    }

    if (!data.password) {
      validationErrors.password = "Password is required.";
    }

    return validationErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    loginMutation.mutate(formData, {
      onSuccess: (response) => {
        setUser(response.user);
        toast.success("Login successful! Welcome back.");
        console.log("Login response:", response);
        
   
        
        setFormData({ email: "", password: "" });
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Login failed. Please check your credentials.";
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden">
        <GreenPanel />
        <FormPanel
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          passwordVisible={passwordVisible}
          setPasswordVisible={setPasswordVisible}
          loading={loginMutation.isPending}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default LoginPage;