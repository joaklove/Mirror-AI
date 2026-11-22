import { useState, useEffect } from 'react';
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
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

      {/* 太极按钮：所有屏幕尺寸统一，侧栏默认完全隐藏 */}
      <div className="fixed top-4 left-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="打开菜单"
          className="p-2 rounded-full dao-glass shadow-soft transition-transform hover:scale-105"
        >
          <TaijiIconSimple size={26} />
        </button>
      </div>

      {/* 遮罩：点击空白处关闭侧栏 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 抽屉式侧栏 */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleSignOut}
      />

      <main className="min-h-screen relative z-10">
        <div className="p-6 min-h-screen relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
