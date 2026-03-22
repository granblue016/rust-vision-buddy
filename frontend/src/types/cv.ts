export interface CvTheme {
  font_family: string;
  font_size: string;
  line_height: number;
  primary_color: string;
}

// Định nghĩa từng mục nhỏ trong một Section (Ví dụ: 1 công ty trong phần Kinh nghiệm)
export interface CvSectionItem {
  id: string;
  title: string; // Ví dụ: Senior Developer / Đại học Bách Khoa
  subtitle?: string; // Ví dụ: Công ty ABC / Khoa CNTT
  date?: string; // Ví dụ: 2020 - Hiện tại
  description?: string; // Nội dung chi tiết/Mô tả công việc
}

// Định nghĩa cấu trúc của một Section lớn
export interface CvSection {
  id: string; // UUID để định danh khi kéo thả
  type: "experience" | "education" | "skills" | "custom" | "personal_info";
  title: string; // Tên hiển thị: "Kinh nghiệm làm việc", "Học vấn"...
  items: CvSectionItem[];
}

export interface CvLayoutData {
  theme: CvTheme;
  sections: CvSection[]; // Thay đổi từ Record<string, unknown>[] sang mảng Section cụ thể
}

export interface Cv {
  id: string;
  user_id: string;
  name: string;
  layout_data: CvLayoutData;
  created_at: string;
  updated_at: string;
}

export interface CreateCvRequest {
  name: string;
}

export interface UpdateCvRequest {
  name?: string;
  layout_data: CvLayoutData;
}
