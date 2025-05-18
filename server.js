const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// ✅ Serve static files from the root directory
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  onlineUsers[socket.id] = "Anonymous";

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

// ✅ Serve the index.html on root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
