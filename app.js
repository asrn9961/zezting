let myIP = '';
let myName = '';
let currentUser = '';

const socket = io();
const userList = document.getElementById("userList");
const chatHeader = document.getElementById("chatHeader");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

// Get IP address and send to server
fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    myIP = data.ip;
    socket.emit("register-ip", myIP);
  });

socket.on("your-name", (name) => {
  myName = name;
});

socket.on("user-list", (users) => {
  userList.innerHTML = '';
  users.forEach((user) => {
    if (user !== myName) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${user}</strong><span style="font-size: 12px;">Online</span>`;
      li.onclick = () => selectUser(user);
      userList.appendChild(li);
    }
  });
});

socket.on("receive-message", ({ from, message }) => {
  if (from === currentUser) {
    const msg = document.createElement("div");
    msg.className = "message incoming";
    msg.innerText = message;
    messages.appendChild(msg);
  }
});

function selectUser(name) {
  currentUser = name;
  chatHeader.innerText = `${name} (Online)`;
  messages.innerHTML = "";
}

function sendMessage() {
  if (!currentUser || !messageInput.value.trim()) return;

  const msg = document.createElement("div");
  msg.className = "message outgoing";
  msg.innerText = messageInput.value;
  messages.appendChild(msg);

  socket.emit("send-message", {
    to: currentUser,
    message: messageInput.value,
  });

  messageInput.value = "";
}
