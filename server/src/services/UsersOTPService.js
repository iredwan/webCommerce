import SendEmail from "../utility/emailUtility.js";
import { sendOTP } from "../utility/smsUtility.js";
import {TokenEncode} from "../utility/tokenUtility.js"
import UserOTPModel from "../model/UserOTPModel.js";
import ProfileModel from './../model/ProfileModel.js';

export const UserOTPService = async (req) => {
  try {
    const contact = req.body.contact;
    let user, method;

    // Check if user exists in ProfileModel
    const existingUser = await ProfileModel.find({
      $or: [{ email: contact }, { phone: contact }],
    });

    if (existingUser.length > 0) {
      return { status: false, msg: "User exists" };
    }

    // Generate OTP and set expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    if (contact.includes("@")) {
      // Email OTP handling
      // First find the user to check current attempts
      const existingOTPUser = await UserOTPModel.findOne({ email: contact });
      
      // Check attempt limit before proceeding
      if (existingOTPUser?.otpAttempts >= 5) {
        return {
          status: false,
          error: "Maximum number of attempts reached. Please try again later.",
        };
      }

      // Update with new OTP and increment attempts
      user = await UserOTPModel.findOneAndUpdate(
        { email: contact },
        { 
          $set: { 
            otp, 
            otpMethod: "email", 
            otpExpiry 
          },
          $inc: { otpAttempts: 1 } // This will increment by 1
        },
        { upsert: true, new: true }
      );

      method = "email";
      await SendEmail(contact, `Your OTP: ${otp}`, "OTP Verification");
    } else if (!isNaN(contact)) {
      // Phone OTP handling
      const existingOTPUser = await UserOTPModel.findOne({ phone: contact });
      
      if (existingOTPUser?.otpAttempts >= 5) {
        return {
          status: false,
          error: "Maximum number of attempts reached. Please try again later.",
        };
      }

      user = await UserOTPModel.findOneAndUpdate(
        { phone: contact },
        { 
          $set: { 
            otp: null, 
            otpMethod: "sms",
            otpExpiry 
          },
          $inc: { otpAttempts: 1 } // Increment attempts for phone too
        },
        { upsert: true, new: true }
      );
      method = "sms";
      await sendOTP(contact); // Use Twilio Verify
    } else {
      return { status: false, error: "Invalid contact format" };
    }

    return { 
      status: true, 
      message: `OTP sent to ${contact} via ${method}`,
      attempts: user.otpAttempts // Optional: return current attempt count
    };
  } catch (error) {
    console.error("OTP Service Error:", error);
    return {
      status: false,
      error: "Failed to send OTP",
      details: error.message,
    };
  }
};


export const passwordUpdateOTPService = async(req) =>{
  try {
      let contact = req.body.contact;
      let user, method;

      const existingUser = await UserOTPModel.find({$or: [{ email: contact }, { phone: contact }]});

      if (existingUser.length = 0) {
          return { status: false, msg: "User not found" };
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Determine contact type
      if (contact.includes("@")) {
        user = await UserOTPModel.findOneAndUpdate(
          { email: contact },
          { otp, otpMethod: "email" },
          { upsert: true, new: true }
        );
        method = "email";
        await SendEmail(contact, `Your OTP: ${otp}`, "OTP Verification");
      } else {
        user = await UserOTPModel.findOneAndUpdate(
          { phone: contact },
          { otp, otpMethod: "sms" },
          { upsert: true, new: true }
        );
        method = "sms";
        await SendSMS(contact, `Your OTP: ${otp}`); // Implement SMS service
      }
  
      return { status: true, method };
    } catch (error) {
      return { status: false, error: "Failed to send OTP" };
    }
}


export const VerifyOTPServic = async(req) =>{

    try {
        let reqBody = req.body;
        let contact=reqBody.contact;
        let otp=reqBody.otp;

        // User Count
        const total = await UserOTPModel.findOne({
            $or: [{ email: contact }, { phone: contact }],
            otp: otp
          }).countDocuments();
          
          

        if(total===1){

          let user=await UserOTPModel.findOne({
            $or: [{ email: contact }, { phone: contact }],
            otp: otp
          });
          
          // User ID Read
            let userId = user._id;
            let userIdTos = user._id.toString();
            // User Role Read
            let role= user.role;

           

            // User Token Create
            let token=TokenEncode(contact,userIdTos, role)
            // Clear OTP after verification
            await UserOTPModel.findByIdAndUpdate(userId, { 
            $set: { otp: "0", otpMethod: "0" }
            });

            return {status:true, message:"Valid OTP",token:token}

        }
        else{
            return {status:false, message:"Invalid OTP",total:total}
        }

    }catch (e) {
        return {status:false, message:"Invalid OTP", details: e.message}
    }


}

export const VerifyOTPService = async (req, res) => {
  try {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return { status: false, message: "Contact and OTP are required" };
    }

    const user = await UserOTPModel.findOne({
            $or: [{ email: contact }, { phone: contact }],
            otp: otp
          });

    if (!user || !user.otp) {
      return { status: false, message: "Invalid OTP" };
    }

    // Expiry check
    if (user.otpExpiry < new Date()) {
      return { status: false, message: "OTP expired" };
    }

    // OTP match check
    if (user.otp !== otp) {
      return { status: false, message: "Incorrect OTP" };
    }

    // Success: reset otpAttempts & set token cookie
    const token = EncodeToken(user.email, user._id.toString(), user.role || "user");


    await UserOTPModel.updateOne(
      { email: email.trim() },
      { $unset: { otp: "", otpExpiry: "" }, $set: { otpAttempts: 0 } } // Clear OTP and reset attempts
    );

    return {
      status: true,
      token: token,
      message: "OTP verified successfully",
    };

  } catch (error) {
    return {
      status: false,
      message: "OTP verification failed",
      error: error.message,
    };
  }
};