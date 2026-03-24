import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

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
  const editor = useEditor({
    extensions: [StarterKit],
    content: value, // Chỉ dùng làm giá trị khởi tạo
    editorProps: {
      attributes: {
        class: `outline-none focus:ring-0 ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Chỉ gửi lên Store nếu nội dung thực sự khác đi
      // Điều này ngăn chặn vòng lặp render vô hạn
      if (html !== value) {
        onChange(html);
      }
    },
  });

  // QUAN TRỌNG: Cập nhật nội dung từ bên ngoài (ví dụ khi nạp CV từ DB)
  // mà không làm reset Editor khi người dùng đang gõ
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Chèn nội dung mà không làm mất vị trí con trỏ (focus)
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="relative w-full">
      <EditorContent editor={editor} />
      {/* Hiển thị Placeholder khi trống */}
      {editor && editor.isEmpty && (
        <div className="absolute left-0 top-0 pointer-events-none text-slate-400 italic opacity-40">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default InlineRichText;
