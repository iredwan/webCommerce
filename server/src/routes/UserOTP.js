import express from "express";
import * as UsersOTPController from "../controllers/UsersOTPController.js";

const router = express.Router();

router.get('/otp',UsersOTPController.UserOTP)
router.get('/pws-update-otp',UsersOTPController.passwordUpdateOTP)

router.get('/VerifyLogin',UsersOTPController.VerifyLogin)
router.get('/user-logout',UsersOTPController.UserLogout)

export default router;