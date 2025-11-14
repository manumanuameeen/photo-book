import { Router } from "express";
import { AuthController } from "../controller/auth.controller.ts";
import { UserRepository } from "../repositories/implementaion/user/user.repositery.ts";
import { AuthService } from "../services/user/auth/auth.servise.ts";
import { AuthRateLimiter } from "../middleware/rateLimiter.middleware.ts";
import { NodeMailerService } from "../services/user/email/nodemailer.service.ts";
import { Otpservice } from "../services/user/otp/otp.service.ts";

const router = Router();

const userRepository = new UserRepository();
const emailService = new NodeMailerService();
const otpService = new Otpservice();
const authService = new AuthService(userRepository, emailService, otpService);
const authController = new AuthController(authService);

router.post("/signup", authController.signup.bind(authController));
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post("/resend-otp", authController.resendOtp.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/refresh-token", authController.refresh.bind(authController));
router.post("/logout", authController.logout.bind(authController));

export default router;
