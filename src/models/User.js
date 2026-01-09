
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: String,
    googleId: String,

    avatar: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },

    isPrivate: {
      type: Boolean,
      default: false
    },

    // 🔥 FOLLOW SYSTEM
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🆕 FOLLOW REQUESTS (FOR PRIVATE ACCOUNTS)
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
