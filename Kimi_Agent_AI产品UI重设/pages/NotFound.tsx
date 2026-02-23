import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TaijiIcon } from '@/components/TaijiIcon';
import { InkBackground } from '@/components/InkBackground';

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
      {/* 水墨背景 */}
      <InkBackground intensity="medium" />
      
      {/* 装饰光晕 */}
      <div 
        className="fixed top-1/4 left-1/4 w-[500px] h-[500px] rounded-full animate-breathe"
        style={{
          background: 'radial-gradient(circle, hsla(168, 16%, 42%, 0.06) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      <Card className="dao-card max-w-md w-full p-10 text-center animate-fade-in-up relative z-10">
        {/* 太极图标 */}
        <div className="flex justify-center mb-6">
          <TaijiIcon size={56} animated />
        </div>

        {/* 404 数字 */}
        <h1 
          className="text-6xl font-bold mb-2"
          style={{ 
            fontFamily: 'var(--font-display)',
            color: 'hsl(var(--ink-green))',
          }}
        >
          404
        </h1>

        {/* 标题 */}
        <h2 
          className="text-xl font-medium mb-3"
          style={{ 
            fontFamily: 'var(--font-serif)',
            color: 'hsl(var(--ink-green))',
          }}
        >
          此路不通
        </h2>

        {/* 描述 */}
        <p 
          className="text-sm mb-8"
          style={{ color: 'hsl(var(--mountain-green))' }}
        >
          您寻找的页面似乎已迷失在云雾之中
        </p>

        {/* 道家格言 */}
        <div 
          className="p-4 rounded-xl mb-8"
          style={{ 
            background: 'hsl(var(--paper-yellow))',
            border: '1px solid hsl(var(--light-ink))',
          }}
        >
          <p 
            className="text-sm italic"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            「道可道，非常道。名可名，非常名。」
          </p>
          <p 
            className="text-xs mt-1"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            有时候，迷路也是一种修行
          </p>
        </div>

        {/* 返回按钮 */}
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button className="btn-primary">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <Link to="/record">
            <Button className="btn-secondary">
              <Compass className="w-4 h-4 mr-2" />
              去记录
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
