export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    VERIFY_OTP: "/auth/verify-otp",
    FORGOT_PASSWORD: "/auth/forgetPassword",
    RESET_PASSWORD: "/auth/resetPassword",
    RESET_OTP: "/auth/reset-otp",
    ROOT: "/auth"
  },
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/usermanagement",
    PHOTOGRAPHERS: "/admin/photographers",
    PHOTOGRAPHER_DETAILS: "/admin/photographers/$id",
    APPLICATIONS: "/admin/applications",
    APPLICATION_DETAILS: "/admin/applications/$id",
    CATEGORIES: "/admin/categories",
    PENDING_CATEGORIES: "/admin/categories/pending",
    RENTAL_MANAGEMENT: "/admin/rental-management",
    RENTAL_MANAGEMENT_DETAILS: "/admin/rental-management/$id",
    RENTAL_ORDERS: "/admin/rental-orders",
    RENTAL_ORDER_DETAILS: "/admin/rental-orders/$orderId",
    PACKAGES: "/admin/packages",
    WALLET: "/admin/wallet",
    REPORTS: "/admin/reports",
    REPORT_CATEGORIES: "/admin/report-categories",
    RULES: "/admin/rules",
    HELP_MANAGEMENT: "/admin/help"
  },
  USER: {
    HOME: "/main/home",
    PROFILE: "/main/profile",
    EDIT_PROFILE: "/main/editProfile",
    PHOTOGRAPHER: "/main/photographer",
    PHOTOGRAPHER_DETAILS: "/main/photographer/$id",
    BOOKING: "/main/booking",
    BOOKINGS: "/main/bookings",
    DASHBOARD: "/main/dashboard",
    WALLET: "/main/wallet",
    PAYMENT: "/main/payment/$id",
    PAYMENT_SUCCESS: "/main/payment/success",
    RENTAL_MARKETPLACE: "/main/rentals",
    RENTAL_DETAILS: "/main/rentals/$id",
    RENT_ITEM: "/main/rent-item",
    RULES: "/main/rules",
    HOW_IT_WORKS: "/main/how-it-works",
    MY_LISTINGS: "/main/my-listings",
    ROOT: "/main"
  },
  CHAT: {
    INDEX: "/chat"
  },

  PHOTOGRAPHER: {
    ROOT: "/photographer",
    APPLY: "/photographer/apply",
    DASHBOARD: "/photographer/dashboard",
    PROFILE: "/photographer/profile",
    EDIT_PROFILE: "/photographer/edit-profile",
    PORTFOLIO: "/photographer/portfolio",
    PACKAGES: "/photographer/packages",
    AVAILABILITY: "/photographer/availability",
    BOOKINGS: "/photographer/bookings",
    BOOKING_DETAILS: "/photographer/bookings/$id",
  },
  GENERAL: {
    ROOT: "/",
    ABOUT: "/about"
  }
} as const;