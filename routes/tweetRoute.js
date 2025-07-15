import express from "express";
import {
  createTweet,
  deleteTweet,
  getAllTweets,
  getFollowingTweets,
  getAllTweetsForFeed, // ✅ new controller
  likeOrDislike,
  commentOnTweet
} from "../controllers/tweetController.js";

import isAuthenticated from "../config/auth.js";

const router = express.Router();

// ✍️ Tweet Actions
router.post("/create", isAuthenticated, createTweet);
router.delete("/delete/:id", isAuthenticated, deleteTweet);
router.put("/like/:id", isAuthenticated, likeOrDislike);
router.post("/comment/:id", isAuthenticated, commentOnTweet);

// 📌 Feed Routes
router.get("/alltweets/:id", isAuthenticated, getAllTweets); // user's own tweets
router.get("/followingtweets/:id", isAuthenticated, getFollowingTweets); // followed users
router.get("/all", isAuthenticated, getAllTweetsForFeed); // ✅ all tweets for global feed

export default router;
