import UserModel from "../model/UserModel.js";
import { TokenEncode } from "../utility/tokenUtility.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { deleteFile } from './../utility/fileUtils.js';
const ObjectId = mongoose.Types.ObjectId;

export const userRegisterService = async (req) => {
  try {
    let reqBody = req.body;
    reqBody.cus_email = reqBody.cus_email.trim();
    reqBody.cus_phone = reqBody.cus_phone.trim();
    const existingUser = await UserModel.findOne({cus_email: reqBody.cus_email 
    });
    if (existingUser) {
      return { status: false, message: "User already exists with this email." };
    }
    const existingUserPhone = await UserModel.findOne({cus_phone: reqBody.cus_phone});
    if (existingUserPhone) {
      return { status: false, message: "User already exists with this phone number." };
    }
    let data = await UserModel.create(reqBody);
    return { status: true, data: data, message: "Register successfully." };
  } catch (e) {
    return { status: false, error: e };
  }
};

export const userRegisterWithRefService = async (req) => {
  try {
    const ref_userId = new ObjectId(req.user.id)
    let reqBody = req.body;

    reqBody.cus_email = reqBody.cus_email.trim();
    reqBody.cus_phone = reqBody.cus_phone.trim();
    const existingUser = await UserModel.findOne({cus_email: reqBody.cus_email 
    });
    if (existingUser) {
      return { status: false, message: "User already exists with this email." };
    }
    const existingUserPhone = await UserModel.findOne({cus_phone: reqBody.cus_phone});
    if (existingUserPhone) {
      return { status: false, message: "User already exists with this phone number." };
    }
    
    reqBody.ref_userId = ref_userId;
    reqBody.isVerified = true;
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

export const getUserByIdService = async (req) => {
  try {
    let UserId = req.params.id;
    

    let data = await UserModel.findById(UserId)
    .populate('ref_userId', 'cus_firstName cus_lastName cus_phone cus_email img role')
    .populate('editBy', 'cus_firstName cus_lastName cus_phone cus_email img role');

    return { status: true, data: data };
  } catch (e) {
    return { status: false, error: e.toString() };
  }
};

export const getUserService = async (req) => {
  try {
    const userId = new ObjectId(req.user.id);

    let data = await UserModel.findOne({ _id: userId });

    return { status: true, data: data };
  } catch (error) {
    return { status: false, error: error.toString() };
  }
};

export const getAllUsersService = async (req) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Current user
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    const userRole = user?.role;

    // Search Query
    let searchQuery = {};

    if (req.query.cus_phone) {
      searchQuery.cus_phone = { $regex: req.query.cus_phone, $options: 'i' };
    }

    if (req.query.cus_email) {
      searchQuery.cus_email = { $regex: req.query.cus_email, $options: 'i' };
    }

    // Filter out admin and manager if current user is not admin
    if (userRole !== 'admin') {
      searchQuery.role = { $nin: ['admin', 'manager', 'seller'] };
    }

    // Count + Fetch
    const total = await UserModel.countDocuments(searchQuery);
    const data = await UserModel.find(searchQuery).skip(skip).limit(limit).sort({ createdAt: -1 });

    return {
      status: true,
      data: data,
      pagination: {
        total,
        currentPage: page,
        limit,
        pages: Math.ceil(total / limit),
      },
      message: "Users fetched successfully",
    };
  } catch (e) {
    return { status: false, error: e.toString() };
  }
};


export const updateUserService = async (req) => {
  try {
    const user_Id = new ObjectId(req.params.id); 
    const reqBody = req.body
    const editBy = new ObjectId(req.user.id);
    reqBody.editBy = editBy;

    // Delete old image if old img !== reqBody.img
    if (reqBody.img) {
      const oldImage = await UserModel.findById(user_Id).select("img");

      if (oldImage && oldImage.img !== reqBody.img) {
        await deleteFile(oldImage.img);
      }
    }

    await UserModel.findByIdAndUpdate(
      { _id: user_Id }, 
      { $set: reqBody },
      { upsert: true } 
    );

    return { status: true, message: "User information updated successfully." };
  } catch (e) {
    return { status: false, message: "Something went wrong", error: e.toString() };
  }
};

export const deleteUserService = async (req) => {
  try {
    const deleteId = req.params.id;
    const userRole = req.user.id;

    // Delete img
    const oldImage = await UserModel.findById(deleteId).select("img");

    if (oldImage) {
      await deleteFile(oldImage.img);
    }

    const user = await UserModel.findById(deleteId);
    if (!user) {
      return { status: false, message: "User not found." };
    }

    if (user.role === 'admin' && userRole !== 'admin') {
      return { status: false, message: "Only admin can delete admin." };
    }
    
    const result = await UserModel.findByIdAndDelete(deleteId);
    if (!result) {
      return { status: false, message: "User not found." };
    }
    return { status: true, message: "User deleted successfully." };
  } catch (e) {
    return { status: false, error: e.toString() };
  }
};

