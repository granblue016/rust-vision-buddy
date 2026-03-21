import { useState } from "react";
import { cvService } from "../services/cvService";
import { useNavigate } from "react-router-dom";

export const CreateCvButton = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      setLoading(true);
      // Gọi API tạo CV mới (Khớp với backend Rust của bạn)
      const result = await cvService.create({ name: "CV Mới của tôi" });

      // Chuyển hướng sang trang chỉnh sửa (chúng ta sẽ tạo route này sau)
      navigate(`/editor/${result.id}`);
    } catch (error) {
      console.error("Lỗi tạo CV:", error);
      alert(
        "Không thể kết nối với server Rust. Hãy chắc chắn backend đang chạy!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-slate-400 transition-all"
    >
      {loading ? "Đang khởi tạo..." : "+ Tạo CV Mới"}
    </button>
  );
};
