
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// import "./config/passport.js"; 

// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";

// const app = express();

// app.use(express.json());

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true
//   })
// );

// app.use(cookieParser());

// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);

// export default app;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./config/passport.js"; 

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";


const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);

/* ✅ FIX: plural users */
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);


export default app;
