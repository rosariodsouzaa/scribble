import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

import { config } from "./config.js";
import { initPostgres, pgStatus } from "./db/postgres.js";
import roomsRouter from "./routes/rooms.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import paymentsRouter from "./routes/payments.js";
import { registerHandlers } from "./socket/registerHandlers.js";
import { roomRepository } from "./repositories/RoomRepository.js";

const app = express();
app.use(cors()); // permissive in dev; behind the Vite proxy this is same-origin anyway
app.use(express.json());

// Initialize Neon PostgreSQL Database connection
initPostgres().catch((err) => console.error("[InitPostgres] Uncaught:", err));

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
const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"] },
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

  console.log(`[skribl] API + Socket.io listening on http://localhost:${config.port}`);
  console.log(`[Email]   Active Gateway: ${emailStatus}`);
});

