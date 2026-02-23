import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Brain,
  Sparkles,
  TrendingUp,
  Activity,
  Heart,
  Leaf,
  Users,
  BookOpen,
  GraduationCap,
  Stethoscope,
  TreePine,
  Tag,
  Plug,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { TaijiIconSimple } from './TaijiIcon';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onSignOut?: () => void;
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
    id: 'ai-analysis',
    title: 'AI分析',
    icon: Brain,
    defaultExpanded: true,
    items: [
      { path: '/analysis', label: '分析', icon: Brain },
      { path: '/multimodal', label: '多模态分析', icon: Sparkles },
      { path: '/predictive', label: '预测性分析', icon: TrendingUp },
      { path: '/context', label: '情境分析', icon: Activity },
      { path: '/recommendation', label: '个性化推荐', icon: Sparkles },
      { path: '/professional', label: '专业领域分析', icon: BookOpen },
    ],
  },
  {
    id: 'life',
    title: '生活',
    icon: Heart,
    defaultExpanded: true,
    items: [
      { path: '/social', label: '社交与协作', icon: Users },
      { path: '/life-quality', label: '生活品质提升', icon: Heart },
      { path: '/personal-growth', label: '个人成长生态', icon: GraduationCap },
      { path: '/health', label: '健康生活倡导', icon: Stethoscope },
      { path: '/sustainable', label: '可持续生活', icon: TreePine },
    ],
  },
  {
    id: 'management',
    title: '管理',
    icon: Settings,
    defaultExpanded: false,
    items: [
      { path: '/tags', label: '标签', icon: Tag },
      { path: '/integrations', label: '第三方集成', icon: Plug },
      { path: '/settings', label: '设置', icon: Settings },
    ],
  },
];

const homeItem = { path: '/', label: '首页', icon: Home };

export function Sidebar({ onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navCategories.forEach(cat => {
      initial[cat.id] = cat.defaultExpanded ?? false;
    });
    return initial;
  });
  const location = useLocation();
  const { user } = useAuth();

  const isExpanded = !collapsed || isHovered;

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
        'fixed left-0 top-0 h-screen dao-glass transition-all duration-300 z-40',
        isExpanded ? 'w-64' : 'w-16'
      )}
      style={{
        borderRight: '1px solid hsl(var(--light-ink))',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        <div 
          className={cn(
            'p-4 flex items-center transition-all',
            isExpanded ? 'justify-between' : 'justify-center'
          )}
          style={{ 
            borderBottom: '1px solid hsl(var(--light-ink))',
          }}
        >
          {isExpanded ? (
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

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {isExpanded && (
            <Link
              to={homeItem.path}
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
          )}

          {!isExpanded && (
            <Link
              to={homeItem.path}
              className={cn(
                'flex items-center justify-center py-3 rounded-xl transition-all duration-200 group',
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
              title={homeItem.label}
            >
              <homeItem.icon 
                className={cn(
                  'w-5 h-5 transition-colors',
                  isItemActive(homeItem.path) 
                    ? 'text-[hsl(var(--cinnabar))]' 
                    : 'text-[hsl(var(--mountain-green))] group-hover:text-[hsl(var(--ink-green))]'
                )} 
              />
            </Link>
          )}

          <div className="pt-2" />

          {navCategories.map((category) => (
            <div key={category.id}>
              {isExpanded ? (
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
              ) : (
                <div
                  className={cn(
                    'flex items-center justify-center py-2.5 rounded-xl',
                    'hover:bg-[hsl(var(--paper-yellow))]',
                    'cursor-pointer'
                  )}
                  title={category.title}
                >
                  <category.icon 
                    className="w-5 h-5 text-[hsl(var(--mountain-green))] group-hover:text-[hsl(var(--ink-green))]" 
                  />
                </div>
              )}

              <div 
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  isExpanded && expandedCategories[category.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
                  !isExpanded && 'hidden'
                )}
              >
                <div className="pl-4 pt-1 space-y-0.5">
                  {category.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                        isItemActive(item.path) 
                          ? 'shadow-soft' 
                          : 'hover:bg-[hsl(var(--paper-yellow))]',
                      )}
                      style={{
                        background: isItemActive(item.path) 
                          ? 'hsl(var(--paper-yellow))' 
                          : 'transparent',
                        border: isItemActive(item.path) 
                          ? '1px solid hsl(var(--light-ink))' 
                          : '1px solid transparent',
                      }}
                    >
                      <item.icon 
                        className={cn(
                          'w-4 h-4 transition-colors flex-shrink-0 ml-1',
                          isItemActive(item.path) 
                            ? 'text-[hsl(var(--cinnabar))]' 
                            : 'text-[hsl(var(--smoke-gray))] group-hover:text-[hsl(var(--ink-green))]'
                        )} 
                      />
                      <span 
                        className={cn(
                          'text-sm',
                          isItemActive(item.path) 
                            ? 'font-medium text-[hsl(var(--ink-green))]' 
                            : 'text-[hsl(var(--smoke-gray))] group-hover:text-[hsl(var(--ink-green))]'
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div 
          className="p-3"
          style={{ borderTop: '1px solid hsl(var(--light-ink))' }}
        >
          <div className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-xl',
            !isExpanded && 'justify-center'
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
                {isExpanded && (
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
                  !isExpanded && 'justify-center'
                )}
                style={{ color: 'hsl(var(--mountain-green))' }}
              >
                <User className="w-4 h-4" />
                {isExpanded && <span>登录</span>}
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function getSidebarWidth(collapsed: boolean, isHovered: boolean = false): string {
  const isExpanded = !collapsed || isHovered;
  return isExpanded ? 'ml-64' : 'ml-16';
}

export default Sidebar;
