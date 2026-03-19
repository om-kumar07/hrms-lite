import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // proxy API calls to the FastAPI backend during local development
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // generate source maps for production debugging
    sourcemap: false,
    // chunk size warning threshold
    chunkSizeWarningLimit: 800,
  },
});
