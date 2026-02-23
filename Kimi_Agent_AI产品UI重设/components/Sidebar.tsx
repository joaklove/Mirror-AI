import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PenLine, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { TaijiIconSimple } from './TaijiIcon';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onSignOut?: () => void;
}

const navItems = [
  { path: '/', label: '首页', icon: Home, description: '今日概览' },
  { path: '/record', label: '记录', icon: PenLine, description: '书写当下' },
  { path: '/analysis', label: '分析', icon: BarChart3, description: '洞察内心' },
  { path: '/settings', label: '设置', icon: Settings, description: '个性化' },
];

export function Sidebar({ onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside 
      className={cn(
        'fixed left-0 top-0 h-screen dao-glass transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{
        borderRight: '1px solid hsl(var(--light-ink))',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo 区域 */}
        <div 
          className={cn(
            'p-4 flex items-center transition-all',
            collapsed ? 'justify-center' : 'justify-between'
          )}
          style={{ 
            borderBottom: '1px solid hsl(var(--light-ink))',
          }}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <TaijiIconSimple size={32} className="text-[hsl(var(--ink-green))]" />
              <div>
                <span 
                  className="font-semibold text-lg tracking-wide"
                  style={{ 
                    fontFamily: 'var(--font-serif)',
                    color: 'hsl(var(--ink-green))',
                  }}
                >
                  心镜 AI
                </span>
                <p 
                  className="text-[10px]"
                  style={{ color: 'hsl(var(--mountain-green))' }}
                >
                  照见内心
                </p>
              </div>
            </div>
          ) : (
            <TaijiIconSimple size={28} className="text-[hsl(var(--ink-green))]" />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-lg hover:bg-[hsl(var(--paper-yellow))]"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* 导航区域 */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                  isActive 
                    ? 'shadow-soft' 
                    : 'hover:bg-[hsl(var(--paper-yellow))]',
                  collapsed && 'justify-center px-2'
                )}
                style={{
                  background: isActive 
                    ? 'hsl(var(--paper-yellow))' 
                    : 'transparent',
                  border: isActive 
                    ? '1px solid hsl(var(--light-ink))' 
                    : '1px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon 
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive 
                      ? 'text-[hsl(var(--cinnabar))]' 
                      : 'text-[hsl(var(--mountain-green))] group-hover:text-[hsl(var(--ink-green))]'
                  )} 
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <span 
                      className={cn(
                        'font-medium text-sm block',
                        isActive 
                          ? 'text-[hsl(var(--ink-green))]' 
                          : 'text-[hsl(var(--mountain-green))] group-hover:text-[hsl(var(--ink-green))]'
                      )}
                    >
                      {item.label}
                    </span>
                    <span 
                      className="text-[10px] truncate block"
                      style={{ color: 'hsl(var(--smoke-gray))' }}
                    >
                      {item.description}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 用户信息区域 */}
        <div 
          className="p-3"
          style={{ borderTop: '1px solid hsl(var(--light-ink))' }}
        >
          <div className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-xl',
            collapsed && 'justify-center'
          )}>
            {user ? (
              <>
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: 'hsl(var(--paper-yellow))',
                    border: '1px solid hsl(var(--light-ink))',
                  }}
                >
                  <User className="w-4 h-4" style={{ color: 'hsl(var(--mountain-green))' }} />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium truncate"
                      style={{ color: 'hsl(var(--ink-green))' }}
                    >
                      {user.email?.split('@')[0] || '用户'}
                    </p>
                    <p 
                      className="text-[10px] truncate"
                      style={{ color: 'hsl(var(--smoke-gray))' }}
                    >
                      {user.email}
                    </p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSignOut}
                  className="h-8 w-8 rounded-lg flex-shrink-0 hover:bg-[hsl(var(--paper-yellow))] hover:text-[hsl(var(--cinnabar))]"
                  style={{ color: 'hsl(var(--smoke-gray))' }}
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link
                to="/auth"
                className={cn(
                  'flex items-center gap-2 text-sm transition-colors',
                  collapsed && 'justify-center'
                )}
                style={{ color: 'hsl(var(--mountain-green))' }}
              >
                <User className="w-4 h-4" />
                {!collapsed && <span>登录</span>}
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function getSidebarWidth(collapsed: boolean): string {
  return collapsed ? 'ml-16' : 'ml-64';
}

export default Sidebar;
