import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Same-origin dev: the browser talks only to the Vite server (5173), which proxies
// REST + the Socket.io websocket to the backend (3001). Mirrors a prod reverse proxy
// and sidesteps CORS. The `ws: true` flag is what lets the socket upgrade through.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind 0.0.0.0 + :: so 127.0.0.1 and localhost both work (preview probe friendly)
    port: 5173,
    strictPort: true, // fail loudly instead of silently hopping to 5174 if 5173 is taken
    proxy: {
      "/api": "http://localhost:3001",
      "/socket.io": { target: "http://localhost:3001", ws: true },
    },
  },
});
