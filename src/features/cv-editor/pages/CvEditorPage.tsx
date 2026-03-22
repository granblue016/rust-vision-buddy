import { useCallback } from "react";
import { useCvStore } from "@/stores/useCvStore";
import { toast } from "sonner";
import LayoutSidebar from "../components/LayoutSidebar";
import EditorToolbar from "../components/EditorToolbar";
import CvPreviewCanvas from "../components/CvPreviewCanvas";

const CvEditorPage = () => {
  const { setIsSaving, markSaved } = useCvStore();

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      markSaved();
      toast.success("Đã lưu thành công!");
    } catch {
      toast.error("Lỗi khi lưu dữ liệu.");
      setIsSaving(false);
    }
  }, [setIsSaving, markSaved]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorToolbar onSave={handleSave} />
      <div className="flex flex-1 overflow-hidden">
        <LayoutSidebar />
        <CvPreviewCanvas />
      </div>
    </div>
  );
};

export default CvEditorPage;
