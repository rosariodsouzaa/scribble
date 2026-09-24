import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Same-origin dev: the browser talks only to the Vite server (5173), which proxies
// REST + the Socket.io websocket to the backend (3001). Mirrors a prod reverse proxy
// and sidesteps CORS. The `ws: true` flag is what lets the socket upgrade through.
export default defineConfig(({ mode }) => ({
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
  esbuild: {
    // Drop console logs and debugger in production builds to reduce bundle size & client CPU
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    target: "es2020",
    minify: "esbuild",
    cssMinify: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Optimized code splitting: chunks are cached independently by browsers
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-tfjs": ["@tensorflow/tfjs", "@tensorflow-models/mobilenet"],
          "vendor-icons": ["lucide-react"],
          "vendor-socket": ["socket.io-client"],
        },
      },
    },
  },
}));

