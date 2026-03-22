import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Giáp bảo vệ chống lỗi Render - Ngăn chặn lỗi "Màn hình trắng"
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Cập nhật state để lần render sau sẽ hiển thị UI thay thế
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Bạn có thể log lỗi ra hệ thống giám sát ở đây
    console.error("Critical Render Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 border-2 border-red-100 bg-red-50 rounded-lg text-center">
            <h2 className="text-red-600 font-bold mb-2">Đã xảy ra lỗi hiển thị</h2>
            <p className="text-sm text-red-500 mb-4">
              Một phần của CV không thể hiển thị do lỗi dữ liệu.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Thử tải lại vùng này
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
