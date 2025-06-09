import express from "express";
import * as UsersOTPController from "../controllers/UsersOTPController.js";

const router = express.Router();

router.post('/otp',UsersOTPController.UserOTP)

router.post('/verify-otp',UsersOTPController.VerifyOTP)

export default router;