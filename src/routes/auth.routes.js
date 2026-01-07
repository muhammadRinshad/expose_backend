
import express from "express";
import passport from "passport";
import {
  register,
  login,
  googleCallback,
  getMe,
  editProfile
} from "../controllers/auth.controller.js";
// import protect from "../middleware/protect.js";
import protectOptional from "../middleware/protectOptional.js";
import upload from "../middleware/multerMemory.js"; // memory storage

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
/////////edit profo
router.put(
  "/edit",
  protectOptional,
  upload.single("avatar"), // 👈 THIS IS WHERE IT IS USED
  editProfile
);
// 🔒 STRICT AUTH
router.get("/me", protectOptional, getMe);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

router.put("/edit", protectOptional, upload.single("avatar"), editProfile);


export default router;
