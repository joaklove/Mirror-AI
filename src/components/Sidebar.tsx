import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  X,
  LogOut,
  User,
  Tag,
  Plug,
  Settings,
  ChevronDown,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useInstall } from '@/contexts/InstallContext';
import { TaijiIconSimple } from './TaijiIcon';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onSignOut?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavCategory = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultExpanded?: boolean;
};

const navCategories: NavCategory[] = [
  {
    id: 'management',
    title: '管理',
    icon: Settings,
    defaultExpanded: false,
    items: [
      { path: '/tags', label: '标签', icon: Tag },
      { path: '/integrations', label: '第三方集成', icon: Plug },
      { path: '/settings', label: '设置', icon: Settings },
      // path '#'：安装到桌面（不跳转路由，点击打开安装引导）
      { path: '#', label: '安装到桌面', icon: Download },
    ],
  },
];

const homeItem = { path: '/', label: '首页', icon: Home };

export function Sidebar({ open, onClose, onSignOut, onMouseEnter, onMouseLeave }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navCategories.forEach(cat => {
      initial[cat.id] = cat.defaultExpanded ?? false;
    });
    return initial;
  });
  const location = useLocation();
  const { user } = useAuth();
  const { openInstall } = useInstall();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isItemActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-64 dao-glass z-50',
        'transition-transform ease-drawer',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
      style={{
        borderRight: '1px solid hsl(var(--light-ink))',
        pointerEvents: open ? 'auto' : 'none',
      }}
      onMouseEnter={open ? onMouseEnter : undefined}
      onMouseLeave={open ? onMouseLeave : undefined}
    >
      <div className="flex flex-col h-full">
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid hsl(var(--light-ink))' }}
        >
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="关闭菜单"
            className="h-8 w-8 rounded-lg hover:bg-[hsl(var(--paper-yellow))]"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link
            to={homeItem.path}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
              isItemActive(homeItem.path)
                ? 'shadow-soft'
                : 'hover:bg-[hsl(var(--paper-yellow))]',
            )}
            style={{
              background: isItemActive(homeItem.path)
                ? 'hsl(var(--paper-yellow))'
                : 'transparent',
              border: isItemActive(homeItem.path)
                ? '1px solid hsl(var(--light-ink))'
                : '1px solid transparent',
            }}
          >
            <homeItem.icon
              className={cn(
                'w-5 h-5 transition-colors flex-shrink-0',
                isItemActive(homeItem.path)
                  ? 'text-[hsl(var(--cinnabar))]'
                  : 'text-[hsl(var(--mountain-green))] group-hover:text-[hsl(var(--ink-green))]'
              )}
            />
            <span
              className={cn(
                'font-medium text-sm',
                isItemActive(homeItem.path)
                  ? 'text-[hsl(var(--ink-green))]'
                  : 'text-[hsl(var(--mountain-green))] group-hover:text-[hsl(var(--ink-green))]'
              )}
            >
              {homeItem.label}
            </span>
          </Link>

          <div className="pt-2" />

          {navCategories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  'hover:bg-[hsl(var(--paper-yellow))]'
                )}
              >
                <category.icon
                  className="w-5 h-5 flex-shrink-0 text-[hsl(var(--mountain-green))] group-hover:text-[hsl(var(--ink-green))]"
                />
                <span
                  className="font-medium text-sm flex-1 text-left"
                  style={{ color: 'hsl(var(--mountain-green))' }}
                >
                  {category.title}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    expandedCategories[category.id] ? 'rotate-0' : '-rotate-90'
                  )}
                  style={{ color: 'hsl(var(--smoke-gray))' }}
                />
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  expandedCategories[category.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="pl-4 pt-1 space-y-0.5">
                  {category.items.map((item) => {
                    const isAction = item.path === '#';
                    const inner = (
                      <>
                        <item.icon
                          className={cn(
                            'w-4 h-4 transition-colors flex-shrink-0 ml-1',
                            !isAction && isItemActive(item.path)
                              ? 'text-[hsl(var(--cinnabar))]'
                              : 'text-[hsl(var(--smoke-gray))] group-hover:text-[hsl(var(--ink-green))]'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm',
                            !isAction && isItemActive(item.path)
                              ? 'font-medium text-[hsl(var(--ink-green))]'
                              : 'text-[hsl(var(--smoke-gray))] group-hover:text-[hsl(var(--ink-green))]'
                          )}
                        >
                          {item.label}
                        </span>
                      </>
                    );
                    const cls = cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group w-full text-left',
                      !isAction && isItemActive(item.path)
                        ? 'shadow-soft'
                        : 'hover:bg-[hsl(var(--paper-yellow))]',
                    );
                    const sty = {
                      background: !isAction && isItemActive(item.path)
                        ? 'hsl(var(--paper-yellow))'
                        : 'transparent',
                      border: !isAction && isItemActive(item.path)
                        ? '1px solid hsl(var(--light-ink))'
                        : '1px solid transparent',
                    };

                    if (isAction) {
                      return (
                        <button
                          key={item.label}
                          onClick={() => { openInstall(); onClose(); }}
                          className={cls}
                          style={sty}
                        >
                          {inner}
                        </button>
                      );
                    }
                    return (
                      <Link key={item.path} to={item.path} onClick={onClose} className={cls} style={sty}>
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div
          className="p-3"
          style={{ borderTop: '1px solid hsl(var(--light-ink))' }}
        >
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
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
                onClick={onClose}
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'hsl(var(--mountain-green))' }}
              >
                <User className="w-4 h-4" />
                <span>登录</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
