import UserModel from "../model/UserModel.js";
import { TokenEncode } from "../utility/tokenUtility.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const userRegisterService = async (req) => {
  try {
    let reqBody = req.body;
    let data = await UserModel.create(reqBody);
    return { status: true, data: data, message: "Register successfully." };
  } catch (e) {
    return { status: false, error: e };
  }
};

export const userRegisterWithRefService = async (req) => {
  try {
    const ref_userID = req.headers.userID || req.cookies.userID;
    
    let reqBody = req.body;
    reqBody.ref_userID = ref_userID;
    let data = await UserModel.create(reqBody);
    return { status: true, data: data, message: "Register successfully." };
  } catch (e) {
    return { status: false, error: e };
  }
};

export const userLoginService = async (contact, password) => {
  try {
    const user = await UserModel.findOne({
      $or: [
        { cus_email: { $regex: new RegExp(`^${contact}$`, "i") } },
        { cus_phone: contact },
      ],
    });

    if (!user) {
      return { status: false, message: "User not found." };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { status: false, message: "Incorrect password." };
    }

    const token = TokenEncode(contact, user._id.toString(), user.role);

    return {
      status: true,
      token,
      data: user,
      message: "Login success.",
    };
  } catch (e) {
    return { status: false, message: "Login unsuccess.", error: e.toString() };
  }
};

export const getUserByIDService = async (req) => {
  try {
    let UserID = new ObjectId(req.params.id);

    let data = await UserModel.findOne({ _id: UserID })
    .populate('ref_userID', 'cus_firstName cus_lastName cus_phone cus_email img role')
    .populate('editBy', 'cus_firstName cus_lastName cus_phone cus_email img role');

    return { status: true, data: data };
  } catch (e) {
    return { status: false, error: e.toString() };
  }
};

export const getUserService = async (req) => {
  try {
    const userId = new ObjectId(req.headers.userID || req.cookies.userID);

    let data = await UserModel.findOne({ _id: userId });

    return { status: true, data: data };
  } catch (error) {
    return { status: false, error: error.toString() };
  }
};

export const getAllUsersService = async (req) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (req.query.cus_phone) {
      searchQuery.cus_phone = { $regex: req.query.cus_phone, $options: 'i' };
    }
    if (req.query.cus_email) {
      searchQuery.cus_email = { $regex: req.query.cus_email, $options: 'i' };
    }

    // Get total count for pagination
    const total = await UserModel.countDocuments(searchQuery);

    // Get paginated and filtered data
    const data = await UserModel.find(searchQuery)
      .skip(skip)
      .limit(limit);

    return {
      status: true,
      data: data,
      pagination: {
        total,
        currentPage: page,
        limit,
        pages: Math.ceil(total / limit)
      },
      message: "Users fetched successfully"
    };
  } catch (e) {
    return { status: false, error: e.toString() };
  }
};

export const updateUserService = async (req) => {
  try {
    let user_id = new ObjectId(req.params.id);
    let reqBody = req.body;
    
    const editBy = new ObjectId(req.headers.userID || req.cookies.userID);
    reqBody.editBy = editBy;

   await UserModel.findOneAndUpdate(
      { _id: user_id },
      { $set: reqBody },
      { upsert: true }
    );
    return { status: true, message: "Information updated successfully." };
  } catch (e) {
    return { status: false, error: e };
  }
};

export const deleteUserService = async (req) => {
  try {
    let user_id = new ObjectId(req.params.id);
    await UserModel.deleteOne(
      { _id: user_id },
    );
    return { status: true, message: "User deleted successfully." };
  } catch (e) {
    return { status: false, error: e.toString() };
  }
};

