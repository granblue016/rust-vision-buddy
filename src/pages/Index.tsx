import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          CV<span className="text-accent">Genius</span>
        </h1>
        <p className="text-muted-foreground">
          Tạo CV chuyên nghiệp với trình biên tập kéo thả thông minh
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard">
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              Bắt đầu <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/editor/new">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" /> Tạo CV mới
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
