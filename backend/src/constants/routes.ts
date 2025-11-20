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
      FORGOT_PASSWORD: "/forget-password",
      VERIFY_RESET_OTP: "/verify-reset-otp",
      RESET_PASSWORD: "/reset-password",
    },
    USER: {},
    ADMIN: {
      BASE: "/api/v1/admin",
      USERS: "/users",
      USER_BY_ID: "/users/:id",
      BLOCK: "/users/:id/block",
      UNBLOCK: "/users/:id/unblock",
    },
  },
};
