import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  like: {
    type: [mongoose.Schema.Types.ObjectId], // better to store user IDs
    default: []
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  userDetails: {
    type: Array,
    default: []
  },
  comments: [
    {
      comment: {
        type: String,
        required: true
      },
      user: {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        name: String,
        username: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

export const Tweet = mongoose.model("Tweet", tweetSchema);
