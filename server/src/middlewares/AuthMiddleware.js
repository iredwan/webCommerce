import UserModel from "../model/UserModel.js";
import UserOTPModel from "../model/UserOTPModel.js";
import { TokenDecode } from "../utility/tokenUtility.js";

// Authentication Middleware
export const protect = async (req, res, next) => {
  try {
    let token = req.headers['token'] || req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'You are not logged in. Please log in to get access.',
      });
    }

    const decoded = TokenDecode(token);
    if (!decoded) {
      return res.status(401).json({
        status: false,
        message: 'Authentication failed. Invalid token.',
      });
    }

    const user = await UserModel.findById(decoded.user_id);

    if (user) {
      req.user = {
        id: user._id,
        cus_email: user.cus_email,
        cus_phone: user.cus_phone,
        role: user.role,
      };
      return next();
    }

    // fallback to OTP user
    const otpUser = await UserOTPModel.findOne({
      $or: [{ cus_email: decoded.email }, { cus_phone: decoded.phone }],
    });

    if (!otpUser) {
      res.clearCookie('token');
      return res.status(401).json({
        status: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (otpUser.isBanned) {
      return res.status(403).json({
        status: false,
        message: 'Your account has been banned. Please contact support.',
      });
    }

    req.user = {
      id: otpUser._id,
      cus_email: otpUser.cus_email,
      role: decoded.role,
    };

    next();

  } catch (error) {
    console.error('Protect middleware error:', error);
    return res.status(500).json({
      status: false,
      message: 'Error verifying user authentication.',
    });
  }
};




export const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        status: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
