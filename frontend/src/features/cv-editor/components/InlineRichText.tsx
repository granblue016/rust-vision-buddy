import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { useEffect, useState, useRef } from "react";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";

// 1. CUSTOM EXTENSION CHO FONT SIZE (Hỗ trợ inline style)
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).run(),
    } as any;
  },
});

interface InlineRichTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const InlineRichText = ({
  value,
  onChange,
  className = "",
  placeholder = "",
  style,
}: InlineRichTextProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null); // Quan trọng: Ref để quản lý vùng click

  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, FontFamily, FontSize],
    content: value,
    editorProps: {
      attributes: {
        class: `outline-none focus:ring-0 prose prose-sm max-w-none ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Chỉ gọi onChange khi nội dung thực sự thay đổi để tránh vòng lặp render
      if (html !== value) {
        onChange(html);
      }
    },
    onFocus: () => setIsFocused(true),
  });

  // LOGIC FIX LỖI DROPDOWN:
  // Chỉ đóng Toolbar khi người dùng click thực sự ra ngoài container (bao gồm cả editor và toolbar)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đồng bộ content khi value từ Store thay đổi (ví dụ: AI Auto-fill)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="relative w-full group/editor" ref={containerRef}>
      {editor && isFocused && (
        <div
          className="absolute -top-12 left-0 flex items-center gap-1.5 bg-white border border-slate-200 shadow-xl rounded-md p-1.5 z-[100] animate-in fade-in slide-in-from-bottom-2"
          // Ngăn sự kiện mousedown lan ra ngoài gây đóng toolbar đột ngột
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Dropdown chọn Font Family */}
          <select
            onChange={(e) => {
              editor
                .chain()
                .focus()
                .setFontFamily(
                  e.target.value === "default" ? "" : e.target.value,
                )
                .run();
            }}
            className="text-[11px] border-slate-200 rounded px-1 py-0.5 text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer outline-none focus:ring-1 focus:ring-indigo-300"
            value={editor.getAttributes("textStyle").fontFamily || "default"}
          >
            <option value="default">Phông chữ</option>
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="serif">Serif (Harvard)</option>
            <option value="monospace">Mono</option>
          </select>

          {/* Dropdown chọn Font Size */}
          <select
            onChange={(e) => {
              const cmd = editor.chain().focus() as any;
              if (e.target.value === "default") cmd.unsetFontSize().run();
              else cmd.setFontSize(e.target.value).run();
            }}
            className="text-[11px] border-slate-200 rounded px-1 py-0.5 text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer outline-none focus:ring-1 focus:ring-indigo-300"
            value={editor.getAttributes("textStyle").fontSize || "default"}
          >
            <option value="default">Cỡ</option>
            <option value="11px">11px</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
          </select>

          <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

          {/* Nhóm nút Style */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded transition-colors ${editor.isActive("bold") ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <Bold size={14} />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded transition-colors ${editor.isActive("italic") ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <Italic size={14} />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded transition-colors ${editor.isActive("underline") ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <UnderlineIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Vùng hiển thị Editor */}
      <div style={style} className="relative z-10">
        <EditorContent editor={editor} />

        {/* Placeholder xử lý thủ công để mượt mà hơn với Tiptap */}
        {editor && editor.isEmpty && placeholder && (
          <div className="absolute left-0 top-0 pointer-events-none text-slate-400 italic opacity-50 select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineRichText;
