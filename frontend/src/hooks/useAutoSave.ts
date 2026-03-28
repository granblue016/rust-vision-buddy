import { useEffect, useRef } from "react";
import { useCvStore } from "../stores/useCvStore";

/**
 * Hook tự động theo dõi sự thay đổi của CV Data và kích hoạt lưu (Auto-save).
 * Đảm bảo khớp tuyệt đối với logic chuẩn hóa (Sanitization) trong useCvStore.ts.
 * * @param delay Thời gian chờ (ms) sau khi ngừng thao tác. Mặc định 2000ms.
 */
export const useAutoSave = (delay: number = 2000) => {
  const { isDirty, saveChanges, currentCvId, isSaving, lastSaved } =
    useCvStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lưu tham chiếu đến hàm save để tránh useEffect chạy lại khi store re-render
  const saveRef = useRef(saveChanges);
  useEffect(() => {
    saveRef.current = saveChanges;
  }, [saveChanges]);

  useEffect(() => {
    // Chỉ chuẩn bị lưu nếu: Có thay đổi, có ID, và KHÔNG đang trong quá trình lưu
    if (isDirty && currentCvId && !isSaving) {
      // 1. Clear timer cũ khi người dùng tiếp tục thao tác
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 2. Thiết lập Debounce
      timerRef.current = setTimeout(async () => {
        // Kiểm tra lại một lần nữa trước khi gọi API
        if (getLatestIsDirty()) {
          console.log(
            "💾 [AutoSave]: Khởi chạy tiến trình đồng bộ với Rust Backend...",
          );
          try {
            await saveRef.current();
          } catch (error) {
            console.error("❌ [AutoSave] Failure:", error);
          }
        }
      }, delay);
    }

    // Cleanup khi unmount hoặc khi dependency thay đổi
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // Loại bỏ isSaving khỏi deps để tránh việc vừa lưu xong (isSaving: false)
    // lại kích hoạt ngược lại useEffect này.
  }, [isDirty, currentCvId, delay]);

  // Hàm bổ trợ để check giá trị thực tế của store tại thời điểm timeout chạy
  function getLatestIsDirty() {
    return useCvStore.getState().isDirty;
  }

  return {
    isSaving,
    lastSaved,
  };
};

export default useAutoSave;
