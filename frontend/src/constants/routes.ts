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
    CATEGORIES: "/admin/categories",
    PENDING_CATEGORIES: "/admin/categories/pending",
  },
  USER: {
    HOME: "/main/home",
    PROFILE: "/main/profile",
    EDIT_PROFILE: "/main/editProfile",
    PHOTOGRAPHER: "/main/photographer",
    PHOTOGRAPHER_DETAILS: "/main/photographer/$id",
    BOOKING: "/main/booking",
    BOOKINGS: "/main/bookings",
    WALLET: "/main/wallet"
  },
  PHOTOGRAPHER: {
    APPLY: "/photographer/apply",
    DASHBOARD: "/photographer/dashboard",
    PROFILE: "/photographer/profile",
    AVAILABILITY: "/photographer/availability",
    BOOKINGS: "/photographer/bookings",
    BOOKING_DETAILS: "/photographer/bookings/$id",
  },
  GENERAL: {
    ABOUT: "/about"
  }
} as const;