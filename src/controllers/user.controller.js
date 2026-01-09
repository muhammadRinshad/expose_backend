
import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  const viewer = req.user;

  const profileUser = await User.findOne({
    username: req.params.username.toLowerCase()
  }).select("-password");

  if (!profileUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const isOwner = viewer && viewer._id.equals(profileUser._id);

  const isFollowing =
    viewer && profileUser.followers.includes(viewer._id);

  const isRequested =
    viewer && profileUser.followRequests.includes(viewer._id);

  if (profileUser.isPrivate && !isOwner && !isFollowing) {
  return res.json({
    _id: profileUser._id, // ✅ include this
    username: profileUser.username,
    avatar: profileUser.avatar,
    bio: profileUser.bio,
    isPrivate: true,
    isRequested
  });
}


  res.json({
    ...profileUser.toObject(),
    isOwner,
    isFollowing,
    isRequested,
    isPrivate: false
  });
};

export const toggleFollow = async (req, res) => {
  const loggedInUserId = req.user._id;
  const targetUserId = req.params.id;

  if (loggedInUserId.equals(targetUserId)) {
    return res.status(400).json({ message: "You can't follow yourself" });
  }

  const user = await User.findById(loggedInUserId);
  const target = await User.findById(targetUserId);

  if (!target) {
    return res.status(404).json({ message: "User not found" });
  }

  /* 🔒 PRIVATE ACCOUNT → REQUEST TOGGLE */
  if (target.isPrivate) {
    const alreadyRequested = target.followRequests.includes(loggedInUserId);

    if (alreadyRequested) {
      // ❌ CANCEL REQUEST
      target.followRequests.pull(loggedInUserId);
      await target.save();
      return res.json({ requested: false });
    } else {
      // ✅ SEND REQUEST
      target.followRequests.push(loggedInUserId);
      await target.save();
      return res.json({ requested: true });
    }
  }

  /* 🌍 PUBLIC ACCOUNT → FOLLOW TOGGLE */
  const isFollowing = user.following.includes(targetUserId);

  if (isFollowing) {
    user.following.pull(targetUserId);
    target.followers.pull(loggedInUserId);
  } else {
    user.following.push(targetUserId);
    target.followers.push(loggedInUserId);
  }

  await user.save();
  await target.save();

  res.json({ following: !isFollowing });
};




export const searchUsers = async (req, res) => {
  const search = req.query.search || "";

  const users = await User.find({
    username: { $regex: search, $options: "i" },
    _id: { $ne: req.user?._id }
  }).select("username avatar followers");

  res.json(users);
};


export const acceptFollowRequest = async (req, res) => {
  const loggedInUser = await User.findById(req.user._id);
  const requesterId = req.params.id;

  if (!loggedInUser.followRequests.includes(requesterId)) {
    return res.status(400).json({ message: "No request found" });
  }

  loggedInUser.followRequests.pull(requesterId);
  loggedInUser.followers.push(requesterId);

  const requester = await User.findById(requesterId);
  requester.following.push(loggedInUser._id);

  await loggedInUser.save();
  await requester.save();

  res.json({ success: true });
};


export const rejectFollowRequest = async (req, res) => {
  const loggedInUser = await User.findById(req.user._id);
  const requesterId = req.params.id;

  loggedInUser.followRequests.pull(requesterId);
  await loggedInUser.save();

  res.json({ rejected: true });
};


export const getNotifications = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("followRequests", "username avatar");

  res.json({
    followRequests: user.followRequests
  });
};
/* GET ALL POSTS (Home feed – exclude private users) */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: "user",
        select: "username avatar isPrivate",
        match: { isPrivate: false } // ✅ Only public users
      })
      .sort({ createdAt: -1 });

    // Filter out posts whose user is null (private)
    const visiblePosts = posts.filter(post => post.user !== null);

    res.json(visiblePosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};
