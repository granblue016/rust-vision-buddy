import { Cv, CreateCvRequest, UpdateCvRequest } from "../types/cv";

// URL mặc định cho backend Rust
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
const API_URL = `${BASE_URL}/api/v1/cvs`;

/**
 * Hàm hỗ trợ lấy Token từ LocalStorage hoặc Firebase
 * (Bạn có thể điều chỉnh tùy theo cách lưu Token của mình)
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const cvService = {
  /**
   * 1. Lấy danh sách toàn bộ CV của người dùng
   */
  async list(): Promise<Cv[]> {
    const response = await fetch(`${API_URL}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("List CV Error:", errorMsg);
      throw new Error("Không thể tải danh sách CV. Vui lòng kiểm tra kết nối.");
    }
    return response.json();
  },

  /**
   * 2. Tạo một CV mới
   * Trả về ID của CV vừa tạo để điều hướng sang trang Editor
   */
  async create(
    data: CreateCvRequest,
  ): Promise<{ id: string; message: string }> {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      console.error("Backend Create Error:", errorDetail);
      throw new Error("Lỗi khi tạo CV mới trên Server");
    }
    return response.json();
  },

  /**
   * 3. Lấy chi tiết một CV dựa trên ID
   */
  async getById(id: string): Promise<Cv> {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("GetById Error:", errorMsg);
      throw new Error("Không tìm thấy dữ liệu CV");
    }
    return response.json();
  },

  /**
   * 4. Cập nhật nội dung CV (Đồng bộ với Rust Backend)
   */
  async update(id: string, data: UpdateCvRequest): Promise<void> {
    console.log("Payload gửi lên Rust:", data);

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      // Backend Rust sẽ trả về chi tiết lỗi nếu JSON không khớp Struct
      console.error("Rust Update Error Detail:", errorDetail);
      throw new Error(`Lưu thất bại: ${response.statusText}`);
    }

    console.log("Cập nhật Database thành công!");
  },

  /**
   * 5. Xóa CV khỏi hệ thống
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("Delete Error:", errorMsg);
      throw new Error("Lỗi khi xóa CV");
    }
  },
};
