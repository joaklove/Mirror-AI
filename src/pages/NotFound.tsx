import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { InkBackground } from "@/components/InkBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <InkBackground intensity="light" />
      
      <Card className="dao-card p-12 text-center relative z-10 animate-fade-in-up">
        <div 
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'hsl(var(--paper-yellow))' }}
        >
          <Sparkles 
            className="w-10 h-10" 
            style={{ color: 'hsl(var(--cinnabar))' }} 
          />
        </div>
        
        <h1 
          className="text-4xl font-bold mb-4"
          style={{ 
            fontFamily: 'var(--font-serif)',
            color: 'hsl(var(--ink-green))',
          }}
        >
          404
        </h1>
        
        <p 
          className="text-lg mb-2"
          style={{ color: 'hsl(var(--mountain-green))' }}
        >
          页面未找到
        </p>
        
        <p 
          className="text-sm mb-8"
          style={{ color: 'hsl(var(--smoke-gray))' }}
        >
          此处无路，不妨回归本心
        </p>
        
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3"
        >
          <Home className="w-4 h-4" />
          返回首页
        </Link>
        
        <div className="mt-12">
          <p 
            className="text-sm italic"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            「道可道，非常道」
          </p>
          <p 
            className="text-xs mt-1"
            style={{ color: 'hsl(var(--smoke-gray))', opacity: 0.7 }}
          >
            ——《道德经》
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
