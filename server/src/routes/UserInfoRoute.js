import express from "express";
import { TokenDecode } from "../utility/tokenUtility.js";
import UserModel from './../model/UserModel.js';

const router = express.Router();

router.get("/get", async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(200).json({ status: false, message: "Please login" });
    }
    

    const decoded = TokenDecode(token);
    if (!decoded) {
      return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }

    const user = await UserModel.findById(decoded.user_id);
    if(user.role !== decoded.role){
      // Remove token from cookie
      res.clearCookie('token');
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    return res.status(200).json({ status: true, user });

  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
});

export default router;
