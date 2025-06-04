import express from "express";
import * as UsersOTPController from "../controllers/UsersOTPController.js";

const router = express.Router();

router.get('/otp',UsersOTPController.UserOTP)

router.get('/verify-otp',UsersOTPController.VerifyOTP)

export default router;