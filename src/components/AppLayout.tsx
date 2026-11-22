import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TaijiIconSimple } from '@/components/TaijiIcon';
import { useAuth } from '@/contexts/AuthContext';
import { InkBackground } from '@/components/InkBackground';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // 鼠标进入按钮或侧栏：取消待执行的关闭
  const handleSidebarEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setSidebarOpen(true);
  };

  // 鼠标离开：延迟关闭，给「按钮 → 侧栏」的过渡留出时间，避免闪退
  const handleSidebarLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setSidebarOpen(false), 300);
  };

  // 立即关闭（点遮罩 / 点导航项）
  const closeSidebarNow = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    const confirmed = window.confirm('确定要退出登录吗？');
    if (!confirmed) return;

    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <InkBackground intensity="light" />
        <div className="text-center relative z-10">
          <div className="w-10 h-10 border-3 border-[hsl(var(--mountain-green))] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p style={{ color: 'hsl(var(--smoke-gray))' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <InkBackground intensity="light" />

      {/* 太极按钮：悬停即展开（触屏可点击兜底） */}
      <div
        className="fixed top-4 left-4 z-30"
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <button
          onClick={handleSidebarEnter}
          aria-label="打开菜单"
          className="p-2 rounded-full dao-glass shadow-soft transition-transform hover:scale-105"
        >
          <TaijiIconSimple size={26} animated style={{ animationDuration: '10s' }} />
        </button>
      </div>

      {/* 遮罩：点击空白处立即关闭侧栏 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={closeSidebarNow}
        />
      )}

      {/* 抽屉式侧栏：悬停保持展开 */}
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebarNow}
        onSignOut={handleSignOut}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      />

      <main className="min-h-screen relative z-10">
        <div className="p-6 min-h-screen relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
