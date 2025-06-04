import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SendEmail=async(EmailTo,EmailText,EmailSubject)=>{


    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURITY,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    let mailOptions = {
        from:'Web Commerce <imraduan@gmail.com>',
        to:EmailTo,
        subject:EmailSubject,
        text:EmailText
    }


    return await transporter.sendMail(mailOptions)
}

export default SendEmail;