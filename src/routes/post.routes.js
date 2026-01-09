import express from "express";
import { createPost, getAllPosts } from "../controllers/post.controller.js";
import protect from "../middleware/protect.js";
import upload from "../middleware/multerMemory.js";

const postRoutes = express.Router();

/* ✅ CREATE POST */
postRoutes.post("/", protect, upload.array("images", 10), createPost);

/* ✅ GET POSTS */
postRoutes.get("/", protect, getAllPosts);

export default postRoutes;
