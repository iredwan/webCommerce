import {UserOTPService, VerifyOTPService} from "../services/UsersOTPService.js";


//! user Register
export const UserOTP = async(req, res)=>{
  let result = await UserOTPService(req);
  return res.status(200).json(result);
}

export const VerifyOTP = async(req, res)=>{
  let result=await VerifyOTPService(req)
  if (result.status && result.token) {
    // Set the token cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "Strict",
      secure: false,
      sameSite: "Lax",
      maxAge: 2592000000, // 30 days  
      path: "/",
    });
  }
  return res.status(result.status ? 200 : 401).json(result);
}
