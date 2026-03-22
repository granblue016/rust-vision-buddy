import { Cv, CreateCvRequest, UpdateCvRequest } from "../types/cv";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${BASE_URL}/api/v1/cv`;

export const cvService = {
  // 1. Lấy danh sách CV
  async list(): Promise<Cv[]> {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Không thể tải danh sách CV");
    return response.json();
  },

  // 2. Tạo một CV mới
  async create(
    data: CreateCvRequest,
  ): Promise<{ id: string; message: string }> {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      console.error("Backend Error:", errorDetail);
      throw new Error("Lỗi khi tạo CV mới trên Server");
    }
    return response.json();
  },

  // 3. Lấy chi tiết một CV (Dùng để đổ dữ liệu vào Editor)
  async getById(id: string): Promise<Cv> {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Không tìm thấy dữ liệu CV");
    return response.json();
  },

  // 4. Cập nhật nội dung (Đổi từ PATCH sang PUT cho khớp với Rust)
  async update(id: string, data: UpdateCvRequest): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT", // Đổi PATCH thành PUT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      console.error("Update Error:", errorDetail);
      throw new Error("Không thể lưu thay đổi");
    }
  },

  // 5. Xóa CV
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Lỗi khi xóa bản ghi");
  },
};
