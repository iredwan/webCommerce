import SendEmail from "../utility/emailUtility.js";
import { sendOTP } from "../utility/smsUtility.js";
import {TokenEncode} from "../utility/tokenUtility.js"
import UserOTPModel from "../model/UserOTPModel.js";
import UserModel from './../model/UserModel.js';

export const UserOTPService = async (req) => {
  try {
    const contact = req.body.contact;
    let user, method;

    // Check if user exists in ProfileModel
    const existingUser = await UserModel.find({
      $or: [{ cus_email: contact }, { cus_phone: contact }],
    });

    if (existingUser.length > 0) {
      return { status: false, message: "User exists" };
    }

    // Generate OTP and set expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    if (contact.includes("@")) {
      // Email OTP handling
      // First find the user to check current attempts
      const existingOTPUser = await UserOTPModel.findOne({ cus_email: contact });
      
      // Check attempt limit before proceeding
      if (existingOTPUser?.otpAttempts >= 5) {
        return {
          status: false,
          error: "Maximum number of attempts reached. Please try again later.",
        };
      }

      // Update with new OTP and increment attempts
      user = await UserOTPModel.findOneAndUpdate(
        { cus_email: contact },
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
      const existingOTPUser = await UserOTPModel.findOne({ cus_phone: contact });
      
      if (existingOTPUser?.otpAttempts >= 5) {
        return {
          status: false,
          error: "Maximum number of attempts reached. Please try again later.",
        };
      }

      user = await UserOTPModel.findOneAndUpdate(
        { cus_phone: contact },
        { 
          $set: { 
            otp, 
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

export const VerifyOTPService = async (req, res) => {
  try {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return { status: false, message: "Contact and OTP are required" };
    }

    const user = await UserOTPModel.findOne({
      $or: [{ cus_email: contact }, { cus_phone: contact }],
    });

    if (!user) {
      return { status: false, message: `${contact} not found` };
    }


    if (!user.otp) {
      return { status: false, message: "Invalid OTP" };
    }

    if (user.otpExpiry < new Date()) {
      return { status: false, message: "OTP expired" };
    }

    if (user.otp !== otp) {
      return { status: false, message: "Incorrect OTP" };
    }

    const token = TokenEncode(user.cus_email, user._id.toString(), user.role || "user");

    await UserOTPModel.updateOne(
      { cus_email: user.cus_email.trim() },
      { $unset: { otp: "", otpExpiry: "" }, $set: { otpAttempts: 0 } }
    );

    return {
      status: true,
      token,
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


