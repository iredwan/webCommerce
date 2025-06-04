import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      lowercase: true,
      validate: {
        validator: function(v) {
          return !(!this.phone && !v);
        },
        message: "Email or phone is required"
      }
    },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: "Invalid phone number format"
      }
    },
    otp: { 
      type: String,
      index: { expires: "2m" }  // OTP auto-deletes after 2 minutes (field only)
    },
    otpMethod: { 
      type: String,
      enum: ["email", "sms"]
    },
    otpExpiry: Date,  // No TTL here - handled by application logic
    otpAttempts: { 
      type: Number, 
      default: 0 
    },
    role: { 
      type: String,
      default: "user" 
    }
  },
  { 
    timestamps: true,
    versionKey: false 
  }
);

// Remove document-level TTL indexes (if any exist)
// UserSchema.index({ createdAt: 1 }, { expires: '2m' }); ❌ Remove this!

// Unique indexes
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Pre-save hook to clear expired OTPs (extra safety)
UserSchema.pre("save", function(next) {
  if (this.otpExpiry && this.otpExpiry < new Date()) {
    this.otp = undefined;
    this.otpExpiry = undefined;
    this.otpMethod = undefined;
  }
  next();
});

const UserOTPModel = mongoose.model("usersOTP", UserSchema);
export default UserOTPModel;