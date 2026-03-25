import { useEffect, useRef } from "react";
import { useCvStore } from "../stores/useCvStore";

/**
 * Hook tự động theo dõi sự thay đổi của CV Data và kích hoạt lưu.
 * @param delay Thời gian chờ (ms) sau khi ngừng gõ để bắt đầu lưu. Mặc định 2000ms.
 */
export const useAutoSave = (delay: number = 2000) => {
  const { data, isDirty, saveChanges, currentCvId } = useCvStore();

  // Sử dụng ref để giữ reference của timer, tránh việc re-render tạo nhiều timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Chỉ kích hoạt logic nếu dữ liệu đã bị thay đổi (isDirty) và có ID hợp lệ
    if (isDirty && currentCvId) {

      // Xóa timer cũ nếu người dùng tiếp tục gõ/thay đổi
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Thiết lập timer mới
      timerRef.current = setTimeout(() => {
        console.log("useAutoSave: Đang tiến hành lưu tự động...");
        saveChanges();
      }, delay);
    }

    // Cleanup function: Chạy khi component unmount hoặc trước khi effect chạy lại
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, isDirty, currentCvId, saveChanges, delay]);

  return {
    isSaving: useCvStore((state) => state.isSaving),
    lastSaved: useCvStore((state) => state.lastSaved),
  };
};

export default useAutoSave;
