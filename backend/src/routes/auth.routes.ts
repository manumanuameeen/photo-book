import { Router } from "express";
import { AuthController } from "../controller/auth.controller.ts";
import { UserRepository } from "../repositories/implementaion/user/user.repositery.ts";
import { AuthService } from "../services/user/auth/auth.servise.ts";
import { AuthRateLimiter } from "../middleware/rateLimiter.middleware.ts";
import { NodeMailerService } from "../services/user/email/nodemailer.service.ts";
import { Otpservice } from "../services/user/otp/otp.service.ts";
import { ROUTES } from "../constants/routes.ts"
const router = Router();

const userRepository = new UserRepository();
const emailService = new NodeMailerService();
const otpService = new Otpservice();
const authService = new AuthService(userRepository, emailService, otpService);
const authController = new AuthController(authService);

router.post(ROUTES.AUTH.SIGNUP, AuthRateLimiter, authController.signup);
router.post(ROUTES.AUTH.VERIFY_OTP, AuthRateLimiter, authController.verifyOtp);
router.post(ROUTES.AUTH.RESEND_OTP, AuthRateLimiter, authController.resendOtp);
router.post(ROUTES.AUTH.LOGIN, AuthRateLimiter, authController.login);
router.post(ROUTES.AUTH.REFRESH, AuthRateLimiter, authController.refresh);
router.post(ROUTES.AUTH.LOGOUT, AuthRateLimiter, authController.logout);
router.post(ROUTES.AUTH.FORGOT_PASSWORD, AuthRateLimiter, authController.forgetpassword);
router.post(ROUTES.AUTH.VERIFY_RESET_OTP, AuthRateLimiter, authController.verifyResetOtp);
router.post(ROUTES.AUTH.RESET_PASSWORD, AuthRateLimiter, authController.resetPassword)


export default router;
