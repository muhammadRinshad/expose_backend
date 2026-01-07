

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";
import cloudinary from "../utils/cloudinary.js";


/* REGISTER */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* LOGIN */
export const login = async (req, res) => {
  try {
    console.log("working login");
    
    const { identifier, password } = req.body;
    console.log("req.body....:",req.body);
    

    if (!identifier || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });
    console.log("user:.............:",user);
    

    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    console.log("match.......:",match);
    
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    console.log("token............:",token);
    

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GOOGLE CALLBACK */
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.redirect("http://localhost:5173/");
  } catch (err) {
    res.redirect("http://localhost:5173/login");
  }
};

/* GET ME */
export const getMe = async (req, res) => {
  console.log("req. user...:",req.user);
  
  console.log("running meeee");
  
  res.json(req.user);
};


export const editProfile = async (req, res) => {
  try {
      console.log("EDIT PROFILE HIT");
    console.log("FILE EXISTS ?", !!req.file);
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const { username, email, bio, isPrivate } = req.body;

    if (username) user.username = username.toLowerCase();
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (isPrivate !== undefined)
      user.isPrivate = isPrivate === "true" || isPrivate === true;

    // ✅ IMAGE UPLOAD (FIXED)
    if (req.file) {
      console.log("FILE NAME:", req.file.originalname);
      console.log("FILE SIZE:", req.file.size);
      console.log("FILE TYPE:", req.file.mimetype);
      const uploadToCloudinary = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "recent-projects/users", // 👈 USE YOUR EXISTING ROOT
              resource_type: "image"
            },
            (error, result) => {
              if (error) {
                  console.log("❌ CLOUDINARY ERROR:", error);
                reject(error);}
                else{
                console.log("✅ CLOUDINARY RESULT:", result.secure_url);
               resolve(result);
                }
                
            }
          );

          stream.end(req.file.buffer);
        });

      const result = await uploadToCloudinary();
      user.avatar = result.secure_url;
    }

    await user.save();
     console.log("✅ USER SAVED WITH AVATAR:", user.avatar);
    res.json(user);
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};
