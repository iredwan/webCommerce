import {UserOTPService, VerifyOTPService} from "../services/UsersOTPService.js";


//! user Register
export const UserOTP = async(req, res)=>{
  let result = await UserOTPService(req);
  return res.status(200).json(result);
}

export const VerifyOTP = async(req, res)=>{
  let result=await VerifyOTPService(req)

  if(result['status']==="true"){

      // Cookies Option
      let cookieOption={expires:new Date(Date.now()+24*60*60*1000), httpOnly:false}

      // Set Cookies With Response
      res.cookie('token',result['token'],cookieOption)
      return res.status(200).json(result)

  }else {
      return res.status(200).json(result)
  }
}
