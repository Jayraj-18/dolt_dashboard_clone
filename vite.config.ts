import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    allowedHosts: ['main.d0lt.local', 'dashboard.d0lt.local'],
    host: '0.0.0.0',
    port: 3001, // different from Next.js
  },
  proxy: {
    '/api': 'http://localhost:5000',
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));