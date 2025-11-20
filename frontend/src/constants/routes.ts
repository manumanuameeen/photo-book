export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    VERIFY_OTP: "/auth/verify-otp",
    FORGOT_PASSWORD: "/auth/forgetPassword",
    RESET_PASSWORD: "/auth/resetPassword",
    RESET_OTP:"/auth/reset-otp"
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "admin/usermanagement",
  },
  USER: {
    HOME: "/main/home",
  },
} as const;