import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, MoreHorizontal, Clock, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

interface CvDraft {
  id: string;
  name: string;
  template_id: string;
  updated_at: string;
}

const MOCK_DRAFTS: CvDraft[] = [
  { id: "1", name: "CV Frontend Developer", template_id: "modern-01", updated_at: "2026-03-22T10:30:00Z" },
  { id: "2", name: "CV Fullstack Engineer", template_id: "classic-01", updated_at: "2026-03-20T15:45:00Z" },
  { id: "3", name: "CV Intern Application", template_id: "minimal-01", updated_at: "2026-03-18T09:00:00Z" },
];

const DashboardPage = () => {
  const [drafts] = useState<CvDraft[]>(MOCK_DRAFTS);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 section-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">CV của tôi</h1>
            <p className="text-sm text-muted-foreground mt-1">Quản lý và chỉnh sửa các bản CV đã tạo</p>
          </div>
          <Link to="/editor/new">
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">
              <Plus className="w-4 h-4" /> Tạo CV mới
            </Button>
          </Link>
        </div>

        {drafts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Bạn chưa có CV nào. Hãy tạo bản đầu tiên!</p>
            <Link to="/editor/new">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="w-4 h-4" /> Bắt đầu tạo CV
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {drafts.map((draft) => (
              <Link
                key={draft.id}
                to={`/editor/${draft.id}`}
                className="group block"
              >
                <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-elevated hover:border-accent/30 hover:-translate-y-0.5 active:scale-[0.98]">
                  {/* Preview thumbnail */}
                  <div className="aspect-[210/160] bg-muted/50 border-b border-border flex items-center justify-center relative">
                    <FileText className="w-10 h-10 text-muted-foreground/40" />
                    <span className="absolute top-2 right-2 text-[10px] bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 font-medium uppercase tracking-wider">
                      {draft.template_id.replace("-", " ")}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors truncate">
                      {draft.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(draft.updated_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
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
