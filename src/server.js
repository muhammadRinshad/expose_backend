
// import http from "http";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import app from "./app.js";
// import { initSocket } from "./socket.js";

// dotenv.config();

// const server = http.createServer(app);
// initSocket(server); // initialize socket after app

// const PORT = process.env.PORT || 5000;

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     server.listen(PORT, () => {
//       console.log("🚀 Server running on port", PORT);
//     });
//   })
//   .catch((err) => console.error("MongoDB error:", err));
import http from "http";
import app from "./app.js";
import { initSocket } from "./socket.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// 1. Create the HTTP server using the Express app
const server = http.createServer(app);

// 2. Initialize Socket.io ON that server
initSocket(server);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // 3. IMPORTANT: Use 'server.listen', NOT 'app.listen'
    server.listen(PORT, () => {
      console.log(`🚀 Server & Socket running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB error:", err));