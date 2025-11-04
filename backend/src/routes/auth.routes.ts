import { Router } from "express";
import { AuthController } from "../controller/implementation/auth.controller";
import { UserRepositery } from "../repositories/implementaion/user.repositery";
import { AuthService } from "../services/auth.servise";
import { AuthRateLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();
//injection
const userRepositery = new UserRepositery();
const authService = new AuthService(userRepositery);
const authController = new AuthController(authService);

//routes
router.post("/signup", AuthRateLimiter, authController.signup.bind(authController));
router.post("/verify-otp", AuthRateLimiter, authController.verifyOtp.bind(authController));
router.post("/login", AuthRateLimiter, authController.login.bind(authController));
router.post("verify-otp", AuthRateLimiter, authController.verifyOtp.bind(authController));
router.post("/refresh-token", AuthRateLimiter, authController.refresh.bind(authController));
router.post("/logout", AuthRateLimiter, authController.logout.bind(authController));

export default router;
