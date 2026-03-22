import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  isTextArea?: boolean;
  // CSSProperties giúp nhận style={{ color: primary_color }} từ EditorPage
  style?: React.CSSProperties;
}

const EditableField = ({
  value,
  onSave,
  placeholder = "Nhập nội dung...",
  className,
  isTextArea = false,
  style,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  // Khởi tạo ref với null và định nghĩa type rõ ràng để tránh lỗi TS2322
  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Cập nhật giá trị nội bộ khi giá trị từ store thay đổi
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Tự động focus khi vào chế độ chỉnh sửa
  useEffect(() => {
    if (isEditing) {
      if (isTextArea) {
        textAreaRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }, [isEditing, isTextArea]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // Nhấn Enter để lưu (chỉ áp dụng cho input dòng đơn)
    if (e.key === "Enter" && !isTextArea) {
      handleBlur();
    }
    // Nhấn Escape để hủy thay đổi
    if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setCurrentValue(e.target.value);
  };

  // Nếu đang trong chế độ Edit
  if (isEditing) {
    const commonProps = {
      value: currentValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      placeholder: placeholder,
      style: style, // Áp dụng màu sắc ngay cả khi đang gõ
      className: cn(
        "w-full bg-slate-50 border-2 border-indigo-400 rounded px-1 outline-none transition-all shadow-inner",
        className,
      ),
    };

    return isTextArea ? (
      <textarea
        {...commonProps}
        ref={textAreaRef}
        rows={4}
        className={cn(commonProps.className, "resize-none leading-relaxed")}
      />
    ) : (
      <input
        {...commonProps}
        ref={inputRef}
        type="text"
        className={cn(commonProps.className, "h-fit")}
      />
    );
  }

  // Chế độ hiển thị (View Mode)
  return (
    <div
      onClick={() => setIsEditing(true)}
      style={style}
      className={cn(
        "cursor-text hover:bg-slate-100/50 rounded px-1 py-0.5 transition-colors min-h-[1.5em] w-full",
        !value && "text-slate-300 italic font-normal", // Làm mờ placeholder nếu không có value
        className,
      )}
    >
      {value || placeholder}
    </div>
  );
};

export default EditableField;
