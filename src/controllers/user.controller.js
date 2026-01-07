
import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  const viewer = req.user; // may be null

  const profileUser = await User.findOne({
    username: req.params.username.toLowerCase()
  }).select("-password");

  if (!profileUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const isOwner = viewer && viewer._id.equals(profileUser._id);

  if (profileUser.isPrivate && !isOwner) {
    return res.json({
      username: profileUser.username,
      avatar: profileUser.avatar,
      bio: profileUser.bio,
      isPrivate: true
    });
  }

  return res.json({
    ...profileUser.toObject(),
    isPrivate: false
  });
};
