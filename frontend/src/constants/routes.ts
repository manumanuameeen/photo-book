export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    VERIFY_OTP: "/auth/verify-otp",
    FORGOT_PASSWORD: "/auth/forgetPassword",
    RESET_PASSWORD: "/auth/resetPassword",
    RESET_OTP: "/auth/reset-otp"
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/usermanagement",
    PHOTOGRAPHERS: "/admin/photographers",
    APPLICATIONS: "/admin/applications",
    APPLICATION_DETAILS: "/admin/applications/$id",
  },
  USER: {
    HOME: "/main/home",
    PROFILE: "/main/profile",
    EDIT_PROFILE: "/main/editProfile",
    PHOTOGRAPHER:"/main/photographer"
  },
  PHOTOGRAPHER: {
    APPLY: "/photographer/apply",
    DASHBOARD: "/photographer/dashboard",
    PROFILE: "/photographer/profile",
  },
  GENERAL: {
    ABOUT: "/about"
  }
} as const;