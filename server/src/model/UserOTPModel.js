import mongoose from "mongoose";

const userOTPSchema = new mongoose.Schema(
  {
    email: { type: String},
    phone: { type: String},
    otp: { type: String },
    otpExpiry: {
      type: Date,
      required: true,
      index: { expires: 120 },
    },
    otpMethod: { type: String },
    otpAttempts: { type: Number, default: 0 },
    role: { type: String, default: "user" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


export default mongoose.model("UserOTP", userOTPSchema);
