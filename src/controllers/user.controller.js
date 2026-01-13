// import { emitToUser } from "../socket.js";
// import Notification from "../models/Notification.js";

// import Post from "../models/Post.js";
// import User from "../models/User.js";



// export const getUserProfile = async (req, res) => {
//   const viewer = req.user;

//   const profileUser = await User.findOne({
//     username: req.params.username.toLowerCase()
//   }).select("-password");

//   if (!profileUser) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   const isOwner = viewer && viewer._id.equals(profileUser._id);
//   const isFollowing =
//     viewer && profileUser.followers.some(id => id.equals(viewer._id));
//   const isRequested =
//     viewer && profileUser.followRequests.some(id => id.equals(viewer._id));

//   /* 🔒 PRIVATE PROFILE → LIMITED DATA */
//   if (profileUser.isPrivate && !isOwner && !isFollowing) {
//     return res.json({
//       _id: profileUser._id,
//       username: profileUser.username,
//       avatar: profileUser.avatar,
//       isPrivate: true,
//       isOwner: false,
//       isFollowing: false,
//       isRequested
//     });
//   }

//   /* ✅ FULL PROFILE */
//   res.json({
//     ...profileUser.toObject(),
//     isOwner,
//     isFollowing,
//     isRequested,
//     isPrivate: profileUser.isPrivate
//   });
// };


// export const searchUsers = async (req, res) => {
//   const search = req.query.search || "";

//   const users = await User.find({
//     username: { $regex: search, $options: "i" },
//     _id: { $ne: req.user?._id }
//   }).select("username avatar followers");

//   res.json(users);
// };





// export const toggleFollow = async (req, res) => {
//   const loggedInUserId = req.user._id;
//   const targetUserId = req.params.id;

//   if (loggedInUserId.equals(targetUserId)) return res.status(400).json({ message: "Can't follow self" });

//   const user = await User.findById(loggedInUserId);
//   const target = await User.findById(targetUserId);

//   if (!target) return res.status(404).json({ message: "User not found" });

//   if (target.isPrivate) {
//     const alreadyRequested = target.followRequests.includes(loggedInUserId);

//     if (alreadyRequested) {
//       target.followRequests.pull(loggedInUserId);
//       await target.save();
//       return res.json({ requested: false });
//     } else {
//       target.followRequests.push(loggedInUserId);
//       await target.save();

//       // ✅ Create DB Notification
//       await Notification.create({
//         type: "follow_request",
//         sender: loggedInUserId,
//         receiver: target._id
//       });

//       // ✅ Emit Real-time
//       emitToUser(target._id, "notification", {
//         type: "follow_request",
//         sender: { _id: user._id, username: user.username, avatar: user.avatar }
//       });

//       return res.json({ requested: true });
//     }
//   }

//   // Public Logic
//   const isFollowing = user.following.includes(targetUserId);
//   if (isFollowing) {
//     user.following.pull(targetUserId);
//     target.followers.pull(loggedInUserId);
//   } else {
//     user.following.push(targetUserId);
//     target.followers.push(loggedInUserId);
    
//     // Notify for public follow
//     emitToUser(target._id, "notification", {
//       type: "follow",
//       sender: { _id: user._id, username: user.username, avatar: user.avatar }
//     });
//   }
//   await user.save();
//   await target.save();
//   res.json({ following: !isFollowing });
// };

// export const acceptFollowRequest = async (req, res) => {
//   const loggedInUser = await User.findById(req.user._id);
//   const requesterId = req.params.id;

//   if (!loggedInUser.followRequests.includes(requesterId)) {
//     return res.status(400).json({ message: "No request found" });
//   }

//   loggedInUser.followRequests.pull(requesterId);
//   loggedInUser.followers.push(requesterId);

//   const requester = await User.findById(requesterId);
//   requester.following.push(loggedInUser._id);

//   await loggedInUser.save();
//   await requester.save();

//   // ✅ Create DB Notification for acceptance
//   await Notification.create({
//     type: "follow_accept",
//     sender: loggedInUser._id,
//     receiver: requesterId
//   });

//   // ✅ Emit to requester
//   emitToUser(requesterId, "notification", {
//     type: "follow_accept",
//     sender: {
//       _id: loggedInUser._id,
//       username: loggedInUser.username,
//       avatar: loggedInUser.avatar
//     }
//   });

//   res.json({ success: true });
// };
// export const rejectFollowRequest = async (req, res) => {
//   const loggedInUser = await User.findById(req.user._id);
//   const requesterId = req.params.id;
//   loggedInUser.followRequests.pull(requesterId);
//   await loggedInUser.save();
//   res.json({ rejected: true });
// };




