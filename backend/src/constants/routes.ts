export const ROUTES = {
  V1: {
    AUTH: {
      SIGNUP: "/signup",
      VERIFY_OTP: "/verify-otp",
      RESEND_OTP: "/resend-otp",
      LOGIN: "/login",
      REFRESH: "/refresh",
      LOGOUT: "/logout",
      FORGOT_PASSWORD: "/forgot-password",
      VERIFY_RESET_OTP: "/verify-reset-otp",
      RESET_PASSWORD: "/reset-password",
    },
    USER: {
      PROFILE: "/profile",
      UPDATE_PROFILE: "/profile",
      CHANGE_PASSWORD: "/change-password",
    },
    PHOTOGRAPHER: {
      APPLY: "/apply",
    },
    ADMIN: {
      // User Management
      USERS: "/users",
      USER_BY_ID: "/users/:id",
      BLOCK: "/users/:id/block",
      UNBLOCK: "/users/:id/unblock",
      
      // Photographer Management
      PHOTOGRAPHERS: "/photographers",
      PHOTOGRAPHER_STATS: "/photographers/stats",
      PHOTOGRAPHER_BY_ID: "/photographers/:id",
      PHOTOGRAPHER_BLOCK: "/photographers/:id/block",
      PHOTOGRAPHER_UNBLOCK: "/photographers/:id/unblock",
      
      // Application Management
      APPLICATIONS: "/applications",
      APPLICATION_BY_ID: "/applications/:id",
      APPLICATION_APPROVE: "/applications/:id/approve",
      APPLICATION_REJECT: "/applications/:id/reject",
    },
  },
} as const;
