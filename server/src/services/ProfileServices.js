import ProfileModel from '../model/ProfileModel.js';
import UserOTPModel from '../model/UserOTPModel.js';
import { TokenEncode } from '../utility/tokenUtility.js';
import bcrypt from 'bcryptjs';
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;



export const profileRegisterService = async (req) => {
    try {
        let user_id=req.headers.user_id;
        let reqBody = req.body;
        reqBody.userID=user_id;
        let data = await ProfileModel.updateOne({userID:user_id},{$set:reqBody},{upsert:true});
        return { status: true, data: data, message: "Register success." };
    } catch (e) {
      return { status: false, error: e };
    }
  };

export const ProfileLoginService = async (req, res) => {
    try {
        let reqBody = req.body;
        let contact=reqBody.contact;
        let password = reqBody.password;

        const user = await UserOTPModel.findOne({$or: [{ email: contact }, { phone: contact }]});
        
        if (!user) {
          return { status: false, message: "User not found." };
        }
        let user_id = user._id.toString();
        let role = user.role;
        
        
        const data = await ProfileModel.findOne({$or: [{ userID: user_id }, { phone: contact }]});
        
        

        const passwordMatch = await bcrypt.compare(password, data.password);
        

        if (!passwordMatch) {
            return { status: false, message: "Incorrect password." };
        }
      
          
            let token = TokenEncode(contact,user_id, role);

              // // Set cookie
              // let options = {
              //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
              //   httpOnly: true, // Prevents client-side access to the cookie
              //   sameSite: "none", // Required for cross-site cookies
              //   secure: process.env.NODE_ENV === "production", // true in production
              // };

              // await res.cookie("token", token, options);
            return {
              status: true,
              token: token,
              data: data[0],
              message: "Login success.",
            };
          
        } catch (e) {
          return { status: false, message: "Login unsuccess." };
        }
  };



export const getProfileService = async (req) => {
    try {
      let UserID= new ObjectId(req.params.id);
      
      
      let MatchStage = { $match: { userID: UserID } };
      
      let JoinWithUserStage = { $lookup: { from: "users", localField: "userID", foreignField: "_id", as: "user" } };

      let UnwindUserStage = { $unwind: "$user" };

      let ProjectionStage = { $project: { 'user._id': 1, 'cus_phone': 1} };

        // Query
       let  data = await ProfileModel.aggregate([MatchStage, JoinWithUserStage, UnwindUserStage, ProjectionStage]);

        return { status: true, data: data};
    } catch (e) {
      return { status: false, error: e.toString() };
    }
  };
export const getAllProfileService = async (req) => {
    try {
        let user_id=req.headers.user_id;
        let reqBody = req.body;
        reqBody.userID=user_id;
        let data = await ProfileModel.updateOne({userID:user_id},{$set:reqBody},{upsert:true});
        return { status: true, data: data, message: "Register success." };
    } catch (e) {
      return { status: false, error: e };
    }
  };
export const updateProfileService = async (req) => {
    try {
        let user_id=req.headers.user_id;
        let reqBody = req.body;
        reqBody.userID=user_id;
        let data = await ProfileModel.updateOne({userID:user_id},{$set:reqBody},{upsert:true});
        return { status: true, data: data, message: "Register success." };
    } catch (e) {
      return { status: false, error: e };
    }
  };
export const deleteProfileProfileService = async (req) => {
    try {
        let user_id=req.headers.user_id;
        let reqBody = req.body;
        reqBody.userID=user_id;
        let data = await ProfileModel.updateOne({userID:user_id},{$set:reqBody},{upsert:true});
        return { status: true, data: data, message: "Register success." };
    } catch (e) {
      return { status: false, error: e };
    }
  };
export const profileLogoutService = async (req) => {
    try {
        let user_id=req.headers.user_id;
        let reqBody = req.body;
        reqBody.userID=user_id;
        let data = await ProfileModel.updateOne({userID:user_id},{$set:reqBody},{upsert:true});
        return { status: true, data: data, message: "Register success." };
    } catch (e) {
      return { status: false, error: e };
    }
  };
