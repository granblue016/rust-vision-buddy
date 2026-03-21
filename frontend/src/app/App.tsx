import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "@/features/marketing/pages/LandingPage";
import SolutionPage from "@/features/cv-analysis/pages/SolutionPage";
import WriteMailPage from "@/features/content-generation/pages/WriteMailPage";
import WriteCoverLetterPage from "@/features/content-generation/pages/WriteCoverLetterPage";
import AboutPage from "@/features/marketing/pages/AboutPage";
import ContactPage from "@/features/marketing/pages/ContactPage";
import AuthPage from "@/features/auth/pages/AuthPage";
import SignUpPage from "@/features/auth/pages/SignUpPage";
import OAuthCallbackPage from "@/features/auth/pages/OAuthCallbackPage";
import NotFound from "@/pages/NotFound";
import ChatbotWidget from "@/components/ChatbotWidget";
import ProtectedRoute from "@/shared/components/auth/ProtectedRoute";

// Import các trang quản lý CV chúng ta vừa tạo
import Index from "@/pages/Index";

// Component tạm thời cho Editor (Bạn sẽ phát triển chi tiết sau)
const EditorPlaceholder = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
    <h1 className="text-2xl font-bold text-slate-900 mb-2">
      Trình chỉnh sửa CV
    </h1>
    <p className="text-slate-500">Đang tải cấu hình kéo thả...</p>
    <a
      href="/dashboard"
      className="mt-6 text-indigo-600 hover:underline font-medium"
    >
      ← Quay lại danh sách CV
    </a>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/auth/callback" element={<OAuthCallbackPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* --- Protected Routes (Yêu cầu đăng nhập) --- */}
              <Route element={<ProtectedRoute />}>
                {/* Trang Dashboard hiển thị danh sách CV */}
                <Route path="/dashboard" element={<Index />} />

                {/* Trang Editor để chỉnh sửa CV cụ thể */}
                <Route path="/editor/:id" element={<EditorPlaceholder />} />

                <Route path="/solution" element={<SolutionPage />} />
                <Route path="/write-mail" element={<WriteMailPage />} />
                <Route
                  path="/write-cover-letter"
                  element={<WriteCoverLetterPage />}
                />
              </Route>

              {/* --- 404 Route --- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatbotWidget />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
