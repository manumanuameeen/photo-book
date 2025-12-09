export const ROUTES = {
  V1: {
    AUTH: {
      BASE: "/api/v1/auth",
      SIGNUP: "/signup",
      VERIFY_OTP: "/verify-otp",
      RESEND_OTP: "/resend-otp",
      LOGIN: "/login",
      REFRESH: "/refresh-token",
      LOGOUT: "/logout",
      FORGOT_PASSWORD: "/forgot-password",
      VERIFY_RESET_OTP: "/verify-reset-otp",
      RESET_PASSWORD: "/reset-password",
    },
    USER: {
      BASE: "/api/v1/user",
      PROFILE: "/profile",
      UPDATE_PROFILE: "/profile",
      CHANGE_PASSWORD: "/change-password",
    },
    PHOTOGRAPHER: {
      BASE: "/api/v1/photographer",
      APPLY: "/apply",
    },
    ADMIN: {
      BASE: "/api/v1/admin",
      
      USERS: "/users",
      USER_BY_ID: "/users/:id",
      BLOCK: "/users/:id/block",
      UNBLOCK: "/users/:id/unblock",

      
      PHOTOGRAPHERS: "/photographers",
      PHOTOGRAPHER_STATS: "/photographers/stats",
      PHOTOGRAPHER_BY_ID: "/photographers/:id",
      PHOTOGRAPHER_BLOCK: "/photographers/:id/block",
      PHOTOGRAPHER_UNBLOCK: "/photographers/:id/unblock",

      
      APPLICATIONS: "/applications",
      APPLICATION_BY_ID: "/applications/:id",
      APPLICATION_APPROVE: "/applications/:id/approve",
      APPLICATION_REJECT: "/applications/:id/reject",
    },
  },
} as const;

