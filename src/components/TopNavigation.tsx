import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Heart, Leaf, Settings } from 'lucide-react';
import { TaijiIconSimple } from './TaijiIcon';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/analysis', label: '分析', icon: BarChart3 },
  { path: '/health', label: '健康', icon: Heart },
  { path: '/sustainable', label: '可持续生活', icon: Leaf },
  { path: '/settings', label: '设置', icon: Settings },
];

export function TopNavigation() {
  const location = useLocation();

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[60px] dao-glass z-50 hidden lg:flex items-center justify-between px-6"
      style={{
        borderBottom: '1px solid hsl(var(--light-ink))',
      }}
    >
      <div className="flex items-center gap-3">
        <TaijiIconSimple size={32} className="text-[hsl(var(--ink-green))]" />
        <span
          className="font-semibold text-lg tracking-wide"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'hsl(var(--ink-green))',
          }}
        >
          心镜 AI
        </span>
      </div>

      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'shadow-soft'
                  : 'hover:bg-[hsl(var(--paper-yellow))]'
              )}
              style={{
                background: isActive
                  ? 'hsl(var(--paper-yellow))'
                  : 'transparent',
                border: isActive
                  ? '1px solid hsl(var(--light-ink))'
                  : '1px solid transparent',
              }}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive
                    ? 'text-[hsl(var(--cinnabar))]'
                    : 'text-[hsl(var(--mountain-green))] hover:text-[hsl(var(--ink-green))]'
                )}
              />
              <span
                className={cn(
                  'font-medium text-sm',
                  isActive
                    ? 'text-[hsl(var(--ink-green))]'
                    : 'text-[hsl(var(--mountain-green))] hover:text-[hsl(var(--ink-green))]'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="w-[120px]" />
    </header>
  );
}

export default TopNavigation;