// export const getNotifications = async (req, res) => {
//   const notifications = await Notification.find({
//     receiver: req.user._id
//   })
//     .populate("sender", "username avatar")
//     .populate("post", "images")
//     .sort({ createdAt: -1 });

//   const followRequests = await User.findById(req.user._id)
//     .populate("followRequests", "username avatar");

//   res.json({
//     followRequests: followRequests.followRequests,
//     notifications
//   });
// };

import { emitToUser } from "../socket.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  const viewer = req.user;
  const profileUser = await User.findOne({
    username: req.params.username.toLowerCase()
  }).select("-password");

  if (!profileUser) return res.status(404).json({ message: "User not found" });

  const isOwner = viewer && viewer._id.equals(profileUser._id);
  const isFollowing = viewer && profileUser.followers.some(id => id.equals(viewer._id));
  const isRequested = viewer && profileUser.followRequests.some(id => id.equals(viewer._id));

  if (profileUser.isPrivate && !isOwner && !isFollowing) {
    return res.json({
      _id: profileUser._id,
      username: profileUser.username,
      avatar: profileUser.avatar,
      isPrivate: true,
      isOwner: false,
      isFollowing: false,
      isRequested
    });
  }

  res.json({
    ...profileUser.toObject(),
    isOwner,
    isFollowing,
    isRequested,
    isPrivate: profileUser.isPrivate
  });
};

export const searchUsers = async (req, res) => {
  const search = req.query.search || "";
  const users = await User.find({
    username: { $regex: search, $options: "i" },
    _id: { $ne: req.user?._id }
  }).select("username avatar followers");
  res.json(users);
};

export const toggleFollow = async (req, res) => {
  const loggedInUserId = req.user._id;
  const targetUserId = req.params.id;

  if (loggedInUserId.equals(targetUserId)) return res.status(400).json({ message: "Can't follow self" });

  const user = await User.findById(loggedInUserId);
  const target = await User.findById(targetUserId);

  if (!target) return res.status(404).json({ message: "User not found" });

  if (target.isPrivate) {
    const alreadyRequested = target.followRequests.includes(loggedInUserId);

    if (alreadyRequested) {
      target.followRequests.pull(loggedInUserId);
      // ✅ Remove notification if request is cancelled
      await Notification.findOneAndDelete({
        type: "follow_request",
        sender: loggedInUserId,
        receiver: target._id
      });
      await target.save();
      return res.json({ requested: false });
    } else {
      target.followRequests.push(loggedInUserId);
      await target.save();

      await Notification.create({
        type: "follow_request",
        sender: loggedInUserId,
        receiver: target._id
      });

      emitToUser(target._id, "notification", {
        type: "follow_request",
        sender: { _id: user._id, username: user.username, avatar: user.avatar }
      });

      return res.json({ requested: true });
    }
  }

  const isFollowing = user.following.includes(targetUserId);
  if (isFollowing) {
    user.following.pull(targetUserId);
    target.followers.pull(loggedInUserId);
    // Remove public follow notification
    await Notification.findOneAndDelete({ type: "follow", sender: loggedInUserId, receiver: target._id });
  } else {
    user.following.push(targetUserId);
    target.followers.push(loggedInUserId);
    
    await Notification.create({ type: "follow", sender: loggedInUserId, receiver: target._id });
    emitToUser(target._id, "notification", {
      type: "follow",
      sender: { _id: user._id, username: user.username, avatar: user.avatar }
    });
  }
  await user.save();
  await target.save();
  res.json({ following: !isFollowing });
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

  // Delete the original "request" notification and create "accept" notification
  await Notification.findOneAndDelete({ type: "follow_request", sender: requesterId, receiver: loggedInUser._id });

  await Notification.create({
    type: "follow_accept",
    sender: loggedInUser._id,
    receiver: requesterId
  });

  emitToUser(requesterId, "notification", {
    type: "follow_accept",
    sender: { _id: loggedInUser._id, username: loggedInUser.username, avatar: loggedInUser.avatar }
  });

  res.json({ success: true });
};

export const rejectFollowRequest = async (req, res) => {
  const loggedInUser = await User.findById(req.user._id);
  const requesterId = req.params.id;
  loggedInUser.followRequests.pull(requesterId);
  await Notification.findOneAndDelete({ type: "follow_request", sender: requesterId, receiver: loggedInUser._id });
  await loggedInUser.save();
  res.json({ rejected: true });
};

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ receiver: req.user._id })
    .populate("sender", "username avatar")
    .populate("post", "images")
    .sort({ createdAt: -1 });

  const user = await User.findById(req.user._id).populate("followRequests", "username avatar");

  res.json({
    followRequests: user.followRequests,
    notifications
  });
};