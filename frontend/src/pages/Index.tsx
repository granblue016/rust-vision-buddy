import { useEffect, useState } from "react";
import { cvService } from "../services/cvService";
import { Cv } from "../types/cv";
import { CreateCvButton } from "../components/CreateCvButton";
import { Link } from "react-router-dom";

const Index = () => {
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi Backend Rust để lấy danh sách CV
    cvService
      .list()
      .then((data) => {
        setCvs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <header className="flex justify-between items-center mb-12 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Career Compass</h1>
          <p className="text-slate-500">Quản lý các bản thảo CV của bạn</p>
        </div>
        <CreateCvButton />
      </header>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="group p-6 bg-white border rounded-xl shadow-sm hover:border-indigo-500 transition-all"
            >
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {cv.name}
              </h3>
              <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider">
                Cập nhật: {new Date(cv.updated_at).toLocaleDateString("vi-VN")}
              </p>
              <Link
                to={`/editor/${cv.id}`}
                className="inline-block w-full text-center py-2 rounded-md bg-slate-50 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
              >
                Chỉnh sửa CV
              </Link>
            </div>
          ))}

          {cvs.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl">
              <p className="text-slate-400">
                Bạn chưa có CV nào. Hãy bắt đầu bằng cách nhấn nút phía trên!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
