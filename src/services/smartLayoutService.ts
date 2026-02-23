import { usageTrackingService, getDeviceType } from './usageTrackingService';

interface LayoutConfig {
  sidebarCollapsed: boolean;
  dashboardLayout: 'grid' | 'list' | 'compact';
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'comfortable' | 'spacious';
  showQuickActions: boolean;
  showNotifications: boolean;
  preferredDeviceType: 'mobile' | 'tablet' | 'desktop';
  lastUpdated: number;
}

interface LayoutPreference {
  deviceType: string;
  timeOfDay: string;
  config: LayoutConfig;
}

const LAYOUT_STORAGE_KEY = 'mirror-ai-layout-config';
const LAYOUT_PREFERENCES_KEY = 'mirror-ai-layout-preferences';

class SmartLayoutService {
  private layoutConfig: LayoutConfig;
  private layoutPreferences: LayoutPreference[];

  constructor() {
    this.layoutConfig = this.loadLayoutConfig();
    this.layoutPreferences = this.loadLayoutPreferences();
  }

  private loadLayoutConfig(): LayoutConfig {
    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load layout config:', error);
    }

    // 默认布局配置
    return {
      sidebarCollapsed: false,
      dashboardLayout: 'grid',
      fontSize: 'medium',
      spacing: 'comfortable',
      showQuickActions: true,
      showNotifications: true,
      preferredDeviceType: getDeviceType() as 'mobile' | 'tablet' | 'desktop',
      lastUpdated: Date.now(),
    };
  }

  private loadLayoutPreferences(): LayoutPreference[] {
    try {
      const stored = localStorage.getItem(LAYOUT_PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load layout preferences:', error);
    }

    return [];
  }

  private saveLayoutConfig() {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(this.layoutConfig));
    } catch (error) {
      console.error('Failed to save layout config:', error);
    }
  }

  private saveLayoutPreferences() {
    try {
      localStorage.setItem(LAYOUT_PREFERENCES_KEY, JSON.stringify(this.layoutPreferences));
    } catch (error) {
      console.error('Failed to save layout preferences:', error);
    }
  }

  // 基于用户使用习惯自动调整布局
  adjustLayoutBasedOnUsage() {
    const usagePatterns = usageTrackingService.getUsagePatterns();
    const deviceType = getDeviceType();
    const hour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(hour);

    // 检查是否有匹配的偏好设置
    const matchedPreference = this.layoutPreferences.find(
      pref => pref.deviceType === deviceType && pref.timeOfDay === timeOfDay
    );

    if (matchedPreference) {
      // 使用匹配的偏好设置
      this.layoutConfig = {
        ...matchedPreference.config,
        lastUpdated: Date.now(),
      };
    } else {
      // 基于使用模式自动调整
      this.autoAdjustLayout(usagePatterns, deviceType, timeOfDay);
    }

    this.saveLayoutConfig();
    return this.layoutConfig;
  }

  private getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  private autoAdjustLayout(usagePatterns: any, deviceType: string, timeOfDay: string) {
    // 基于最常用功能调整布局
    if (usagePatterns.mostUsedFeatures.length > 0) {
      // 如果用户经常使用侧边栏功能，保持侧边栏展开
      const sidebarUsage = usagePatterns.mostUsedFeatures.some((feature: string) => 
        feature.includes('sidebar')
      );
      this.layoutConfig.sidebarCollapsed = !sidebarUsage;

      // 如果用户经常使用快速操作，显示快速操作栏
      const quickActionUsage = usagePatterns.mostUsedFeatures.some((feature: string) => 
        feature.includes('quick-action')
      );
      this.layoutConfig.showQuickActions = quickActionUsage;
    }

    // 基于设备类型调整布局
    switch (deviceType) {
      case 'mobile':
        this.layoutConfig.sidebarCollapsed = true;
        this.layoutConfig.dashboardLayout = 'list';
        this.layoutConfig.fontSize = 'medium';
        this.layoutConfig.spacing = 'compact';
        break;
      case 'tablet':
        this.layoutConfig.sidebarCollapsed = false;
        this.layoutConfig.dashboardLayout = 'grid';
        this.layoutConfig.fontSize = 'medium';
        this.layoutConfig.spacing = 'comfortable';
        break;
      case 'desktop':
        this.layoutConfig.sidebarCollapsed = false;
        this.layoutConfig.dashboardLayout = 'grid';
        this.layoutConfig.fontSize = 'medium';
        this.layoutConfig.spacing = 'spacious';
        break;
    }

    // 基于时间调整布局
    if (timeOfDay === 'evening') {
      // 晚上使用更紧凑的布局，减少视觉刺激
      this.layoutConfig.fontSize = 'medium';
      this.layoutConfig.spacing = 'comfortable';
    }

    // 保存新的布局偏好
    this.saveLayoutPreference(deviceType, timeOfDay, { ...this.layoutConfig });
  }

  private saveLayoutPreference(deviceType: string, timeOfDay: string, config: LayoutConfig) {
    const existingIndex = this.layoutPreferences.findIndex(
      pref => pref.deviceType === deviceType && pref.timeOfDay === timeOfDay
    );

    const preference: LayoutPreference = {
      deviceType,
      timeOfDay,
      config,
    };

    if (existingIndex >= 0) {
      this.layoutPreferences[existingIndex] = preference;
    } else {
      // 只保留最近的10个偏好设置
      if (this.layoutPreferences.length >= 10) {
        this.layoutPreferences.shift();
      }
      this.layoutPreferences.push(preference);
    }

    this.saveLayoutPreferences();
  }

  // 手动更新布局配置
  updateLayoutConfig(config: Partial<LayoutConfig>) {
    this.layoutConfig = {
      ...this.layoutConfig,
      ...config,
      lastUpdated: Date.now(),
    };

    // 保存当前设备和时间的布局偏好
    const deviceType = getDeviceType();
    const hour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(hour);
    this.saveLayoutPreference(deviceType, timeOfDay, { ...this.layoutConfig });

    this.saveLayoutConfig();
    return this.layoutConfig;
  }

  // 获取当前布局配置
  getLayoutConfig(): LayoutConfig {
    // 定期更新布局配置
    if (Date.now() - this.layoutConfig.lastUpdated > 60000) { // 1分钟
      return this.adjustLayoutBasedOnUsage();
    }
    return this.layoutConfig;
  }

  // 重置布局到默认值
  resetLayout() {
    this.layoutConfig = {
      sidebarCollapsed: false,
      dashboardLayout: 'grid',
      fontSize: 'medium',
      spacing: 'comfortable',
      showQuickActions: true,
      showNotifications: true,
      preferredDeviceType: getDeviceType() as 'mobile' | 'tablet' | 'desktop',
      lastUpdated: Date.now(),
    };

    this.saveLayoutConfig();
    return this.layoutConfig;
  }

  // 获取布局建议
  getLayoutSuggestions(): LayoutConfig {
    const usagePatterns = usageTrackingService.getUsagePatterns();
    const deviceType = getDeviceType();
    const hour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(hour);

    // 基于使用模式生成建议
    const suggestions: LayoutConfig = {
      ...this.layoutConfig,
    };

    // 基于设备使用偏好
    if (usagePatterns.devicePreferences) {
      const preferredDevice = Object.entries(usagePatterns.devicePreferences)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      if (preferredDevice) {
        suggestions.preferredDeviceType = preferredDevice as 'mobile' | 'tablet' | 'desktop';
      }
    }

    // 基于时间使用模式
    if (usagePatterns.timeBasedPatterns) {
      const peakHour = Object.entries(usagePatterns.timeBasedPatterns)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      if (peakHour) {
        // 在高峰使用时间，使用更高效的布局
        suggestions.spacing = 'compact';
        suggestions.showQuickActions = true;
      }
    }

    return suggestions;
  }

  // 导出布局配置
  exportLayoutConfig(): string {
    return JSON.stringify(this.layoutConfig, null, 2);
  }

  // 导入布局配置
  importLayoutConfig(configString: string): boolean {
    try {
      const config = JSON.parse(configString);
      this.layoutConfig = {
        ...this.layoutConfig,
        ...config,
        lastUpdated: Date.now(),
      };
      this.saveLayoutConfig();
      return true;
    } catch (error) {
      console.error('Failed to import layout config:', error);
      return false;
    }
  }
}

export const smartLayoutService = new SmartLayoutService();

// 自定义Hook，用于在组件中使用智能布局
export function useSmartLayout() {
  const getLayout = () => smartLayoutService.getLayoutConfig();
  const updateLayout = (config: Partial<LayoutConfig>) => smartLayoutService.updateLayoutConfig(config);
  const resetLayout = () => smartLayoutService.resetLayout();
  const getSuggestions = () => smartLayoutService.getLayoutSuggestions();
  const adjustLayout = () => smartLayoutService.adjustLayoutBasedOnUsage();

  return {
    getLayout,
    updateLayout,
    resetLayout,
    getSuggestions,
    adjustLayout,
  };
}
