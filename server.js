const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the root (public) folder
app.use(express.static("."));

// Route to serve the homepage (chat UI)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let onlineUsers = {};

io.on("connection", (socket) => {
  onlineUsers[socket.id] = "Loading...";

socket.on("register-ip", (ip) => {
  onlineUsers[socket.id] = ip;
  io.emit("user-list", Object.values(onlineUsers));
  socket.emit("your-name", ip);
});


  io.emit("user-list", Object.values(onlineUsers));
  socket.emit("your-name", browserName);

  socket.on("send-message", ({ to, message }) => {
    for (const id in onlineUsers) {
      if (onlineUsers[id] === to) {
        io.to(id).emit("receive-message", {
          from: onlineUsers[socket.id],
          message
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

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
