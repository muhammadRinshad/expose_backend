
// import dotenv from "dotenv";
// dotenv.config();

// import app from "./src/app.js";
// import connectDB from "./src/config/db.js";

// const PORT = process.env.PORT || 5000;

// connectDB().then(() => {
//   app.listen(PORT, () =>
//     console.log(`Server running on port ${PORT}`)
//   );
// });
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
 import app from "./src/app.js";
import { initSocket } from "./src/socket.js"

dotenv.config();

// 1. Create the HTTP server wrapper for Express
const server = http.createServer(app);

// 2. Attach Socket.io to that wrapper
initSocket(server);

const PORT = process.env.PORT || 5000;

// 3. Connect to Database and start the WRAPPER
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));