import { Tweet } from "../models/tweetSchema.js";
import { User } from "../models/userSchema.js";

// Create Tweet
export const createTweet = async (req, res) => {
  try {
    const { description, id } = req.body;
    if (!description || !id) {
      return res.status(401).json({
        message: "Fields are required.",
        success: false
      });
    }

    const user = await User.findById(id).select("-password");
    await Tweet.create({
      description,
      userId: id,
      userDetails: user
    });

    return res.status(201).json({
      message: "Tweet created successfully.",
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete Tweet
export const deleteTweet = async (req, res) => {
  try {
    const { id } = req.params;
    await Tweet.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Tweet deleted successfully.",
      success: true
    });
  } catch (error) {
    console.log(error);
  }
};

// Like / Dislike Tweet
export const likeOrDislike = async (req, res) => {
  try {
    const loggedInUserId = req.body.id;
    const tweetId = req.params.id;
    const tweet = await Tweet.findById(tweetId);

    if (tweet.like.includes(loggedInUserId)) {
      await Tweet.findByIdAndUpdate(tweetId, { $pull: { like: loggedInUserId } });
      return res.status(200).json({ message: "User disliked your tweet." });
    } else {
      await Tweet.findByIdAndUpdate(tweetId, { $push: { like: loggedInUserId } });
      return res.status(200).json({ message: "User liked your tweet." });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get All Tweets (user + following)
export const getAllTweets = async (req, res) => {
  try {
    const id = req.params.id;
    const loggedInUser = await User.findById(id);

    const loggedInUserTweets = await Tweet.find({ userId: id });
    const followingUserTweet = await Promise.all(
      loggedInUser.following.map((otherUsersId) => Tweet.find({ userId: otherUsersId }))
    );

    return res.status(200).json({
      tweets: loggedInUserTweets.concat(...followingUserTweet)
    });
  } catch (error) {
    console.log(error);
  }
};

// Get Only Following Tweets
export const getFollowingTweets = async (req, res) => {
  try {
    const id = req.params.id;
    const loggedInUser = await User.findById(id);

    const followingUserTweet = await Promise.all(
      loggedInUser.following.map((otherUsersId) => Tweet.find({ userId: otherUsersId }))
    );

    return res.status(200).json({
      tweets: [].concat(...followingUserTweet)
    });
  } catch (error) {
    console.log(error);
  }
};

// ✅ Comment on Tweet
export const commentOnTweet = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { comment, id } = req.body;

    if (!comment || !id) {
      return res.status(400).json({
        success: false,
        message: "Comment or user ID is missing"
      });
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found"
      });
    }

    const user = await User.findById(id).select("name username _id");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    tweet.comments.push({
      comment,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username
      },
      createdAt: new Date()
    });

    await tweet.save();

    res.status(200).json({
      success: true,
      message: "Comment added successfully"
    });
  } catch (error) {
    console.log("Comment error:", error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};
