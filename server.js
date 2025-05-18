const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.static(path.join(__dirname)));

// Store users based on unique IPs
const onlineUsers = {};

io.on('connection', (socket) => {
  let userIP = '';

  // Receive and register user's IP
  socket.on('register-ip', (ip) => {
    userIP = ip;

    // Register IP only if not already stored
    if (!onlineUsers[ip]) {
      onlineUsers[ip] = socket.id;
      console.log(`✅ New IP connected: ${ip}`);
    }

    // Send name (IP) back to the current user
    socket.emit('your-name', ip);

    // Update all clients with the latest user list
    io.emit('user-list', Object.keys(onlineUsers));
  });

  // Handle message sending
  socket.on('send-message', ({ to, from, message }) => {
    const targetSocketId = onlineUsers[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive-message', { from, message });
    }
  });

  // On disconnect, remove IP only if it's the same socket ID
  socket.on('disconnect', () => {
    if (userIP && onlineUsers[userIP] === socket.id) {
      delete onlineUsers[userIP];
      console.log(`❌ IP disconnected: ${userIP}`);
      io.emit('user-list', Object.keys(onlineUsers));
    }
  });
});

// Start server
server.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Server is running on port 3000');
});
