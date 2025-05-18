const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  // TEMP name until IP is registered
  onlineUsers[socket.id] = "Loading...";

  socket.on("register-ip", (ip) => {
    onlineUsers[socket.id] = ip;
    io.emit("user-list", Object.values(onlineUsers));
    socket.emit("your-name", ip);
  });

  socket.on("send-message", ({ to, message }) => {
    for (const id in onlineUsers) {
      if (onlineUsers[id] === to) {
        io.to(id).emit("receive-message", {
          from: onlineUsers[socket.id],
          message,
        });
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("user-list", Object.values(onlineUsers));
  });
});

// START THE SERVER
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
