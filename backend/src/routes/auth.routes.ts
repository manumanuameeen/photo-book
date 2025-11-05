

import { Router } from "express";
import { AuthController } from "../controller/auth.controller.ts";
import { UserRepositery } from "../repositories/implementaion/user.repositery.ts";
import { AuthService } from "../services/auth/auth.servise.ts";
import { AuthRateLimiter } from "../middleware/rateLimiter.middleware.ts";

const router = Router();

// Dependency Injection
const userRepository = new UserRepositery();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Routes
router.post("/signup", AuthRateLimiter, authController.signup.bind(authController));
router.post("/verify-otp", AuthRateLimiter, authController.verifyOtp.bind(authController));
router.post("/login", AuthRateLimiter, authController.login.bind(authController));
router.post("/refresh-token", AuthRateLimiter, authController.refresh.bind(authController));
router.post("/logout", AuthRateLimiter, authController.logout.bind(authController));

export default router;