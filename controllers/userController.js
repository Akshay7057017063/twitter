import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Register Controller
export const Register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists.",
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 16);

    await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ Login Controller
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const tokenData = { userId: user._id };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "None",
        secure: true,
      })
      .json({
        message: `Welcome back ${user.name}`,
        user,
        success: true,
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ Logout Controller
export const logout = (req, res) => {
  return res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "None",
      secure: true,
    })
    .json({
      message: "User logged out successfully.",
      success: true,
    });
};

// ✅ Bookmark Controller
export const bookmark = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const tweetId = req.params.id;

    const user = await User.findById(loggedInUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const isBookmarked = user.bookmarks.includes(tweetId);

    await User.findByIdAndUpdate(loggedInUserId, {
      [isBookmarked ? "$pull" : "$push"]: { bookmarks: tweetId },
    });

    return res.status(200).json({
      message: isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks",
      success: true,
    });
  } catch (error) {
    console.error("Bookmark error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ Get My Profile (fallback if ID not passed)
export const getMyProfile = async (req, res) => {
  try {
    const id = req.params.id || req.user._id;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ Get Other Users OR Specific User by ID
export const getOtherUsers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ message: "Invalid or missing user ID", success: false });
    }

    if (id !== "all") {
      const user = await User.findById(id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }
      return res.status(200).json({ user, success: true });
    }

    const otherUsers = await User.find({ _id: { $ne: req.user._id } }).select("-password");

    return res.status(200).json({ otherUsers, success: true });
  } catch (error) {
    console.error("Get other users error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ Follow User
export const follow = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const userId = req.params.id;

    const [loggedInUser, user] = await Promise.all([
      User.findById(loggedInUserId),
      User.findById(userId),
    ]);

    if (!loggedInUser || !user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (user.followers.includes(loggedInUserId)) {
      return res.status(400).json({
        message: `You already follow ${user.name}`,
        success: false,
      });
    }

    await user.updateOne({ $push: { followers: loggedInUserId } });
    await loggedInUser.updateOne({ $push: { following: userId } });

    return res.status(200).json({
      message: `${loggedInUser.name} followed ${user.name}`,
      success: true,
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ Unfollow User
export const unfollow = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const userId = req.params.id;

    const [loggedInUser, user] = await Promise.all([
      User.findById(loggedInUserId),
      User.findById(userId),
    ]);

    if (!loggedInUser || !user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (!loggedInUser.following.includes(userId)) {
      return res.status(400).json({
        message: `You are not following ${user.name}`,
        success: false,
      });
    }

    await user.updateOne({ $pull: { followers: loggedInUserId } });
    await loggedInUser.updateOne({ $pull: { following: userId } });

    return res.status(200).json({
      message: `${loggedInUser.name} unfollowed ${user.name}`,
      success: true,
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ Update Profile (Avatar + Bio)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bio } = req.body;

    const updateData = {};
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }
    if (bio) {
      updateData.bio = bio;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    console.error("Update profile error:", error.message || error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
