import { Component, type ErrorInfo, type ReactNode } from "react";

type WidgetErrorBoundaryProps = {
  children: ReactNode;
};

type WidgetErrorBoundaryState = {
  hasError: boolean;
};

class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  state: WidgetErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WidgetErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Chatbot widget crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // Hide chatbot widget if it crashes instead of breaking the whole app shell.
      return null;
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
