import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http"; // Node's built-in HTTP server

import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";

const app = express();
const server = http.createServer(app); // Create an HTTP server instance

app.use(express.json());
const corsOptions = {
  origin: 'https://get-yourstay.vercel.app/', // Adjust to your frontend URL
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(cookieParser());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "https://get-yourstay.vercel.app/",
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUsers.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    io.to(receiver.socketId).emit("getMessage", data);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});


const PORT = process.env.PORT || 8800;
// Routes

app.use("/api/demo", (req, res) => {
  res.json({ "msg": "Server is running hello world - ", PORT });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);


server.listen(PORT, () => {
  console.log(`Server and Socket.io listening on port ${PORT}`);
});

