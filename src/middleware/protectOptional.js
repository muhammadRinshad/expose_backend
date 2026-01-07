import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectOptional = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

export default protectOptional;
