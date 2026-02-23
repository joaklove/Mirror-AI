import React from 'react';
import { useSmartLayout } from '@/services/smartLayoutService';

interface LayoutPreferencesProps {
  className?: string;
}

export function LayoutPreferences({ className }: LayoutPreferencesProps) {
  const { getLayout, updateLayout, resetLayout, getSuggestions } = useSmartLayout();
  const layoutConfig = getLayout();

  const handleSidebarToggle = () => {
    updateLayout({ sidebarCollapsed: !layoutConfig.sidebarCollapsed });
  };

  const handleDashboardLayoutChange = (layout: 'grid' | 'list' | 'compact') => {
    updateLayout({ dashboardLayout: layout });
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateLayout({ fontSize: size });
  };

  const handleSpacingChange = (spacing: 'compact' | 'comfortable' | 'spacious') => {
    updateLayout({ spacing: spacing });
  };

  const handleQuickActionsToggle = () => {
    updateLayout({ showQuickActions: !layoutConfig.showQuickActions });
  };

  const handleNotificationsToggle = () => {
    updateLayout({ showNotifications: !layoutConfig.showNotifications });
  };

  const handleReset = () => {
    resetLayout();
  };

  const handleApplySuggestions = () => {
    const suggestions = getSuggestions();
    updateLayout(suggestions);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-medium mb-4">布局偏好设置</h3>
        
        <div className="space-y-6">
          {/* 侧边栏设置 */}
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">侧边栏</span>
              <button
                onClick={handleSidebarToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input`}
                data-state={layoutConfig.sidebarCollapsed ? 'unchecked' : 'checked'}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1`}></span>
              </button>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              {layoutConfig.sidebarCollapsed ? '侧边栏已折叠' : '侧边栏已展开'}
            </p>
          </div>

          {/* 仪表板布局 */}
          <div>
            <label className="block text-sm font-medium mb-2">仪表板布局</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDashboardLayoutChange('grid')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.dashboardLayout === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                网格
              </button>
              <button
                onClick={() => handleDashboardLayoutChange('list')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.dashboardLayout === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                列表
              </button>
              <button
                onClick={() => handleDashboardLayoutChange('compact')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.dashboardLayout === 'compact' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                紧凑
              </button>
            </div>
          </div>

          {/* 字体大小 */}
          <div>
            <label className="block text-sm font-medium mb-2">字体大小</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFontSizeChange('small')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.fontSize === 'small' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                小
              </button>
              <button
                onClick={() => handleFontSizeChange('medium')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.fontSize === 'medium' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                中
              </button>
              <button
                onClick={() => handleFontSizeChange('large')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.fontSize === 'large' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                大
              </button>
            </div>
          </div>

          {/* 间距 */}
          <div>
            <label className="block text-sm font-medium mb-2">间距</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSpacingChange('compact')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.spacing === 'compact' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                紧凑
              </button>
              <button
                onClick={() => handleSpacingChange('comfortable')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.spacing === 'comfortable' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                舒适
              </button>
              <button
                onClick={() => handleSpacingChange('spacious')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${layoutConfig.spacing === 'spacious' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                宽敞
              </button>
            </div>
          </div>

          {/* 快速操作 */}
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">显示快速操作</span>
              <button
                onClick={handleQuickActionsToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input`}
                data-state={layoutConfig.showQuickActions ? 'checked' : 'unchecked'}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1`}></span>
              </button>
            </label>
          </div>

          {/* 通知 */}
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">显示通知</span>
              <button
                onClick={handleNotificationsToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input`}
                data-state={layoutConfig.showNotifications ? 'checked' : 'unchecked'}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1`}></span>
              </button>
            </label>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={handleApplySuggestions}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              应用建议布局
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              重置为默认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
