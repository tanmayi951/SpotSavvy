const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const parkingRoutes = require("./parking");
const reservationRoutes = require("./reservations");
const paymentRoutes = require("./payments");
const analyticsRoutes = require("./analytics");
const { simulateSensorUpdates } = require("./sensorSimulator");
const { broadcastParkingUpdate } = require("./socketService");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("<h1>✅ SpotSavvy AI Backend is running!</h1><p>This is an API/WebSocket server. The data is currently being streamed securely to your mobile app and dashboard.</p>"));
app.use("/api/parking", parkingRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// WebSocket: real-time parking updates
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send current parking state on connect
  socket.emit("parking_snapshot", db.getAllSpots());

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Simulate IoT sensor updates every 5 seconds
setInterval(() => {
  const updatedSpots = simulateSensorUpdates();
  broadcastParkingUpdate(io, updatedSpots);
}, 5000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`SpotSavvy AI Backend running on http://localhost:${PORT}`);
});

module.exports = { io };
