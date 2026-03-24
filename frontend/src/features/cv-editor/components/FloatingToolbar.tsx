import React, { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { Bold, Italic, Underline } from "lucide-react";
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

      // Chỉ hiện khi có bôi đen văn bản
      if (selection.empty || !editor.isFocused) {
        setVisible(false);
        return;
      }

      const { view } = editor;
      const start = view.coordsAtPos(selection.from);
      const end = view.coordsAtPos(selection.to);

      // Tính toán vị trí ở giữa vùng chọn
      const left = (start.left + end.left) / 2;
      const top = start.top - 40; // Hiện phía trên vùng chọn 40px

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

  // HÀM QUAN TRỌNG: Ép kiểu để xóa lỗi ts(2339)
  const runColorCommand = (color: string) => {
    const chain = editor.chain().focus() as any;
    if (color === "inherit") {
      chain.unsetColor().run();
    } else {
      chain.setColor(color).run();
    }
  };

  const colors = [
    { name: "Blue", value: "#2563eb" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#22c55e" },
    { name: "Default", value: "inherit" },
  ];

  return (
    <div
      className="fixed z-[9999] flex items-center gap-1 bg-white border border-slate-200 shadow-xl rounded-lg p-1 animate-in fade-in zoom-in duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "p-1.5 rounded hover:bg-slate-100",
          editor.isActive("bold") && "text-blue-600 bg-blue-50",
        )}
      >
        <Bold size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "p-1.5 rounded hover:bg-slate-100",
          editor.isActive("italic") && "text-blue-600 bg-blue-50",
        )}
      >
        <Italic size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "p-1.5 rounded hover:bg-slate-100",
          editor.isActive("underline") && "text-blue-600 bg-blue-50",
        )}
      >
        <Underline size={14} />
      </button>

      <div className="w-[1px] h-4 bg-slate-200 mx-1" />

      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => runColorCommand(color.value)}
          className={cn(
            "w-4 h-4 rounded-full border border-slate-100",
            editor.isActive("textStyle", { color: color.value }) &&
              "ring-2 ring-blue-400",
          )}
          style={{
            backgroundColor:
              color.value === "inherit" ? "#475569" : color.value,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingToolbar;
