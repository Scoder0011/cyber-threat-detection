import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Dev-only proxy so the browser can hit the FastAPI backend without CORS pain.
// In production, VITE_API_BASE_URL / VITE_WS_BASE_URL point straight at the real host.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});