import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  isTextArea?: boolean;
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

  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Cập nhật giá trị nội bộ khi props 'value' thay đổi (ví dụ: từ AI hoặc Database)
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Xử lý Focus và đưa con trỏ xuống cuối văn bản
  useEffect(() => {
    if (isEditing) {
      if (isTextArea && textAreaRef.current) {
        textAreaRef.current.focus();
        const length = textAreaRef.current.value.length;
        textAreaRef.current.setSelectionRange(length, length);
      } else if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isEditing, isTextArea]); // Đã loại bỏ currentValue.length để tránh re-run thừa

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (currentValue.trim() !== value.trim()) {
      onSave(currentValue);
    }
  }, [currentValue, value, onSave]);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // Nếu là input bình thường, nhấn Enter là lưu
    if (e.key === "Enter" && !isTextArea) {
      e.preventDefault();
      handleBlur();
    }
    // Nếu là Escape, hủy bỏ thay đổi
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

  if (isEditing) {
    const commonProps = {
      value: currentValue,
      onChange: handleChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      placeholder: placeholder,
      className: cn(
        "w-full bg-indigo-50/50 border-b-2 border-indigo-500 px-1 outline-none transition-all",
        className,
      ),
      style: style,
    };

    return isTextArea ? (
      <textarea
        {...commonProps}
        ref={textAreaRef}
        rows={3}
        className={cn(
          commonProps.className,
          "resize-none leading-relaxed block",
        )}
      />
    ) : (
      <input
        {...commonProps}
        ref={inputRef}
        type="text"
        className={cn(commonProps.className, "h-auto block")}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={style}
      className={cn(
        "cursor-text hover:bg-indigo-50/30 rounded px-1 transition-all relative group/field min-h-[1.5em] flex items-center",
        !value && "text-slate-300 italic font-normal",
        className,
      )}
    >
      <span className="break-words w-full">{value || placeholder}</span>

      {/* Badge "Edit" thông minh: Chỉ hiện trên màn hình có chuột (hover) */}
      <span className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/field:opacity-100 text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase font-bold transition-all pointer-events-none">
        Edit
      </span>
    </div>
  );
};

export default EditableField;
