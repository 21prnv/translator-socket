const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("joinRoom", (roomId) => {
    try {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    } catch (err) {
      console.error(`Error joining room ${roomId}: ${err}`);
    }
  });

  socket.on("message", (data, ack) => {
    try {
      console.log(`Received message for room ${data.roomId}:`, data);
      io.to(data.roomId).emit("message", {
        originalText: data.originalText,
        translatedText: data.translatedText,
        originalLanguage: data.originalLanguage,
      });
      if (ack) {
        ack({ status: "message sent" });
      }
    } catch (err) {
      console.error(
        `Error broadcasting message to room ${data.roomId}: ${err}`
      );
      if (ack) {
        ack({ status: "error", error: err.message });
      }
    }
  });

  socket.on("error", (err) => {
    console.error(`Socket error for client ${socket.id}: ${err}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
