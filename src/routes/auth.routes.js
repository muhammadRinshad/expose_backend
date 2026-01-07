
import express from "express";
import passport from "passport";
import {
  register,
  login,
  googleCallback,
  getMe
} from "../controllers/auth.controller.js";
// import protect from "../middleware/protect.js";
import protectOptional from "../middleware/protectOptional.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login"
  }),
  googleCallback
);

// 🔒 STRICT AUTH
router.get("/me", protectOptional, getMe);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;
