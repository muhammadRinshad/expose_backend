

import express from "express";
import {
    acceptFollowRequest,
    getNotifications,
  getUserProfile,
  rejectFollowRequest,
  searchUsers,
  toggleFollow
} from "../controllers/user.controller.js";
import protectOptional from "../middleware/protectOptional.js";
import protect from "../middleware/protect.js";

const userRouter = express.Router();

userRouter.get("/notifications", protect, getNotifications);
userRouter.get("/", protectOptional, searchUsers); // 🔍 search
userRouter.get("/:username", protectOptional, getUserProfile);
userRouter.post("/follow/:id", protect, toggleFollow);
userRouter.post("/accept/:id", protect, acceptFollowRequest);
userRouter.post("/reject/:id", protect, rejectFollowRequest);

export default userRouter;
