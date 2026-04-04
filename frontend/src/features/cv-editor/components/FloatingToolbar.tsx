import React, { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Type,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FONT_OPTIONS } from "@/lib/fonts";

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
      if (selection.empty || !editor.isFocused) {
        setVisible(false);
        return;
      }
      const { view } = editor;
      const start = view.coordsAtPos(selection.from);
      const end = view.coordsAtPos(selection.to);

      // Tính toán vị trí chính giữa vùng chọn và đẩy lên trên 45px
      setPosition({
        top: start.top - 50,
        left: (start.left + end.left) / 2,
      });
      setVisible(true);
    };

    editor.on("selectionUpdate", update);
    editor.on("focus", update);

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.activeElement?.closest(".floating-toolbar"))
          setVisible(false);
      }, 200);
    };

    editor.on("blur", handleBlur);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("focus", update);
      editor.off("blur", handleBlur);
    };
  }, [editor]);

  if (!editor || !visible) return null;

  // 1. LẤY GIÁ TRỊ HIỆN TẠI VÀ CHUẨN HÓA (Xử lý nháy đơn/kép của Tiptap)
  const currentAttributes = editor.getAttributes("textStyle");
  const rawFont = (currentAttributes.fontFamily || "")
    .replace(/['"]/g, "")
    .trim();

  // Tìm font khớp dựa trên value (đã sạch nháy) hoặc label
  const matchedFont =
    FONT_OPTIONS.find((f) => {
      const cleanOptionValue = f.value
        .replace(/['"]/g, "")
        .split(",")[0]
        .trim();
      return cleanOptionValue === rawFont || rawFont.includes(f.label);
    })?.value || FONT_OPTIONS[0].value;

  const currentSize = currentAttributes.fontSize || "16px";

  return (
    <div
      className="floating-toolbar fixed z-[9999] flex items-center gap-0.5 bg-white border border-slate-200 shadow-2xl rounded-lg p-1 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* NHÓM ĐỊNH DẠNG VĂN BẢN */}
      <div className="flex items-center gap-0.5 px-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded transition-colors hover:bg-slate-100",
            editor.isActive("bold")
              ? "text-indigo-600 bg-indigo-50"
              : "text-slate-600",
          )}
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded transition-colors hover:bg-slate-100",
            editor.isActive("italic")
              ? "text-indigo-600 bg-indigo-50"
              : "text-slate-600",
          )}
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-1.5 rounded transition-colors hover:bg-slate-100",
            editor.isActive("underline")
              ? "text-indigo-600 bg-indigo-50"
              : "text-slate-600",
          )}
        >
          <UnderlineIcon size={14} />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-slate-200 mx-1" />

      {/* CHỌN PHÔNG CHỮ - ĐÃ ĐỒNG BỘ VỚI FONT_OPTIONS */}
      <div className="flex items-center gap-1 px-1">
        <Languages size={13} className="text-slate-400 shrink-0" />
        <select
          value={matchedFont}
          onChange={(e) =>
            (editor.chain().focus() as any).setFontFamily(e.target.value).run()
          }
          className="text-[11px] font-bold bg-transparent border-none rounded px-1 py-0.5 outline-none hover:bg-slate-100 cursor-pointer min-w-[100px]"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.id} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-[1px] h-4 bg-slate-200 mx-1" />

      {/* CHỌN KÍCH THƯỚC CHỮ */}
      <div className="flex items-center gap-1 px-1">
        <Type size={13} className="text-slate-400 shrink-0" />
        <select
          value={currentSize}
          onChange={(e) =>
            (editor.chain().focus() as any).setFontSize(e.target.value).run()
          }
          className="text-[11px] font-bold bg-transparent border-none rounded px-1 py-0.5 outline-none hover:bg-slate-100 cursor-pointer"
        >
          {["12px", "14px", "16px", "18px", "24px"].map((size) => (
            <option key={size} value={size}>
              {size.replace("px", "")}
            </option>
          ))}
        </select>
      </div>

      <div className="w-[1px] h-4 bg-slate-200 mx-1" />

      {/* BẢNG MÀU NHANH */}
      <div className="flex items-center gap-1.5 px-1.5">
        {[
          { name: "Mặc định", value: "inherit", bg: "#94a3b8" },
          { name: "Xanh", value: "#2563eb", bg: "#2563eb" },
          { name: "Đỏ", value: "#ef4444", bg: "#ef4444" },
          { name: "Đen", value: "#1e293b", bg: "#1e293b" },
        ].map((color) => (
          <button
            type="button"
            key={color.value}
            title={color.name}
            onClick={() => {
              const chain = editor.chain().focus() as any;
              if (color.value === "inherit") chain.unsetColor().run();
              else chain.setColor(color.value).run();
            }}
            className={cn(
              "w-3.5 h-3.5 rounded-full border border-slate-200 transition-all hover:scale-125",
              ((color.value === "inherit" && !currentAttributes.color) ||
                editor.isActive("textStyle", { color: color.value })) &&
                "ring-2 ring-indigo-400 ring-offset-1 scale-110",
            )}
            style={{ backgroundColor: color.bg }}
          />
        ))}
      </div>
    </div>
  );
};

export default FloatingToolbar;
