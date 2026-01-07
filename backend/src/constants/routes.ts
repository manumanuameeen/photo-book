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
      UPDATE_PROFILE: "/update-profile",
      CHANGE_PASSWORD: "/change-password",
      INITIATE_CHANGE_PASSWORD: "/initiate-change-password",
      PROFILE_IMAGE: "/profile-image",
      VERIFY_OTP: "/verify-otp",
    },
    PHOTOGRAPHER: {
      BASE: "/api/v1/photographer",
      APPLY: "/apply",
      DASHBOARD: "/dashboard",
      SUGGEST_CATEGORY: "/category/suggest",


      PORTFOLIO_SECTION: "/portfolio/section",
      PORTFOLIO_SECTIONS: "/portfolio/sections",
      PORTFOLIO_SECTION_BY_ID: "/portfolio/section/:id",
      PORTFOLIO_SECTION_IMAGE: "/portfolio/section/:id/image",

      PACKAGES: "/packages",
      PACKAGE_BY_ID: "/packages/:id",
      PUBLIC_PACKAGES: "/:photographerId/packages",

      // Availability
      AVAILABILITY: "/availability",

      // Categories
      CATEGORIES: "/categories",
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

      // Package Management
      PACKAGES: "/packages",
      PACKAGE_APPROVE: "/packages/:id/approve",
      PACKAGE_REJECT: "/packages/:id/reject",
      PACKAGE_BLOCK: "/packages/:id/block",
      PACKAGE_UNBLOCK: "/packages/:id/unblock",

      // Category Management
      CATEGORY: "/category",
      CATEGORY_BY_ID: "/category/:id",
      CATEGORY_APPROVE: "/category/:id/approve",
      CATEGORY_REJECT: "/category/:id/reject",
      CATEGORIES: "/categories",
    },
    BOOKING: {
      BASE: "/api/v1/booking",
      CREATE: "/",
      DETAILS: "/:id",
      USER_BOOKINGS: "/user/all",
      PHOTOGRAPHER_BOOKINGS: "/photographer/all",
      ACCEPT: "/:id/accept",
      REJECT: "/:id/reject",
      CANCEL: "/:id/cancel",
    },
    MESSAGE: {
      BASE: "/api/v1/message",
    },
    PAYMENT: {
      BASE: "/api/v1/payment",
      CREATE_INTENT: "/create-intent",
      CONFIRM: "/confirm",
    },
    WALLET: {
      BASE: "/api/v1/wallet",
      DETAILS: "/",
    },
  },
} as const;
