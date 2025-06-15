import { deleteUserService, getAllUsersService, getUserByIDService, getUserService, updateUserService, userLoginService, userRegisterService, userRegisterWithRefService } from "../services/UserServices.js";



//! User Register
export const userRegister = async(req, res)=>{
  let result = await userRegisterService(req);
  // Clear the cookie named "token"
  if (result.status === true) {
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
    // sameSite: "Strict",
    secure: false,
    sameSite: "Lax",
  })
  };
  
  return res.status(200).json(result);
};

// User Register with ref
export const userRegisterWithRef = async(req, res)=>{
  let result = await userRegisterWithRefService(req);
  return res.status(200).json(result);
};

// User Login
export const userLogin = async (req, res) => {
  const { contact, password } = req.body;

  const result = await userLoginService(contact, password);

  if (result.status && result.token) {
    // Set the token cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "Strict",
      secure: false,
      sameSite: "Lax",
      maxAge: 2592000000, // 30 days
      path: "/",
    });
  }

  return res.status(result.status ? 200 : 401).json(result);
};


// Get User By ID
export const getUserByID = async(req, res)=>{
  let result = await getUserByIDService(req);
  return res.status(200).json(result);
};

// Get User
export const getUser = async(req, res)=>{
  let result = await getUserService(req);
  return res.status(200).json(result);
};

// Get All Users
export const getAllUsers = async(req, res)=>{
  let result = await getAllUsersService(req);
  return res.status(200).json(result);
};

// Update User
export const updateUser = async(req, res)=>{
  let result = await updateUserService(req);
  return res.status(200).json(result);
};

// Delete User
export const deleteUser = async(req, res)=>{
  let result = await deleteUserService(req);
  return res.status(200).json(result);
};

// User Logout
export const userLogout = async (req, res) => {
  try {
    // Clear the cookie named "token"
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "Strict",
      secure: false,
      sameSite: "Lax",
    });

    return res.status(200).json({
      status: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};