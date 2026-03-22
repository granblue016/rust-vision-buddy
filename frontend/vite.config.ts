import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Đổi host thành "0.0.0.0" để dễ dàng truy cập trên Windows
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    // Chỉ kích hoạt tagger khi ở chế độ phát triển
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      // Cấu hình alias chuẩn để khớp với tsconfig.json bạn đã sửa
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Bổ sung phần này để tối ưu hóa việc build project sau này
  build: {
    outDir: "dist",
    sourcemap: mode === "development",
  },
}));
