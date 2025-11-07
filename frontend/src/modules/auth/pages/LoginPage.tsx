import React, { useState, memo } from "react";
// Removed external service and type imports for a self-contained file
import { Eye, EyeOff, Mail, Lock, BookOpen } from "lucide-react";

// --- Type Definitions for internal use ---
interface LoginFormData {
  email: string;
  password: string;
}
type ValidationErrors<T> = Partial<Record<keyof T, string>>;

// --- Mock Service Functions ---
// Replaced external authService calls with simple console logs
const mockLogin = (data: LoginFormData) => {
    console.log("Mock Login API Call:", data);
    // Mock successful login only for specific credentials
    if (data.email === "user@test.com" && data.password === "password123") {
        return new Promise(resolve => setTimeout(() => resolve({ token: "fake-jwt" }), 800));
    } else {
        // Mock failure for all other cases
        return new Promise((_, reject) => setTimeout(() => reject(new Error("Invalid credentials or user not found")), 800));
    }
};
// --- End Mock Service Functions ---


// 1. Green Panel (Logo and Info)
const GreenPanel: React.FC = () => (
  <div
    className="flex-1 text-white p-8 flex flex-col justify-between rounded-l-xl md:rounded-l-none md:rounded-t-xl lg:rounded-l-xl lg:rounded-t-none"
    style={{ backgroundColor: "#006039" }}
  >
    {/* Logo Area - Using Lucide icon instead of external image */}
    <div className="flex items-center text-3xl font-bold pt-4">
        <BookOpen size={36} className="mr-2 text-amber-300" /> PhotoBook
    </div>
    
    <div>
      <h2 className="text-3xl leading-snug mt-8 mb-2">
        Welcome to Your
        <br />
        <span className="italic font-bold text-amber-300 font-serif">
          Photography Journey
        </span>
      </h2>
      <p className="text-sm leading-relaxed max-w-xs opacity-90">
        Connect with photographers and capture your perfect moments.
      </p>
    </div>
    <div className="mt-8 hidden lg:block">
      <h3 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
        Latest Logins
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

// 2. Dedicated Login Form Panel
interface LoginFormPanelProps {
  formData: LoginFormData;
  errors: ValidationErrors<LoginFormData>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  message: string;
  passwordVisible: boolean;
  setPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginFormPanel: React.FC<LoginFormPanelProps> = ({
  formData,
  errors,
  handleChange,
  handleSubmit,
  loading,
  message,
  passwordVisible,
  setPasswordVisible,
}) => (
  <div className="flex-1 bg-white p-6 sm:p-8 rounded-r-xl md:rounded-b-xl lg:rounded-r-xl lg:rounded-b-none">
    {/* Tabs (Simplified to show only Login is active) */}
    <div className="flex border-b mb-6 sm:mb-6 text-sm">
      <div className="px-3 py-2 text-green-700 font-semibold border-b-2 border-green-700">
        Login
      </div>
      <div className="px-3 py-2 text-gray-500 font-medium">
        Sign Up
      </div>
    </div>
    
    {/* Message Display */}
    {message && (
      <p
        className={`text-center font-medium mb-4 text-sm p-2 rounded ${
          message.toLowerCase().includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}
      >
        {message}
      </p>
    )}
    
    {/* Login Form */}
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <label htmlFor="email" className="text-xs text-gray-500 font-medium block pt-1">Email Address</label>
      <InputField
        Icon={Mail}
        placeholder="Enter your email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        type="email"
        error={errors.email}
        id="email"
      />
      
      {/* Password Field */}
      <label htmlFor="password" className="text-xs text-gray-500 font-medium block pt-1">Password</label>
      <div className="relative">
        <InputField
          Icon={Lock}
          placeholder="Enter your password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          type={passwordVisible ? "text" : "password"}
          error={errors.password}
          id="password"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 p-1"
          onClick={() => setPasswordVisible(!passwordVisible)}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
        >
          {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      
      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 text-white font-semibold py-2.5 rounded-md shadow-md hover:bg-green-800 transition duration-200 mt-5 disabled:opacity-70 text-sm"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
      
      {/* Forgot Password Link */}
      <div className="text-center pt-2">
          <a href="#" className="text-xs text-green-700 hover:underline font-medium">
              Forgot your password?
          </a>
      </div>
    </form>
  </div>
);

// 3. InputField Component
interface InputFieldProps {
  Icon: React.ElementType;
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  error?: string;
  id?: string;
}

const InputField: React.FC<InputFieldProps> = memo(({ Icon, placeholder, name, value, onChange, type, error, id }) => {
  const borderClass = error ? "border-red-500" : "border-gray-300 focus-within:border-green-500";
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
          id={id}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
});

// 4. Main App Component (The Login Page)
const App: React.FC = () => {
  // States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  // --- Login State and Handlers ---
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<ValidationErrors<LoginFormData>>({});

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateLoginForm = (data: LoginFormData): ValidationErrors<LoginFormData> => {
    const validationErrors: ValidationErrors<LoginFormData> = {};
    const emailRegex = /\S+@\S+\.\S+/;
    if (!data.email) validationErrors.email = "Email is required.";
    else if (!emailRegex.test(data.email)) validationErrors.email = "Invalid email format.";
    if (!data.password) validationErrors.password = "Password is required.";
    return validationErrors;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const validationErrors = validateLoginForm(loginFormData);
    setLoginErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await mockLogin(loginFormData); // Mock API call
      setMessage("Login successful! Welcome back.");
      // Reset form after successful login
      setLoginFormData({ email: "", password: "" });
    } catch (error: any) {
      // Mock error message from mockLogin
      setMessage(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3">
      <div className="flex flex-col lg:flex-row max-w-3xl w-full bg-white shadow-2xl rounded-xl overflow-hidden">
        <GreenPanel />
        <LoginFormPanel
          loading={loading}
          message={message}
          passwordVisible={passwordVisible}
          setPasswordVisible={setPasswordVisible}
          
          formData={loginFormData}
          errors={loginErrors}
          handleChange={handleLoginChange}
          handleSubmit={handleLoginSubmit}
        />
      </div>
    </div>
  );
};

export default App;
