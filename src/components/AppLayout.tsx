import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, getSidebarWidth } from '@/components/Sidebar';
import { TopNavigation } from '@/components/TopNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { InkBackground } from '@/components/InkBackground';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      setSidebarOpen(false);
    }
  }, [isMobile]);

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
      <TopNavigation />
      {!isMobile ? (
        <>
          <Sidebar onSignOut={handleSignOut} />
          <main className={`transition-all duration-300 ${getSidebarWidth(sidebarCollapsed, sidebarHovered)}`}>
            <div className="pt-16 p-6 min-h-screen relative z-10">
              {children}
            </div>
          </main>
        </>
      ) : (
        <>
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)}></div>
          )}
          <Sidebar onSignOut={handleSignOut} />
          <main className="min-h-screen relative z-10">
            <div className="pt-16 p-4 sm:p-6 min-h-screen">
              {children}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
