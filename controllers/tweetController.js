import { Tweet } from "../models/tweetSchema.js";
import { User } from "../models/userSchema.js";

// ✅ Create Tweet
export const createTweet = async (req, res) => {
  try {
    const { description } = req.body;
    const id = req.user._id;

    if (!description) {
      return res.status(400).json({
        message: "Description is required.",
        success: false,
      });
    }

    const user = await User.findById(id).select("-password");

    await Tweet.create({
      description,
      userId: id,
      userDetails: user,
    });

    return res.status(201).json({
      message: "Tweet created successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Create Tweet Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Delete Tweet
export const deleteTweet = async (req, res) => {
  try {
    const { id } = req.params;
    await Tweet.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Tweet deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Delete Tweet Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Like / Dislike Tweet
export const likeOrDislike = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const tweetId = req.params.id;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found", success: false });
    }

    if (tweet.like.includes(loggedInUserId)) {
      await Tweet.findByIdAndUpdate(tweetId, { $pull: { like: loggedInUserId } });
      return res.status(200).json({ message: "Tweet disliked", success: true });
    } else {
      await Tweet.findByIdAndUpdate(tweetId, { $push: { like: loggedInUserId } });
      return res.status(200).json({ message: "Tweet liked", success: true });
    }
  } catch (error) {
    console.error("Like/Dislike Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get All Tweets (User + Following)
export const getAllTweets = async (req, res) => {
  try {
    const id = req.user._id;
    const loggedInUser = await User.findById(id);

    const userTweets = await Tweet.find({ userId: id });
    const followingTweets = await Promise.all(
      loggedInUser.following.map((followedId) =>
        Tweet.find({ userId: followedId })
      )
    );

    const allTweets = userTweets.concat(...followingTweets);

    return res.status(200).json({
      tweets: allTweets,
      success: true,
    });
  } catch (error) {
    console.error("Get All Tweets Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get Only Following Tweets
export const getFollowingTweets = async (req, res) => {
  try {
    const id = req.user._id;
    const loggedInUser = await User.findById(id);

    const followingTweets = await Promise.all(
      loggedInUser.following.map((followedId) =>
        Tweet.find({ userId: followedId })
      )
    );

    return res.status(200).json({
      tweets: [].concat(...followingTweets),
      success: true,
    });
  } catch (error) {
    console.error("Get Following Tweets Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Comment on Tweet
export const commentOnTweet = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { comment } = req.body;
    const id = req.user._id;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }

    const user = await User.findById(id).select("name username _id");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    tweet.comments.push({
      comment,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
      },
      createdAt: new Date(),
    });

    await tweet.save();

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Comment Error:", error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

// ✅ NEW: Get All Tweets Globally (for universal feed)
export const getAllTweetsForFeed = async (req, res) => {
  try {
    const allTweets = await Tweet.find().sort({ createdAt: -1 });
    return res.status(200).json({
      tweets: allTweets,
      success: true,
    });
  } catch (error) {
    console.error("Get All Global Tweets Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
