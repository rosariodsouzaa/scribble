import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import compression from "compression";
import { Server } from "socket.io";

import { config } from "./config.js";
import { initPostgres, pgStatus, cleanupExpiredOtps } from "./db/postgres.js";
import roomsRouter from "./routes/rooms.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import paymentsRouter from "./routes/payments.js";
import { registerHandlers } from "./socket/registerHandlers.js";
import { roomRepository } from "./repositories/RoomRepository.js";

const app = express();

// Optimization 1: HTTP response compression (drastically cuts AWS egress data transfer costs)
app.use(compression());

app.use(cors()); // permissive in dev; behind the Vite proxy this is same-origin anyway
app.use(express.json({ limit: "256kb" })); // limit payload size to prevent memory exhaustion

// Optimization 2: Cache-control headers for API responses
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.set("Cache-Control", "no-cache, must-revalidate");
  }
  next();
});

// Initialize Neon PostgreSQL Database connection
initPostgres()
  .then(() => {
    // Schedule periodic lightweight DB housekeeping every 15 minutes to keep DB size minimal
    setInterval(() => {
      cleanupExpiredOtps().catch(() => {});
    }, 15 * 60 * 1000);
  })
  .catch((err) => console.error("[InitPostgres] Uncaught:", err));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    rooms: roomRepository.size,
    uptime: process.uptime(),
    db: {
      provider: pgStatus.provider,
      connected: pgStatus.isConnected,
      error: pgStatus.error,
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/payments", paymentsRouter);

const server = http.createServer(app);

// Optimization 3: Low-overhead Socket.io engine configuration
const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"] },
  pingInterval: 25000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6, // 1MB buffer limit to prevent memory bloat
  perMessageDeflate: {
    threshold: 1024, // Compress websocket payloads exceeding 1KB (saves egress bandwidth)
  },
  httpCompression: true,
});

// Initialize RoomRepository with Socket.io reference
roomRepository.setIo(io);
roomRepository.startSweeper();

io.on("connection", (socket) => registerHandlers(io, socket));

server.listen(config.port, () => {
  const emailStatus = config.resendApiKey
    ? `Resend API (${config.resendFrom})`
    : config.smtp.host && config.smtp.user
    ? `SMTP (${config.smtp.from})`
    : "Local Simulation Mode (Add RESEND_API_KEY or SMTP to .env for live inbox delivery)";

  console.log(`[skribl] API + Socket.io listening on http://localhost:${config.port} (Gzip & WebSocket Deflate active)`);
  console.log(`[Email]   Active Gateway: ${emailStatus}`);
});


