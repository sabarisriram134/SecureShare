import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/files': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/access': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
});
