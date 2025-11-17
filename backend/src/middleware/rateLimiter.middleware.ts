import rateLimit from "express-rate-limit";

export const AuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15
  max: 10,
  message: "Too many request from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
