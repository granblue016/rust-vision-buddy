import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { cvService } from "@/services/cvService";
import { Cv, CvSection, CvSectionItem } from "@/types/cv";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid"; // Hãy đảm bảo bạn đã cài: npm install uuid @types/uuid

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cv, setCv] = useState<Cv | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCvData = async () => {
      try {
        if (id) {
          const data = await cvService.getById(id);
          setCv(data);
        }
      } catch (err) {
        setError("Không thể tải cấu hình CV.");
      } finally {
        setLoading(false);
      }
    };
    loadCvData();
  }, [id]);

  // --- Logic Xử lý Nội dung ---

  const handleAddSection = (type: CvSection["type"]) => {
    if (!cv) return;
    const newSection: CvSection = {
      id: uuidv4(),
      type: type,
      title: type === "experience" ? "Kinh nghiệm làm việc" : "Học vấn",
      items: [
        {
          id: uuidv4(),
          title: "Tiêu đề mới",
          subtitle: "Tên công ty / Trường học",
          date: "2024 - Hiện tại",
          description: "Mô tả chi tiết nội dung...",
        },
      ],
    };

    setCv({
      ...cv,
      layout_data: {
        ...cv.layout_data,
        sections: [...cv.layout_data.sections, newSection],
      },
    });
    toast.info(`Đã thêm mục ${newSection.title}`);
  };

  const handleUpdateSectionItem = (
    sectionId: string,
    itemId: string,
    field: keyof CvSectionItem,
    value: string,
  ) => {
    if (!cv) return;
    const updatedSections = cv.layout_data.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map((item) =>
            item.id === itemId ? { ...item, [field]: value } : item,
          ),
        };
      }
      return section;
    });

    setCv({
      ...cv,
      layout_data: { ...cv.layout_data, sections: updatedSections },
    });
  };

  const handleSave = async () => {
    if (!cv || !id) return;
    setSaving(true);
    try {
      await cvService.update(id, {
        name: cv.name,
        layout_data: cv.layout_data,
      });
      toast.success("Lưu dữ liệu thành công!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Lỗi khi lưu dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-20">Đang tải...</div>;
  if (error || !cv)
    return <div className="text-center p-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={cv.name}
            onChange={(e) => setCv({ ...cv, name: e.target.value })}
            className="text-xl font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none w-full"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md disabled:bg-indigo-300"
          >
            {saving ? "Đang lưu..." : "Lưu & Thoát"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cột trái: LIVE PREVIEW JSON */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6 self-start">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex justify-between">
            Dữ liệu CV (Real-time)
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded">
              LIVE
            </span>
          </h2>
          <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[600px]">
            <pre className="text-blue-400 text-[11px] font-mono leading-relaxed">
              {JSON.stringify(cv.layout_data, null, 2)}
            </pre>
          </div>
        </div>

        {/* Cột phải: CONTENT EDITOR */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4">Cấu trúc nội dung</h2>

            {cv.layout_data.sections.map((section) => (
              <div
                key={section.id}
                className="mb-8 p-4 border border-slate-100 rounded-lg bg-slate-50/50"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-indigo-600 uppercase text-xs tracking-wider">
                    {section.title}
                  </span>
                </div>

                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-3 bg-white p-4 rounded-md shadow-sm border border-slate-200 mb-3"
                  >
                    <input
                      type="text"
                      placeholder="Tiêu đề (Vị trí/Chức danh)"
                      value={item.title}
                      onChange={(e) =>
                        handleUpdateSectionItem(
                          section.id,
                          item.id,
                          "title",
                          e.target.value,
                        )
                      }
                      className="w-full font-semibold text-slate-800 border-none p-0 focus:ring-0"
                    />
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Tổ chức/Công ty"
                        value={item.subtitle}
                        onChange={(e) =>
                          handleUpdateSectionItem(
                            section.id,
                            item.id,
                            "subtitle",
                            e.target.value || "",
                          )
                        }
                        className="flex-1 text-sm text-slate-500 border-none p-0 focus:ring-0"
                      />
                      <input
                        type="text"
                        placeholder="Thời gian"
                        value={item.date}
                        onChange={(e) =>
                          handleUpdateSectionItem(
                            section.id,
                            item.id,
                            "date",
                            e.target.value || "",
                          )
                        }
                        className="w-32 text-sm text-slate-400 text-right border-none p-0 focus:ring-0"
                      />
                    </div>
                    <textarea
                      placeholder="Mô tả công việc..."
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateSectionItem(
                          section.id,
                          item.id,
                          "description",
                          e.target.value || "",
                        )
                      }
                      className="w-full text-sm text-slate-600 border-none p-0 focus:ring-0 resize-none"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* Nút thêm mới */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => handleAddSection("experience")}
                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all"
              >
                + Thêm Kinh nghiệm
              </button>
              <button
                onClick={() => handleAddSection("education")}
                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all"
              >
                + Thêm Học vấn
              </button>
            </div>
          </section>

          {/* Theme Settings (Giữ nguyên từ bản trước) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4">Giao diện</h2>
            <input
              type="color"
              value={cv.layout_data.theme.primary_color}
              onChange={(e) =>
                setCv({
                  ...cv,
                  layout_data: {
                    ...cv.layout_data,
                    theme: {
                      ...cv.layout_data.theme,
                      primary_color: e.target.value,
                    },
                  },
                })
              }
              className="w-full h-10 rounded cursor-pointer"
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default EditorPage;
