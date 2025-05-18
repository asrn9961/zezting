const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  // Temporary name until IP is registered
  onlineUsers[socket.id] = "Loading...";

  // Receive IP from client and use as name
  socket.on("register-ip", (ip) => {
    onlineUsers[socket.id] = ip;
    io.emit("user-list", Object.values(onlineUsers));
    socket.emit("your-name", ip);
  });

  // Handle sending message
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

  // On disconnect
  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("user-list", Object.values(onlineUsers));
  });
});

// Serve the HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
