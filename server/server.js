import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

// Routes setup
app.get("/", (req, res) => {
  res.send("Welcome to Quick Chat API");
});
app.use("/api/status", (req, res) => res.send("Server is live"));

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB in the background so the API can still start
const initializeDatabase = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB unavailable at startup:", error.message);
  }
};

await initializeDatabase();

const startServer = (port) => {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Trying ${nextPort} instead.`);
      server.removeAllListeners("error");
      startServer(nextPort);
      return;
    }

    console.error(error);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(
      `Server is running on PORT: ${port} => http://localhost:${port}/api/status`
    );
  });
};

if (process.env.NODE_ENV !== "production") {
  const PORT = Number(process.env.PORT) || 5001;
  startServer(PORT);
}

// Export server for Vercel
export default server;
