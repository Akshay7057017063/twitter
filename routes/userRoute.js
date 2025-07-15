import express from "express";
import {
  Login,
  Register,
  logout,
  bookmark,
  follow,
  unfollow,
  getMyProfile,
  getOtherUsers,
  updateProfile
} from "../controllers/userController.js";

import isAuthenticated from "../config/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// 🔐 Auth Routes
router.post("/register", Register);
router.post("/login", Login);
router.get("/logout", logout);

// 👤 Profile Routes
router.get("/profile/:id", isAuthenticated, getMyProfile);

// ✅ GET other users or specific user (frontend expects /otheruser/:id or /otheruser/all)
router.get("/otheruser/:id", isAuthenticated, getOtherUsers);

// ✅ Update Profile (Avatar & Bio)
router.put("/update-profile", isAuthenticated, upload.single("avatar"), updateProfile);

// 📌 Bookmark Routes
router.put("/bookmark/:id", isAuthenticated, bookmark);

// 👥 Follow/Unfollow Routes
router.post("/follow/:id", isAuthenticated, follow);
router.post("/unfollow/:id", isAuthenticated, unfollow);

export default router;
