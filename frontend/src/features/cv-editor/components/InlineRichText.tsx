import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { useEffect, useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Type,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import hằng số font dùng chung để đồng bộ toàn project
import { FONT_OPTIONS } from "@/lib/fonts";

// 1. CUSTOM EXTENSION CHO FONT SIZE
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
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, FontFamily, FontSize],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "outline-none focus:ring-0 prose prose-sm max-w-none",
          className,
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== value) {
        onChange(html);
      }
    },
    onFocus: () => setIsFocused(true),
  });

  // Đóng Toolbar khi click ra ngoài
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đồng bộ content khi store thay đổi
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  // --- LOGIC HIỂN THỊ CHÍNH XÁC ---
  const currentAttrs = editor.getAttributes("textStyle");

  // Tiptap thường trả về font kèm dấu nháy, ví dụ: "'Times New Roman'"
  // Chúng ta xóa dấu nháy để so sánh chuẩn xác
  const rawFont = (currentAttrs.fontFamily || "").replace(/['"]/g, "").trim();

  // Tìm font khớp trong FONT_OPTIONS
  const currentFont =
    FONT_OPTIONS.find((f) => {
      const cleanOptionValue = f.value
        .replace(/['"]/g, "")
        .split(",")[0]
        .trim();
      return cleanOptionValue === rawFont || rawFont.includes(f.label);
    })?.value || FONT_OPTIONS[0].value;

  const currentSize = currentAttrs.fontSize || "16px";

  return (
    <div className="relative w-full group/editor" ref={containerRef}>
      {isFocused && (
        <div
          className="absolute -top-12 left-0 flex items-center gap-1 bg-white border border-slate-200 shadow-xl rounded-md p-1 z-[100] animate-in fade-in slide-in-from-bottom-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Bộ chọn Phông chữ */}
          <div className="flex items-center px-1 gap-1">
            <Languages size={12} className="text-slate-400" />
            <select
              value={currentFont}
              onChange={(e) =>
                editor.chain().focus().setFontFamily(e.target.value).run()
              }
              className="text-[11px] font-bold border-none bg-transparent hover:bg-slate-50 cursor-pointer outline-none min-w-[100px]"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

          {/* Bộ chọn Cỡ chữ */}
          <div className="flex items-center px-1 gap-1">
            <Type size={12} className="text-slate-400" />
            <select
              value={currentSize}
              onChange={(e) =>
                (editor.chain().focus() as any)
                  .setFontSize(e.target.value)
                  .run()
              }
              className="text-[11px] font-bold border-none bg-transparent hover:bg-slate-50 cursor-pointer outline-none"
            >
              {["12px", "14px", "16px", "18px", "24px"].map((size) => (
                <option key={size} value={size}>
                  {size.replace("px", "")}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

          {/* Các nút định dạng nhanh */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "p-1.5 rounded transition-colors",
                editor.isActive("bold")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "p-1.5 rounded transition-colors",
                editor.isActive("italic")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn(
                "p-1.5 rounded transition-colors",
                editor.isActive("underline")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <UnderlineIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div style={style} className="relative z-10">
        <EditorContent editor={editor} />
        {editor.isEmpty && placeholder && (
          <div className="absolute left-0 top-0 pointer-events-none text-slate-400 italic opacity-50 select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineRichText;
