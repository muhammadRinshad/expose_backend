
import express from "express";
import { getUserProfile } from "../controllers/user.controller.js";
import protectOptional from "../middleware/protectOptional.js";

const userRouter = express.Router();

userRouter.get("/:username", protectOptional, getUserProfile);

export default userRouter;
