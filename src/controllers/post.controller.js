
// import Post from "../models/Post.js";
// import User from "../models/User.js";
// import Notification from "../models/Notification.js";
// import cloudinary from "../utils/cloudinary.js";
// import { emitToUser } from "../socket.js";

// export const createPost = async (req, res) => {
//   try {
//     if (!req.files?.length) return res.status(400).json({ message: "Images required" });

//     const uploadImages = (file) =>
//       new Promise((resolve, reject) =>
//         cloudinary.uploader.upload_stream({ folder: "posts" }, (err, result) => {
//           if (err) reject(err);
//           resolve(result.secure_url);
//         }).end(file.buffer)
//       );

//     const imageUrls = await Promise.all(req.files.map(uploadImages));

//     const post = await Post.create({
//       user: req.user._id,
//       images: imageUrls,
//       caption: req.body.caption || ""
//     });

//     res.status(201).json(post);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Post failed" });
//   }
// };

// export const getAllPosts = async (req, res) => {
//   try {
//     const viewerId = req.user._id;
//     const posts = await Post.find()
//       .populate("user", "username avatar isPrivate followers")
//       .sort({ createdAt: -1 });

//     const filtered = posts.filter(post => {
//       if (post.user._id.equals(viewerId)) return true;
//       if (!post.user.isPrivate) return true;
//       return post.user.followers.some(f => f.equals(viewerId));
//     });

//     res.json(filtered);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch posts" });
//   }
// };

// export const getPostsByUser = async (req, res) => {
//   try {
//     const targetUser = await User.findById(req.params.userId);
//     if (!targetUser) return res.status(404).json({ message: "User not found" });

//     const viewer = req.user;
//     const isOwner = viewer?._id.equals(targetUser._id);
//     const isFollowing = viewer && targetUser.followers.some(id => id.equals(viewer._id));

//     if (targetUser.isPrivate && !isOwner && !isFollowing)
//       return res.status(403).json({ message: "Private account" });

//     const posts = await Post.find({ user: targetUser._id })
//       .sort({ createdAt: -1 })
//       .select("images likes caption")
//       .lean();

//     res.json(posts.map(p => ({
//       _id: p._id,
//       image: p.images[0],
//       likesCount: p.likes.length,
//       caption: p.caption
//     })));
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch posts" });
//   }
// };

// export const toggleLike = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.postId).populate("user");
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     const userId = req.user._id;
//     const isCurrentlyLiked = post.likes.some(id => id.equals(userId));

//     if (isCurrentlyLiked) {
//       // UNLIKE
//       post.likes = post.likes.filter(id => !id.equals(userId));
//     } else {
//       // LIKE
//       post.likes.push(userId);

//       // Notify owner (if it's not the owner liking their own post)
//       if (!post.user._id.equals(userId)) {
//         await Notification.create({
//           type: "like",
//           sender: userId,
//           receiver: post.user._id,
//           post: post._id
//         });

//         emitToUser(post.user._id, "notification", {
//           type: "like",
//           sender: {
//             _id: req.user._id,
//             username: req.user.username,
//             avatar: req.user.avatar
//           },
//           postId: post._id
//         });
//       }
//     }

//     await post.save();
//     res.json({ liked: !isCurrentlyLiked, likesCount: post.likes.length });
//   } catch (err) {
//     res.status(500).json({ message: "Error toggling like" });
//   }
// };

import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import cloudinary from "../utils/cloudinary.js";
import { emitToUser } from "../socket.js";

export const createPost = async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: "Images required" });

    const uploadImages = (file) =>
      new Promise((resolve, reject) =>
        cloudinary.uploader.upload_stream({ folder: "posts" }, (err, result) => {
          if (err) reject(err);
          resolve(result.secure_url);
        }).end(file.buffer)
      );

    const imageUrls = await Promise.all(req.files.map(uploadImages));

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

export const getAllPosts = async (req, res) => {
  try {
    const viewerId = req.user._id;
    const posts = await Post.find()
      .populate("user", "username avatar isPrivate followers")
      .sort({ createdAt: -1 });

    const filtered = posts.filter(post => {
      if (post.user._id.equals(viewerId)) return true;
      if (!post.user.isPrivate) return true;
      return post.user.followers.some(f => f.equals(viewerId));
    });

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const viewer = req.user;
    const isOwner = viewer?._id.equals(targetUser._id);
    const isFollowing = viewer && targetUser.followers.some(id => id.equals(viewer._id));

    if (targetUser.isPrivate && !isOwner && !isFollowing)
      return res.status(403).json({ message: "Private account" });

    const posts = await Post.find({ user: targetUser._id })
      .sort({ createdAt: -1 })
      .select("images likes caption")
      .lean();

    res.json(posts.map(p => ({
      _id: p._id,
      image: p.images[0],
      likesCount: p.likes.length,
      caption: p.caption
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const isCurrentlyLiked = post.likes.some(id => id.equals(userId));

    if (isCurrentlyLiked) {
      // UNLIKE
      post.likes = post.likes.filter(id => !id.equals(userId));
      
      // ✅ Instagram Flow: Remove notification from DB when unliking
      await Notification.findOneAndDelete({
        type: "like",
        sender: userId,
        post: post._id
      });
    } else {
      // LIKE
      post.likes.push(userId);

      if (!post.user._id.equals(userId)) {
        await Notification.create({
          type: "like",
          sender: userId,
          receiver: post.user._id,
          post: post._id
        });

        // ✅ Include Post Image in Socket payload
        emitToUser(post.user._id, "notification", {
          type: "like",
          sender: {
            _id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
          },
          postId: post._id,
          postImage: post.images[0] // First image of the post
        });
      }
    }

    await post.save();
    res.json({ liked: !isCurrentlyLiked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Error toggling like" });
  }
};