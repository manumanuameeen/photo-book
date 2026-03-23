import { Router } from "express";
import { AuthRateLimiter } from "../middleware/rateLimiter.middleware";
import { ROUTES } from "../constants/routes";
import { checkTokenBlacklist } from "../middleware/checkTokenBlacklist";
import { container } from "../di/container";
import { verifyAccessToken } from "../middleware/authMiddleware";

const router = Router();

const authController = container.authController;

router.post(ROUTES.V1.AUTH.SIGNUP, AuthRateLimiter, authController.signup);
router.post(ROUTES.V1.AUTH.VERIFY_OTP, authController.verifyOtp);
router.post(ROUTES.V1.AUTH.RESEND_OTP, AuthRateLimiter, authController.resendOtp);

router.post(ROUTES.V1.AUTH.LOGIN, authController.login);
router.post(ROUTES.V1.AUTH.GOOGLE_LOGIN, authController.googleLogin);
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
