
import express from "express";
import {
  createPost,
  getAllPosts,
  getPostsByUser,
  toggleLike
} from "../controllers/post.controller.js";

import protect from "../middleware/protect.js";
import protectOptional from "../middleware/protectOptional.js";
import upload from "../middleware/multerMemory.js";

const postRoutes = express.Router();

/* ✅ CREATE POST */
postRoutes.post("/", protect, upload.array("images", 10), createPost);

/* ✅ HOME FEED (LOGIN REQUIRED) */
postRoutes.get("/", protect, getAllPosts);

/* ✅ PROFILE POSTS */
postRoutes.get("/user/:userId", protectOptional, getPostsByUser);
postRoutes.post("/like/:postId", protect, toggleLike);


export default postRoutes;
