import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP via Twilio Verify
export const sendOTP = async (to) => {
  if (!to.startsWith('+880')) {
    if (to.startsWith('0')) {
      to = '+880' + to.substring(1);
    } else {
      throw new Error("Invalid phone number format.");
    }
  }

  const verification = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verifications.create({ to, channel: 'sms' });

  return verification.status === "pending";
};