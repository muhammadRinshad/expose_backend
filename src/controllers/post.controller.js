import Post from "../models/Post.js";
import cloudinary from "../utils/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "Images required" });
    }

    const uploadImages = async (file) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (err, result) => {
            if (err) reject(err);
            resolve(result.secure_url);
          }
        ).end(file.buffer);
      });

    const imageUrls = await Promise.all(
      req.files.map((file) => uploadImages(file))
    );

    const post = await Post.create({
      user: req.user._id,
      images: imageUrls,
      caption: req.body.caption || ""
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Post failed" });
  }
};

/* ✅ GET ALL POSTS (Home feed – future use) */
export const getAllPosts = async (req, res) => {
  try {
    // Get all posts
    const posts = await Post.find()
      .populate("user", "username avatar isPrivate followers")
      .sort({ createdAt: -1 });

    // Filter out private posts where current user doesn't follow
    const filteredPosts = posts.filter(post => {
      if (!post.user.isPrivate) return true; // public posts
      if (!req.user) return false; // no user logged in
      // check if current user follows the private account
      return post.user.followers.some(f => f.toString() === req.user._id.toString());
    });

    res.json(filteredPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

