import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // Đã xóa .tsx để fix lỗi ts(5097)
import "./index.css"; // Đã sửa đường dẫn từ ../ thành ./ vì file hiện ở src

// Khởi tạo root và render ứng dụng
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element. Check your index.html");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
