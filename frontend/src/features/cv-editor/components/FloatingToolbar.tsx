import React, { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { Bold, Italic, Underline, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  editor: Editor | null;
}

const FloatingToolbar = ({ editor }: FloatingToolbarProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { selection } = editor.state;

      // Logic quan trọng: Chỉ hiện khi có bôi đen văn bản (không rỗng) và editor đang focus
      if (selection.empty || !editor.isFocused) {
        setVisible(false);
        return;
      }

      const { view } = editor;
      const start = view.coordsAtPos(selection.from);
      const end = view.coordsAtPos(selection.to);

      // Tính toán vị trí ở giữa vùng chọn
      const left = (start.left + end.left) / 2;
      const top = start.top - 45; // Đẩy lên cao hơn một chút để tránh che văn bản

      setPosition({ top, left });
      setVisible(true);
    };

    editor.on("selectionUpdate", update);
    editor.on("focus", update);
    editor.on("blur", () => setTimeout(() => setVisible(false), 200));

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("focus", update);
    };
  }, [editor]);

  if (!editor || !visible) return null;

  // HÀM XỬ LÝ KÍCH THƯỚC CHỮ
  const runFontSizeCommand = (size: string) => {
    // Ép kiểu 'as any' để tránh lỗi TS nếu extension font-size chưa khai báo type đầy đủ
    (editor.chain().focus() as any).setFontSize(size).run();
  };

  // HÀM XỬ LÝ MÀU SẮC
  const runColorCommand = (color: string) => {
    const chain = editor.chain().focus() as any;
    if (color === "inherit") {
      chain.unsetColor().run();
    } else {
      chain.setColor(color).run();
    }
  };

  const FONT_SIZES = [
    { label: "12", value: "12px" },
    { label: "14", value: "14px" },
    { label: "16", value: "16px" },
    { label: "18", value: "18px" },
  ];

  const COLORS = [
    { name: "Blue", value: "#2563eb" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#22c55e" },
    { name: "Default", value: "inherit" },
  ];

  return (
    <div
      className="fixed z-[9999] flex items-center gap-1 bg-white border border-slate-200 shadow-2xl rounded-lg p-1.5 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* NHÓM ĐỊNH DẠNG CƠ BẢN */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "p-1.5 rounded hover:bg-slate-100 transition-colors",
          editor.isActive("bold") && "text-indigo-600 bg-indigo-50",
        )}
      >
        <Bold size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "p-1.5 rounded hover:bg-slate-100 transition-colors",
          editor.isActive("italic") && "text-indigo-600 bg-indigo-50",
        )}
      >
        <Italic size={15} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "p-1.5 rounded hover:bg-slate-100 transition-colors",
          editor.isActive("underline") && "text-indigo-600 bg-indigo-50",
        )}
      >
        <Underline size={15} />
      </button>

      <div className="w-[1px] h-4 bg-slate-200 mx-1" />

      {/* BỘ CHỌN KÍCH THƯỚC CHỮ (MỚI THÊM) */}
      <div className="flex items-center gap-1 px-1">
        <Type size={13} className="text-slate-400 mr-1" />
        <select
          onChange={(e) => runFontSizeCommand(e.target.value)}
          className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 outline-none hover:bg-slate-100 cursor-pointer transition-all"
          defaultValue=""
        >
          <option value="" disabled>
            Size
          </option>
          {FONT_SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-[1px] h-4 bg-slate-200 mx-1" />

      {/* BỘ CHỌN MÀU SẮC */}
      <div className="flex items-center gap-1.5 px-1">
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => runColorCommand(color.value)}
            className={cn(
              "w-4 h-4 rounded-full border border-slate-200 transition-all hover:scale-125",
              editor.isActive("textStyle", { color: color.value }) &&
                "ring-2 ring-indigo-400 ring-offset-1",
            )}
            style={{
              backgroundColor:
                color.value === "inherit" ? "#64748b" : color.value,
            }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};

export default FloatingToolbar;
