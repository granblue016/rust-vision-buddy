import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, FileText, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { cvService } from "@/services/cvService";
import { Cv } from "@/types/cv";

/**
 * HELPER: Loại bỏ thẻ HTML để hiển thị tên CV sạch sẽ trên Dashboard
 */
const stripHtml = (text: string | null | undefined): string => {
  if (!text) return "CV chưa đặt tên";
  return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
};

const DashboardPage = () => {
  const [drafts, setDrafts] = useState<Cv[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // 1. Lấy danh sách CV từ Backend
  useEffect(() => {
    const fetchCvList = async () => {
      try {
        const data = await cvService.list();
        if (data) {
          setDrafts(data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách CV:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCvList();
  }, []);

  // 2. Hàm xử lý tạo CV mới
  const handleCreateNewCv = async () => {
    setIsCreating(true);
    try {
      const newCvRequest = {
        name: "CV mới chưa đặt tên",
        templateId: "modern-01",
      };

      const response = await cvService.create(newCvRequest as any);

      if (response && response.id) {
        navigate(`/editor/${response.id}`);
      }
    } catch (err) {
      console.error("Lỗi khi tạo CV:", err);
      alert("Không thể kết nối với Backend để tạo CV mới.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 section-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              CV của tôi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý và chỉnh sửa các bản CV chuyên nghiệp
            </p>
          </div>

          <Button
            onClick={handleCreateNewCv}
            disabled={isCreating}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isCreating ? "Đang tạo..." : "Tạo CV mới"}
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Đang tải danh sách CV...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Bạn chưa có bản CV nào trong hệ thống.
            </p>
            <Button
              onClick={handleCreateNewCv}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Bắt đầu tạo ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {drafts.map((cv) => (
              <Link key={cv.id} to={`/editor/${cv.id}`} className="group block">
                <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-elevated hover:border-accent/30 hover:-translate-y-0.5">
                  <div className="aspect-[210/160] bg-muted/50 border-b border-border flex items-center justify-center relative">
                    <FileText className="w-10 h-10 text-muted-foreground/40" />
                    <span className="absolute top-2 right-2 text-[10px] bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 font-medium uppercase">
                      {/* Sử dụng layoutData thay vì layout_data */}
                      {cv.layoutData?.templateId?.replace("-", " ") || "Modern"}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-sm text-foreground group-hover:text-accent truncate">
                      {/* Đảm bảo hiển thị tên đã làm sạch HTML */}
                      {stripHtml(cv.name)}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {/* Sử dụng updatedAt thay vì updated_at */}
                      {cv.updatedAt
                        ? new Date(cv.updatedAt).toLocaleDateString("vi-VN")
                        : "Vừa xong"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
