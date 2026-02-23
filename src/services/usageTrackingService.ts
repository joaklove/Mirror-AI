import { useEffect, useCallback } from 'react';

interface UserInteraction {
  type: string;
  target: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface UsagePattern {
  featureUsage: Record<string, number>;
  mostUsedFeatures: string[];
  devicePreferences: Record<string, number>;
  navigationPatterns: Record<string, number>;
  timeBasedPatterns: Record<string, number>;
}

const USAGE_STORAGE_KEY = 'mirror-ai-usage-data';
const PATTERNS_STORAGE_KEY = 'mirror-ai-usage-patterns';

class UsageTrackingService {
  private interactions: UserInteraction[] = [];
  private lastInteractionTime: Record<string, number> = {};

  constructor() {
    this.loadInteractions();
  }

  private loadInteractions() {
    try {
      const stored = localStorage.getItem(USAGE_STORAGE_KEY);
      if (stored) {
        this.interactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load usage data:', error);
    }
  }

  private saveInteractions() {
    try {
      // 只保留最近1000条交互记录
      const recentInteractions = this.interactions.slice(-1000);
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(recentInteractions));
    } catch (error) {
      console.error('Failed to save usage data:', error);
    }
  }

  trackInteraction(type: string, target: string, metadata?: Record<string, any>) {
    const interaction: UserInteraction = {
      type,
      target,
      timestamp: Date.now(),
      metadata,
    };

    this.interactions.push(interaction);
    this.saveInteractions();
    this.updatePatterns();
  }

  trackInteractionStart(type: string, target: string) {
    this.lastInteractionTime[`${type}:${target}`] = Date.now();
  }

  trackInteractionEnd(type: string, target: string, metadata?: Record<string, any>) {
    const startTime = this.lastInteractionTime[`${type}:${target}`];
    if (startTime) {
      const duration = Date.now() - startTime;
      const interaction: UserInteraction = {
        type,
        target,
        timestamp: Date.now(),
        duration,
        metadata,
      };

      this.interactions.push(interaction);
      this.saveInteractions();
      this.updatePatterns();
      delete this.lastInteractionTime[`${type}:${target}`];
    }
  }

  private updatePatterns() {
    const patterns = this.analyzePatterns();
    try {
      localStorage.setItem(PATTERNS_STORAGE_KEY, JSON.stringify(patterns));
    } catch (error) {
      console.error('Failed to save usage patterns:', error);
    }
  }

  private analyzePatterns(): UsagePattern {
    const featureUsage: Record<string, number> = {};
    const devicePreferences: Record<string, number> = {};
    const navigationPatterns: Record<string, number> = {};
    const timeBasedPatterns: Record<string, number> = {};

    // 分析交互数据
    this.interactions.forEach(interaction => {
      // 功能使用统计
      if (interaction.type === 'click' || interaction.type === 'hover') {
        featureUsage[interaction.target] = (featureUsage[interaction.target] || 0) + 1;
      }

      // 设备偏好统计
      if (interaction.metadata?.deviceType) {
        devicePreferences[interaction.metadata.deviceType] = (devicePreferences[interaction.metadata.deviceType] || 0) + 1;
      }

      // 导航模式统计
      if (interaction.type === 'navigate') {
        navigationPatterns[interaction.target] = (navigationPatterns[interaction.target] || 0) + 1;
      }

      // 时间模式统计
      const hour = new Date(interaction.timestamp).getHours();
      const timeSlot = `${hour}:00-${hour + 1}:00`;
      timeBasedPatterns[timeSlot] = (timeBasedPatterns[timeSlot] || 0) + 1;
    });

    // 计算最常用功能
    const mostUsedFeatures = Object.entries(featureUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature]) => feature);

    return {
      featureUsage,
      mostUsedFeatures,
      devicePreferences,
      navigationPatterns,
      timeBasedPatterns,
    };
  }

  getUsagePatterns(): UsagePattern {
    try {
      const stored = localStorage.getItem(PATTERNS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load usage patterns:', error);
    }

    // 如果没有存储的模式，返回默认值
    return {
      featureUsage: {},
      mostUsedFeatures: [],
      devicePreferences: {},
      navigationPatterns: {},
      timeBasedPatterns: {},
    };
  }

  clearUsageData() {
    this.interactions = [];
    try {
      localStorage.removeItem(USAGE_STORAGE_KEY);
      localStorage.removeItem(PATTERNS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear usage data:', error);
    }
  }
}

export const usageTrackingService = new UsageTrackingService();

// 自定义Hook，用于跟踪组件级别的交互
export function useUsageTracking(componentName: string) {
  const trackClick = useCallback((element: string, metadata?: Record<string, any>) => {
    usageTrackingService.trackInteraction('click', `${componentName}:${element}`, metadata);
  }, [componentName]);

  const trackHover = useCallback((element: string, metadata?: Record<string, any>) => {
    usageTrackingService.trackInteraction('hover', `${componentName}:${element}`, metadata);
  }, [componentName]);

  const trackNavigation = useCallback((path: string, metadata?: Record<string, any>) => {
    usageTrackingService.trackInteraction('navigate', path, metadata);
  }, []);

  const trackInteractionStart = useCallback((element: string) => {
    usageTrackingService.trackInteractionStart('interaction', `${componentName}:${element}`);
  }, [componentName]);

  const trackInteractionEnd = useCallback((element: string, metadata?: Record<string, any>) => {
    usageTrackingService.trackInteractionEnd('interaction', `${componentName}:${element}`, metadata);
  }, [componentName]);

  return {
    trackClick,
    trackHover,
    trackNavigation,
    trackInteractionStart,
    trackInteractionEnd,
  };
}

// 设备类型检测
export function getDeviceType() {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// 屏幕尺寸检测
export function getScreenSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    deviceType: getDeviceType(),
  };
}
