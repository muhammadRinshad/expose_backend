
// // // // import { Server } from "socket.io";

// // // // const onlineUsers = new Map(); // userId (string) -> socketId
// // // // let io;

// // // // export const initSocket = (server) => {
// // // //   io = new Server(server, {
// // // //     cors: {
// // // //       origin: "http://localhost:5173",
// // // //       credentials: true
// // // //     }
// // // //   });

// // // //   io.on("connection", (socket) => {
// // // //     const userId = socket.handshake.auth?.userId;
// // // //     if (userId) {
// // // //       onlineUsers.set(userId.toString(), socket.id);
// // // //     }

// // // //     socket.on("disconnect", () => {
// // // //       // Find and delete the specific user mapping
// // // //       for (let [uid, sid] of onlineUsers.entries()) {
// // // //         if (sid === socket.id) {
// // // //           onlineUsers.delete(uid);
// // // //           break;
// // // //         }
// // // //       }
// // // //     });
// // // //   });
// // // // };

// // // // export const emitToUser = (userId, event, payload) => {
// // // //   const socketId = onlineUsers.get(userId.toString());
// // // //   if (socketId && io) {
// // // //     io.to(socketId).emit(event, payload);
// // // //   }
// // // // };

// // // import { Server } from "socket.io";

// // // const onlineUsers = new Map(); // userId (string) -> socketId
// // // let io;

// // // export const initSocket = (server) => {
// // //   io = new Server(server, {
// // //     cors: {
// // //       origin: "http://localhost:5173",
// // //       credentials: true
// // //     }
// // //   });

// // //   io.on("connection", (socket) => {
// // //     const userId = socket.handshake.auth?.userId;
    
// // //     if (userId) {
// // //       const sId = userId.toString();
// // //       onlineUsers.set(sId, socket.id);
// // //       console.log(`✅ User Connected: ${sId} (Socket: ${socket.id})`);
// // //     }

// // //     socket.on("disconnect", () => {
// // //       for (let [uid, sid] of onlineUsers.entries()) {
// // //         if (sid === socket.id) {
// // //           onlineUsers.delete(uid);
// // //           console.log(`❌ User Disconnected: ${uid}`);
// // //           break;
// // //         }
// // //       }
// // //     });
// // //   });
// // // };

// // // export const emitToUser = (userId, event, payload) => {
// // //   if (!userId) return console.error("No userId provided to emitToUser");
  
// // //   const sId = userId.toString();
// // //   const socketId = onlineUsers.get(sId);
  
// // //   console.log(`📡 Attempting to emit to ${sId}. Online status: ${!!socketId}`);
  
// // //   if (socketId && io) {
// // //     io.to(socketId).emit(event, payload);
// // //   } else {
// // //     console.log(`⚠️ User ${sId} is offline. Notification saved to DB only.`);
// // //   }
// // // };
// // import { Server } from "socket.io";

// // const onlineUsers = new Map(); // userId (string) -> socketId
// // let io;

// // export const initSocket = (server) => {
// //   io = new Server(server, {
// //     cors: {
// //       origin: "http://localhost:5173",
// //       credentials: true
// //     }
// //   });

// //   io.on("connection", (socket) => {
// //     // Look for userId in auth object
// //     const userId = socket.handshake.auth?.userId;

// //     if (userId) {
// //       const stringId = userId.toString();
// //       onlineUsers.set(stringId, socket.id);
// //       console.log(`✅ Socket Connected: User ${stringId} is now online.`);
// //     }

// //     socket.on("disconnect", () => {
// //       // Clean up the map on disconnect
// //       for (let [uid, sid] of onlineUsers.entries()) {
// //         if (sid === socket.id) {
// //           onlineUsers.delete(uid);
// //           console.log(`❌ Socket Disconnected: User ${uid} went offline.`);
// //           break;
// //         }
// //       }
// //     });
// //   });
// // };

// // export const emitToUser = (userId, event, payload) => {
// //   if (!userId || !io) {
// //     console.log("❌ Cannot emit: userId or io instance missing");
// //     return;
// //   }

// //   const stringId = userId.toString();
// //   const socketId = onlineUsers.get(stringId);

// //   if (socketId) {
// //     console.log(`📡 Emitting ${event} to user ${stringId}`);
// //     io.to(socketId).emit(event, payload);
// //   } else {
// //     console.log(`⚠️ User ${stringId} is not online. Real-time emit skipped.`);
// //   }
// // };
// import { Server } from "socket.io";

// let io;
// const onlineUsers = new Map();

// export const initSocket = (server) => {
//   // We explicitly define the path to avoid 404s
//   io = new Server(server, {
//     path: "/socket.io/", 
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true
//     },
//     transports: ['websocket', 'polling'] // Allow both for better compatibility
//   });

//   io.on("connection", (socket) => {
//     const userId = socket.handshake.auth?.userId;
//     if (userId) {
//       onlineUsers.set(userId.toString(), socket.id);
//       console.log(`✅ User ${userId} connected. Socket ID: ${socket.id}`);
//     }

//     socket.on("disconnect", () => {
//       for (let [uid, sid] of onlineUsers.entries()) {
//         if (sid === socket.id) {
//           onlineUsers.delete(uid);
//           console.log(`❌ User ${uid} disconnected`);
//           break;
//         }
//       }
//     });
//   });

//   return io;
// };

// export const emitToUser = (userId, event, payload) => {
//   if (!io) {
//     console.error("❌ Socket.io not initialized!");
//     return;
//   }
//   const socketId = onlineUsers.get(userId.toString());
//   if (socketId) {
//     io.to(socketId).emit(event, payload);
//     console.log(`📡 Event '${event}' sent to user ${userId}`);
//   }
// };

import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (userId) {
      onlineUsers.set(userId.toString(), socket.id);
      console.log(`✅ User ${userId} connected (Socket: ${socket.id})`);
    }

    socket.on("disconnect", () => {
      for (let [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(uid);
          console.log(`❌ User ${uid} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, payload);
  }
};