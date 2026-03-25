import { Cv, CreateCvRequest, UpdateCvRequest } from "../types/cv";

/**
 * Cấu hình URL cho Backend Rust.
 */
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
const API_URL = `${BASE_URL}/api/v1/cvs`;

/**
 * Hàm hỗ trợ lấy Headers bảo mật và cấu hình Content-Type
 */
const getHeaders = (isPostOrPut = true): HeadersInit => {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    Accept: "application/json",
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
   */
  async list(): Promise<Cv[]> {
    const response = await fetch(`${API_URL}`, {
      method: "GET",
      headers: getHeaders(false),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || "Không thể tải danh sách CV");
    }
    return response.json();
  },

  /**
   * 2. Tạo một CV mới
   */
  async create(
    data: CreateCvRequest,
  ): Promise<{ id: string; message: string }> {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(errorDetail || "Lỗi khi tạo CV mới");
    }
    return response.json();
  },

  /**
   * 3. Lấy chi tiết một CV dựa trên ID (Dùng cho cả Editor và Preview)
   */
  async getById(id: string): Promise<Cv> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: getHeaders(false),
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("Không tìm thấy dữ liệu CV");
      const errorDetail = await response.text();
      throw new Error(errorDetail || "Lỗi hệ thống khi tải CV");
    }
    return response.json();
  },

  /**
   * 4. Cập nhật nội dung CV (Auto-save)
   * Tối ưu xử lý lỗi 422 từ Rust
   */
  async update(id: string, data: UpdateCvRequest): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        // Log chi tiết lỗi validation từ Struct của Rust (ví dụ: thiếu field, sai type)
        console.error("Rust Backend Validation Error (422):", errorDetail);
        throw new Error(errorDetail || "Dữ liệu không hợp lệ, lưu thất bại");
      }
    } catch (err: any) {
      console.error("cvService.update failed:", err);
      throw err;
    }
  },

  /**
   * 5. XUẤT PDF (CRITICAL FIX)
   * Triệu chứng: Treo 22s rồi lỗi 500.
   * Giải pháp: Gửi token qua Query Parameter để Backend dùng token đó
   * truy cập vào trang Preview mà không bị Middleware chặn lại.
   */
  async exportPdf(id: string): Promise<Blob> {
    const token = localStorage.getItem("auth_token");

    // Đính kèm token vào URL để Backend Rust có quyền truy cập trang preview
    const exportUrl = `${API_URL}/${id}/export?t=${token || ""}`;

    try {
      const response = await fetch(exportUrl, {
        method: "GET",
        headers: {
          ...getHeaders(false),
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error(
            "Server Rust bị treo khi render PDF. Hãy kiểm tra Chrome/Puppeteer trên Server.",
          );
        }
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Lỗi khi xuất bản PDF từ Server");
      }

      const blob = await response.blob();

      // Kiểm tra tính hợp lệ của file binary trả về
      if (blob.type !== "application/pdf" || blob.size < 100) {
        // PDF tối thiểu phải vài KB
        throw new Error(
          "Server trả về file PDF không hợp lệ (trống hoặc sai định dạng)",
        );
      }

      return blob;
    } catch (err: any) {
      console.error("🔥 Export PDF Error:", err.message);
      throw err;
    }
  },

  /**
   * 6. Xóa CV
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(errorDetail || "Lỗi khi xóa CV");
    }
  },
};
