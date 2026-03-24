import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { useEffect, useState } from "react";
import { Bold, Italic, Underline as UnderlineIcon, Type } from "lucide-react";

interface InlineRichTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export const InlineRichText = ({
  value,
  onChange,
  className = "",
  placeholder = "",
}: InlineRichTextProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, FontFamily],
    content: value,
    editorProps: {
      attributes: {
        class: `outline-none focus:ring-0 prose prose-sm max-w-none ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== value) {
        onChange(html);
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => {
      // Delay để tránh toolbar biến mất trước khi kịp nhấn nút format
      setTimeout(() => setIsFocused(false), 200);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="relative w-full group/editor">
      {/* Toolbar Format - Chuyển sang Indigo cho đồng bộ */}
      {editor && isFocused && (
        <div className="absolute -top-10 left-0 flex items-center gap-1 bg-white border border-slate-200 shadow-lg rounded-md p-1 z-50 animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            className={`p-1 rounded hover:bg-slate-100 ${editor.isActive("bold") ? "text-indigo-600 bg-indigo-50" : "text-slate-600"}`}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            className={`p-1 rounded hover:bg-slate-100 ${editor.isActive("italic") ? "text-indigo-600 bg-indigo-50" : "text-slate-600"}`}
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            className={`p-1 rounded hover:bg-slate-100 ${editor.isActive("underline") ? "text-indigo-600 bg-indigo-50" : "text-slate-600"}`}
          >
            <UnderlineIcon size={14} />
          </button>
          <div className="w-[1px] h-3 bg-slate-200 mx-1" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setFontFamily("serif").run();
            }}
            className={`p-1 rounded hover:bg-slate-100 ${editor.isActive("textStyle", { fontFamily: "serif" }) ? "text-indigo-600 bg-indigo-50" : "text-slate-600"}`}
          >
            <Type size={14} />
          </button>
        </div>
      )}

      <EditorContent editor={editor} />

      {/* CƠ CHẾ PHÒNG THỦ NÂNG CẤP: CHẶN TRIỆT ĐỂ CHUỖI RÁC */}
      {editor &&
        editor.isEmpty &&
        placeholder &&
        placeholder.trim() !== "" &&
        // Danh sách đen: Chặn các placeholder mặc định cũ
        !placeholder.includes("(aaaaa") &&
        !placeholder.toLowerCase().includes("kỹ năng") &&
        !placeholder.toLowerCase().includes("tên tổ chức") &&
        !placeholder.toLowerCase().includes("số điện thoại") &&
        !placeholder.toLowerCase().includes("email") &&
        !placeholder.toLowerCase().includes("địa chỉ") &&
        !placeholder.toLowerCase().includes("website") &&
        !placeholder.toLowerCase().includes("công ty") && (
          <div className="absolute left-0 top-0 pointer-events-none text-slate-400 italic opacity-40">
            {placeholder}
          </div>
        )}
    </div>
  );
};

export default InlineRichText;
