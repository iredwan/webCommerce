import rateLimit from "express-rate-limit";

export const otpRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, 
  max: 5, 
  message: {
    status: false,
    message: "Too many OTP attempts, please try again after 2 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
