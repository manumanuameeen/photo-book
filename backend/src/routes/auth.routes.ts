import { Router } from "express";
import { AuthRateLimiter } from "../middleware/rateLimiter.middleware.ts";
import { ROUTES } from "../constants/routes.ts";
import { checkTokenBlacklist } from "../middleware/checkTokenBlacklist.ts";
import { container } from "../di/container.ts";
import { verifyAccessToken } from "../middleware/authMiddleware.ts";

const router = Router();
const authController = container.authController;

router.post(ROUTES.V1.AUTH.SIGNUP, AuthRateLimiter, authController.signup);
router.post(ROUTES.V1.AUTH.VERIFY_OTP, authController.verifyOtp);
router.post(ROUTES.V1.AUTH.RESEND_OTP, AuthRateLimiter, authController.resendOtp);

router.post(ROUTES.V1.AUTH.LOGIN, authController.login);
router.post(ROUTES.V1.AUTH.REFRESH, AuthRateLimiter, authController.refresh);
router.post(ROUTES.V1.AUTH.LOGOUT, verifyAccessToken, checkTokenBlacklist, authController.logout);
router.post(
  ROUTES.V1.AUTH.RESET_PASSWORD,
  AuthRateLimiter,
  verifyAccessToken,
  authController.resetPassword,
);
router.post(ROUTES.V1.AUTH.FORGOT_PASSWORD, AuthRateLimiter, authController.forgetpassword);
router.post(ROUTES.V1.AUTH.VERIFY_RESET_OTP, authController.verifyResetOtp);

export default router;
