import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Đổi host thành "0.0.0.0" để dễ dàng truy cập từ các thiết bị khác trong mạng nội bộ
    host: "0.0.0.0",
    port: 8080,
    strictPort: true, // Đảm bảo luôn dùng đúng port 8080, nếu bận sẽ báo lỗi thay vì tự đổi port
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    // Chỉ kích hoạt tagger khi ở chế độ phát triển (development)
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      // Cấu hình alias khớp tuyệt đối với tsconfig.json
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tối ưu hóa việc build project
  build: {
    outDir: "dist",
    sourcemap: mode === "development",
    // Giảm dung lượng file sau khi build
    minify: "esbuild",
    reportCompressedSize: false,
  },
}));
