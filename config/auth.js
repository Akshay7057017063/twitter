import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/userSchema.js"; // ✅ Import User model
dotenv.config();

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated. No token provided.",
        success: false,
      });
    }

    // ✅ Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch full user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    req.user = user; // ✅ Set full user on req.user
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token.",
      success: false,
    });
  }
};

export default isAuthenticated;
