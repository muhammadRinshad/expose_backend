
import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { generateUniqueUsername } from "../utils/generateUsername.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("No email from Google"), null);

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email }]
        });

        if (!user) {
          const baseUsername = profile.displayName
            .replace(/\s+/g, "")
            .toLowerCase();

          const uniqueUsername = await generateUniqueUsername(baseUsername);

          user = await User.create({
            username: uniqueUsername,
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            isGoogleUser: true
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;
