import { Cv, CreateCvRequest, UpdateCvRequest } from "../types/cv";

/**
 * Cấu hình URL cho Backend Rust.
 * Ưu tiên lấy từ biến môi trường VITE_BACKEND_URL.
 * Nếu không có, mặc định dùng http://localhost:8080 (Khớp với backend/src/main.rs)
 */
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/v1/cvs`;

/**
 * Hàm hỗ trợ lấy Token từ LocalStorage để thực hiện Authentication
 */
const getAuthHeaders = (isPostOrPut = true) => {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    // Sửa lỗi CORS: Đảm bảo header khớp với Backend
    Accept: "application/json",
    "x-requested-with": "XMLHttpRequest",
  };

  if (isPostOrPut) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const cvService = {
  /**
   * 1. Lấy danh sách toàn bộ CV của người dùng
   * Endpoint: GET /api/v1/cvs
   */
  async list(): Promise<Cv[]> {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "GET",
        headers: getAuthHeaders(false),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Không thể tải danh sách CV");
      }
      return await response.json();
    } catch (err: any) {
      console.error("List CV Error:", err);
      throw err;
    }
  },

  /**
   * 2. Tạo một CV mới
   * Endpoint: POST /api/v1/cvs
   */
  async create(
    data: CreateCvRequest,
  ): Promise<{ id: string; message: string }> {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(errorDetail || "Lỗi khi tạo CV mới");
      }
      return await response.json();
    } catch (err: any) {
      console.error("Backend Create Error:", err);
      throw err;
    }
  },

  /**
   * 3. Lấy chi tiết một CV dựa trên ID (UUID)
   * Giải quyết lỗi "net::ERR_CONNECTION_REFUSED" bằng cách dùng đúng Port 8080
   */
  async getById(id: string): Promise<Cv> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(false),
      });

      if (!response.ok) {
        // Xử lý lỗi 400 (Bad Request) khi ID không phải UUID hợp lệ
        if (response.status === 400) {
          throw new Error("Định dạng ID không hợp lệ (Phải là UUID)");
        }
        if (response.status === 404) {
          throw new Error("Không tìm thấy dữ liệu CV trên hệ thống");
        }
        const errorDetail = await response.text();
        throw new Error(errorDetail || "Lỗi hệ thống khi tải CV");
      }
      return await response.json();
    } catch (err: any) {
      console.error("GetById Error:", err);
      // Cập nhật thông báo lỗi để người dùng biết port thực tế đang dùng
      throw new Error(
        err.message || `Kết nối Backend thất bại tại ${BASE_URL}`,
      );
    }
  },

  /**
   * 4. Cập nhật nội dung CV (Sử dụng Method PUT)
   * Nhận vào UpdateCvRequest chứa layout_data
   */
  async update(id: string, data: UpdateCvRequest): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        // Log chi tiết để debug lỗi Mismatch Struct với Rust Backend
        console.error("Rust Struct Mismatch Details:", errorDetail);
        throw new Error(
          "Lưu thất bại: Cấu trúc dữ liệu không khớp với Backend",
        );
      }
    } catch (err: any) {
      console.error("Update Error:", err);
      throw err;
    }
  },

  /**
   * 5. Xóa CV khỏi hệ thống
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(errorDetail || "Lỗi khi xóa CV khỏi Database");
      }
    } catch (err: any) {
      console.error("Delete Error:", err);
      throw err;
    }
  },
};
