import React, { useState } from 'react';
import { useTheme, CustomTheme, themeConfigs } from '@/hooks/useTheme';

interface ThemeManagerProps {
  className?: string;
}

const themeNames: Record<CustomTheme, string> = {
  default: '默认',
  nature: '自然',
  ocean: '海洋',
  forest: '森林',
  sunset: '日落',
  night: '夜晚',
  lavender: '薰衣草',
  desert: '沙漠',
  sky: '天空',
  emerald: '翡翠',
};

export function ThemeManager({ className }: ThemeManagerProps) {
  const { theme, customTheme, setTheme, setCustomThemePreference } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<CustomTheme | null>(null);

  const handleThemeChange = (newTheme: CustomTheme) => {
    setCustomThemePreference(newTheme);
  };

  const handleSystemThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handlePreview = (theme: CustomTheme) => {
    setPreviewTheme(theme);
  };

  const handlePreviewClose = () => {
    setPreviewTheme(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-medium mb-4">主题设置</h3>
        
        <div className="space-y-4">
          {/* 系统主题选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">系统主题</label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleSystemThemeChange('light')}
                className={`px-4 py-2 rounded-md transition-all ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                浅色
              </button>
              <button
                onClick={() => handleSystemThemeChange('dark')}
                className={`px-4 py-2 rounded-md transition-all ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                深色
              </button>
              <button
                onClick={() => handleSystemThemeChange('system')}
                className={`px-4 py-2 rounded-md transition-all ${theme === 'system' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                跟随系统
              </button>
            </div>
          </div>

          {/* 自定义主题选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">自定义主题</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(themeConfigs).map(([themeKey, themeConfig]) => {
                const key = themeKey as CustomTheme;
                return (
                  <div key={key} className="relative">
                    <button
                      onClick={() => handleThemeChange(key)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${customTheme === key ? 'border-primary ring-2 ring-primary/50' : 'border-transparent hover:border-muted'}`}
                      style={{
                        background: themeConfig.gradientBg,
                      }}
                      onMouseEnter={() => handlePreview(key)}
                      onMouseLeave={handlePreviewClose}
                      aria-label={`选择${themeNames[key]}主题`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {themeNames[key]}
                        </span>
                      </div>
                    </button>
                    {customTheme === key && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary-foreground"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 主题预览 */}
      {previewTheme && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h4 className="text-lg font-medium mb-4">主题预览: {themeNames[previewTheme]}</h4>
            <div className="rounded-lg p-4" style={{
              background: themeConfigs[previewTheme].gradientBg,
              color: 'white',
            }}>
              <div className="space-y-2">
                <div className="h-4 bg-white/20 rounded"></div>
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
                <div className="flex space-x-2 mt-4">
                  <div className="h-8 w-8 bg-white/30 rounded-full"></div>
                  <div className="h-8 w-8 bg-white/30 rounded-full"></div>
                  <div className="h-8 w-8 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
            <button
              onClick={handlePreviewClose}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              关闭预览
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
