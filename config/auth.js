import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/userSchema.js";

dotenv.config();

const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated. No token provided.",
        success: false,
      });
    }

    if (!process.env.JWT_SECRET) {
      console.warn("⚠️ JWT_SECRET is missing from environment variables.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    req.user = user;
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
