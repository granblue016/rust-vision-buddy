/**
 * Danh sách các Font chữ hỗ trợ trong hệ thống CV.
 * Bao gồm cả font có chân (Serif) và không chân (Sans-serif).
 */
export const FONT_OPTIONS = [
  { id: "font-inter", label: "Inter (Mặc định)", value: "Inter, sans-serif" },
  { id: "font-roboto", label: "Roboto", value: "Roboto, sans-serif" },
  { id: "font-montserrat", label: "Montserrat", value: "Montserrat, sans-serif" },
  { id: "font-times", label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { id: "font-lora", label: "Lora (Có chân)", value: "Lora, serif" },
  { id: "font-playfair", label: "Playfair Display", value: "Playfair Display, serif" },
  { id: "font-system", label: "Hệ thống", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
];

/**
 * Danh sách kích thước chữ (Font Size).
 * Dải kích thước từ 10px đến 20px để người dùng tùy biến tối đa.
 */
export const FONT_SIZE_OPTIONS = [
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "13", value: "13px" },
  { label: "14", value: "14px" }, // Mức chuẩn phổ biến
  { label: "15", value: "15px" },
  { label: "16", value: "16px" },
  { label: "17", value: "17px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
];

/**
 * Các mức giãn dòng (Line Height).
 * Giúp CV trông thoáng hoặc đặc hơn tùy vào lượng nội dung.
 */
export const LINE_HEIGHT_OPTIONS = [
  { label: "Chật", value: 1.2 },
  { label: "Vừa", value: 1.5 },
  { label: "Rộng", value: 1.8 },
];

/**
 * Màu sắc chủ đạo gợi ý (Primary Colors).
 */
export const COLOR_PALETTE = [
  "#4f46e5", // Indigo
  "#000000", // Black
  "#2563eb", // Blue
  "#16a34a", // Green
  "#dc2626", // Red
  "#7c3aed", // Violet
];
