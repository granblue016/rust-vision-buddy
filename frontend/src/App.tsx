import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Marketing & Public Pages
import LandingPage from "@/features/marketing/pages/LandingPage";
import AboutPage from "@/features/marketing/pages/AboutPage";
import ContactPage from "@/features/marketing/pages/ContactPage";

// Auth Pages
import AuthPage from "@/features/auth/pages/AuthPage";
import SignUpPage from "@/features/auth/pages/SignUpPage";
import OAuthCallbackPage from "@/features/auth/pages/OAuthCallbackPage";

// Core Editor & Features
import DashboardPage from "@/features/cv-editor/pages/DashboardPage";
import EditorPage from "@/features/cv-editor/pages/EditorPage";
import PreviewPage from "@/features/cv-editor/pages/PreviewPage"; // Sử dụng alias @
import SolutionPage from "@/features/cv-analysis/pages/SolutionPage";
import WriteMailPage from "@/features/content-generation/pages/WriteMailPage";
import WriteCoverLetterPage from "@/features/content-generation/pages/WriteCoverLetterPage";

// Components & Utils
import ChatbotWidget from "@/components/ChatbotWidget";
import ProtectedRoute from "@/shared/components/auth/ProtectedRoute";
import WidgetErrorBoundary from "@/shared/components/system/WidgetErrorBoundary";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          {/* Thông báo hệ thống */}
          <Toaster />
          <Sonner position="top-right" expand={false} richColors />

          <BrowserRouter>
            <Routes>
              {/* --- Public Routes (Truy cập không cần đăng nhập) --- */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/auth/callback" element={<OAuthCallbackPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* ROUTE DÀNH CHO XUẤT PDF:
                Đặt ở đây để Headless Chrome (Backend) truy cập thẳng bằng ID
                mà không bị chặn bởi logic check token của ProtectedRoute.
              */}
              <Route path="/preview/:id" element={<PreviewPage />} />

              {/* --- Protected Routes (Yêu cầu đăng nhập) --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
                <Route path="/solution" element={<SolutionPage />} />
                <Route path="/write-mail" element={<WriteMailPage />} />
                <Route
                  path="/write-cover-letter"
                  element={<WriteCoverLetterPage />}
                />
              </Route>

              {/* --- Redirects & 404 --- */}
              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Widget AI sẽ không hiển thị trên trang Preview nếu bạn xử lý logic ẩn trong chính component Chatbot */}
            <WidgetErrorBoundary>
              <ChatbotWidget />
            </WidgetErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
