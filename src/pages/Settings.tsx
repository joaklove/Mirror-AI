import { Link } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  BarChart3,
  Download,
  ChevronRight,
  Sparkles,
  User,
  Moon,
  Sun,
  Languages,
  Tag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { journalService } from '@/services/journalService';
import { useQuery } from '@tanstack/react-query';
import { InkBackground } from '@/components/InkBackground';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, customTheme, setTheme, setCustomThemePreference, toggleTheme, themeConfigs } = useTheme();
  const { i18n } = useTranslation();
  
  const { data: entries = [] } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => journalService.getEntries(),
    enabled: !!user,
  });

  const settingsItems = [
    {
      icon: Bell,
      label: '提醒设置',
      description: '配置推送通知和提醒时间',
      href: '/reminders',
      color: 'text-[hsl(45,80%,50%)]',
      bgColor: 'bg-[hsla(45,80%,50%,0.08)]',
    },
    {
      icon: Shield,
      label: '隐私设置',
      description: '管理数据加密和隐私选项',
      href: '/privacy',
      color: 'text-[hsl(168,16%,42%)]',
      bgColor: 'bg-[hsla(168,16%,42%,0.08)]',
    },
    {
      icon: Palette,
      label: '主题设置',
      description: '切换明亮/暗色/国风主题',
      href: '/settings',
      color: 'text-[hsl(270,50%,55%)]',
      bgColor: 'bg-[hsla(270,50%,55%,0.08)]',
    },
    {
      icon: BarChart3,
      label: '维度开关',
      description: '选择启用哪些记录维度',
      href: '/settings',
      color: 'text-[hsl(350,60%,50%)]',
      bgColor: 'bg-[hsla(350,60%,50%,0.08)]',
    },
    {
      icon: Tag,
      label: '标签管理',
      description: '管理自定义标签',
      href: '/tags',
      color: 'text-[hsl(45,80%,50%)]',
      bgColor: 'bg-[hsla(45,80%,50%,0.08)]',
    },
    {
      icon: Download,
      label: '数据管理',
      description: '导出或删除你的数据',
      href: '/settings',
      color: 'text-[hsl(200,60%,50%)]',
      bgColor: 'bg-[hsla(200,60%,50%,0.08)]',
    },
  ];

  const quickToggles = [
    {
      icon: Moon,
      label: '深色模式',
      active: theme === 'dark',
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      icon: Languages,
      label: i18n.language === 'zh' ? '简体中文' : i18n.language === 'en' ? 'English' : '日本語',
      active: true,
      onClick: () => {
        const languages = ['zh', 'en', 'ja'];
        const currentIndex = languages.indexOf(i18n.language);
        const nextLanguage = languages[(currentIndex + 1) % languages.length];
        i18n.changeLanguage(nextLanguage);
      },
    },
    {
      icon: Sun,
      label: '自动主题',
      active: theme === 'system',
      onClick: () => {
        const themeOrder: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
        const currentIndex = themeOrder.indexOf(theme);
        const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
        setTheme(nextTheme);
      },
    },
  ];

  return (
    <div className="min-h-screen relative">
      <InkBackground intensity="light" />
      
      <header 
        className="sticky top-0 z-10 dao-glass shadow-sm"
        style={{ borderBottom: '1px solid hsl(var(--light-ink))' }}
      >
        <div className="content-container py-4 px-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
            <h1 
              className="text-lg font-semibold"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
                marginBottom: '0.25rem',
              }}
            >
              设置
            </h1>
          </div>
          <p 
            className="text-xs"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            管理你的应用设置
          </p>
        </div>
      </header>

      <main className="content-container py-8 pb-32 relative z-10">
        <Card 
          className="dao-card p-6 mb-6 animate-fade-in-up"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ 
                background: 'hsl(var(--paper-yellow))',
                border: '2px solid hsl(var(--light-ink))',
              }}
            >
              <User className="w-8 h-8" style={{ color: 'hsl(var(--mountain-green))' }} />
            </div>
            <div className="flex-1">
              <h2 
                className="text-lg font-medium"
                style={{ color: 'hsl(var(--ink-green))' }}
              >
                {user?.email?.split('@')[0] || '用户'}
              </h2>
              <p 
                className="text-sm"
                style={{ color: 'hsl(var(--smoke-gray))' }}
              >
                {user?.email}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    background: 'hsl(var(--light-ink))',
                    color: 'hsl(var(--mountain-green))',
                  }}
                >
                  {entries.length} 条记录
                </span>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    background: 'hsla(9,52%,53%,0.1)',
                    color: 'hsl(var(--cinnabar))',
                  }}
                >
                  免费版
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 
            className="text-sm font-medium mb-3"
            style={{ color: 'hsl(var(--ink-green))' }}
          >
            快速设置
          </h2>
          <div className="flex gap-3">
            {quickToggles.map((toggle) => (
              <button
                key={toggle.label}
                onClick={toggle.onClick}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer',
                  toggle.active 
                    ? 'shadow-soft' 
                    : 'hover:shadow-subtle'
                )}
                style={{
                  background: toggle.active 
                    ? 'hsl(var(--paper-yellow))' 
                    : 'hsl(var(--cloud-white))',
                  border: toggle.active 
                    ? '1px solid hsl(var(--cinnabar))' 
                    : '1px solid hsl(var(--light-ink))',
                }}
              >
                <toggle.icon 
                  className="w-4 h-4" 
                  style={{ 
                    color: toggle.active 
                      ? 'hsl(var(--cinnabar))' 
                      : 'hsl(var(--mountain-green))' 
                  }} 
                />
                <span 
                  className="text-sm"
                  style={{ color: 'hsl(var(--ink-green))' }}
                >
                  {toggle.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h2 
            className="text-sm font-medium mb-3"
            style={{ color: 'hsl(var(--ink-green))' }}
          >
            选择主题
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(Object.keys(themeConfigs) as Array<keyof typeof themeConfigs>).map((key) => (
              <button
                key={key}
                onClick={() => setCustomThemePreference(key)}
                className={cn(
                  'p-4 rounded-xl transition-all text-left group relative overflow-hidden',
                  customTheme === key 
                    ? 'shadow-soft border-2' 
                    : 'hover:shadow-subtle border hover:scale-[1.02]'
                )}
                style={{
                  background: customTheme === key ? 'hsl(var(--paper-yellow))' : 'hsl(var(--cloud-white))',
                  borderColor: customTheme === key ? 'hsl(var(--cinnabar))' : 'hsl(var(--light-ink))',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ background: `hsl(${themeConfigs[key].inkGreen})` }}
                />
                <div className="relative">
                  <div className="flex gap-1.5 mb-3">
                    <div 
                      className="w-6 h-6 rounded-full shadow-sm" 
                      style={{ background: `hsl(${themeConfigs[key].inkGreen})` }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full shadow-sm" 
                      style={{ background: `hsl(${themeConfigs[key].mountainGreen})` }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full shadow-sm" 
                      style={{ background: `hsl(${themeConfigs[key].cinnabar})` }}
                    />
                  </div>
                  <div className="h-1 rounded-full mb-3" style={{ background: themeConfigs[key].gradientBg }} />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'hsl(var(--ink-green))' }}
                  >
                    {key === 'default' ? '默认' : 
                     key === 'nature' ? '自然' : 
                     key === 'ocean' ? '海洋' : 
                     key === 'forest' ? '森林' : '日落'}
                  </span>
                  <p className="text-xs mt-1 opacity-70" style={{ color: 'hsl(var(--smoke-gray))' }}>
                    {key === 'default' && '经典墨绿 + 朱砂红'}
                    {key === 'nature' && '清新绿色系'}
                    {key === 'ocean' && '蓝色静谧风格'}
                    {key === 'forest' && '深绿森林色调'}
                    {key === 'sunset' && '暖色夕阳风格'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 
            className="text-sm font-medium mb-3"
            style={{ color: 'hsl(var(--ink-green))' }}
          >
            详细设置
          </h2>
          
          {settingsItems.map((item) => (
            <Link key={item.label} to={item.href}>
              <Card className="dao-card hover:shadow-soft transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-2.5 rounded-xl', item.bgColor)}>
                      <item.icon className={cn('w-5 h-5', item.color)} />
                    </div>
                    <div className="flex-1">
                      <div 
                        className="font-medium"
                        style={{ color: 'hsl(var(--ink-green))' }}
                      >
                        {item.label}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: 'hsl(var(--smoke-gray))' }}
                      >
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight 
                      className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                      style={{ color: 'hsl(var(--smoke-gray))' }} 
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card 
          className="dao-card mt-6 p-6 text-center animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--cinnabar))' }} />
            <span 
              className="font-medium"
              style={{ 
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--ink-green))',
              }}
            >
              心镜 AI
            </span>
          </div>
          <p 
            className="text-sm"
            style={{ color: 'hsl(var(--mountain-green))' }}
          >
            照见内心 · 道法自然
          </p>
          <p 
            className="text-xs mt-2"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            版本 1.0.0 · 共 {entries.length} 条记录
          </p>
        </Card>

        <div 
          className="mt-8 text-center animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <p 
            className="text-sm italic"
            style={{ color: 'hsl(var(--smoke-gray))' }}
          >
            「上善若水，水善利万物而不争」
          </p>
          <p 
            className="text-xs mt-1"
            style={{ color: 'hsl(var(--smoke-gray))', opacity: 0.7 }}
          >
            ——《道德经》
          </p>
        </div>
      </main>
    </div>
  );
}
