interface AccessibilityConfig {
  highContrast: boolean;
  reduceMotion: boolean;
  textSize: 'small' | 'medium' | 'large' | 'x-large';
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  captionsEnabled: boolean;
  audioDescription: boolean;
  focusIndicator: boolean;
  simplifiedUI: boolean;
  lastUpdated: number;
}

const ACCESSIBILITY_STORAGE_KEY = 'mirror-ai-accessibility-config';

class AccessibilityService {
  private accessibilityConfig: AccessibilityConfig;

  constructor() {
    this.accessibilityConfig = this.loadAccessibilityConfig();
    this.applyAccessibilitySettings();
  }

  private loadAccessibilityConfig(): AccessibilityConfig {
    try {
      const stored = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load accessibility config:', error);
    }

    // 默认无障碍配置
    return {
      highContrast: false,
      reduceMotion: false,
      textSize: 'medium',
      keyboardNavigation: true,
      screenReaderSupport: true,
      captionsEnabled: true,
      audioDescription: false,
      focusIndicator: true,
      simplifiedUI: false,
      lastUpdated: Date.now(),
    };
  }

  private saveAccessibilityConfig() {
    try {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(this.accessibilityConfig));
    } catch (error) {
      console.error('Failed to save accessibility config:', error);
    }
  }

  private applyAccessibilitySettings() {
    const root = document.documentElement;

    // 高对比度模式
    if (this.accessibilityConfig.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 减少动画
    if (this.accessibilityConfig.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // 文本大小
    root.style.setProperty('--text-size', this.accessibilityConfig.textSize);

    // 键盘导航
    if (this.accessibilityConfig.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }

    // 焦点指示器
    if (this.accessibilityConfig.focusIndicator) {
      root.classList.add('focus-indicator');
    } else {
      root.classList.remove('focus-indicator');
    }

    // 简化UI
    if (this.accessibilityConfig.simplifiedUI) {
      root.classList.add('simplified-ui');
    } else {
      root.classList.remove('simplified-ui');
    }
  }

  // 更新无障碍配置
  updateAccessibilityConfig(config: Partial<AccessibilityConfig>) {
    this.accessibilityConfig = {
      ...this.accessibilityConfig,
      ...config,
      lastUpdated: Date.now(),
    };

    this.saveAccessibilityConfig();
    this.applyAccessibilitySettings();
    return this.accessibilityConfig;
  }

  // 获取当前无障碍配置
  getAccessibilityConfig(): AccessibilityConfig {
    return this.accessibilityConfig;
  }

  // 重置无障碍配置到默认值
  resetAccessibilityConfig() {
    this.accessibilityConfig = {
      highContrast: false,
      reduceMotion: false,
      textSize: 'medium',
      keyboardNavigation: true,
      screenReaderSupport: true,
      captionsEnabled: true,
      audioDescription: false,
      focusIndicator: true,
      simplifiedUI: false,
      lastUpdated: Date.now(),
    };

    this.saveAccessibilityConfig();
    this.applyAccessibilitySettings();
    return this.accessibilityConfig;
  }

  // 切换高对比度模式
  toggleHighContrast() {
    return this.updateAccessibilityConfig({
      highContrast: !this.accessibilityConfig.highContrast,
    });
  }

  // 切换减少动画模式
  toggleReduceMotion() {
    return this.updateAccessibilityConfig({
      reduceMotion: !this.accessibilityConfig.reduceMotion,
    });
  }

  // 调整文本大小
  setTextSize(size: 'small' | 'medium' | 'large' | 'x-large') {
    return this.updateAccessibilityConfig({ textSize: size });
  }

  // 检查WCAG 2.1合规性
  checkWCAGCompliance(): {
    compliant: boolean;
    issues: {
      category: string;
      description: string;
      level: 'error' | 'warning' | 'info';
    }[];
  } {
    const issues: {
      category: string;
      description: string;
      level: 'error' | 'warning' | 'info';
    }[] = [];

    // 检查颜色对比度
    if (!this.accessibilityConfig.highContrast) {
      issues.push({
        category: 'Perceivable',
        description: '默认颜色方案可能不满足WCAG AA级对比度要求',
        level: 'warning',
      });
    }

    // 检查动画
    if (!this.accessibilityConfig.reduceMotion) {
      issues.push({
        category: 'Operable',
        description: '动画效果可能对某些用户造成困扰',
        level: 'info',
      });
    }

    // 检查键盘导航
    if (!this.accessibilityConfig.keyboardNavigation) {
      issues.push({
        category: 'Operable',
        description: '键盘导航已禁用，可能影响无障碍性',
        level: 'error',
      });
    }

    // 检查焦点指示器
    if (!this.accessibilityConfig.focusIndicator) {
      issues.push({
        category: 'Operable',
        description: '焦点指示器已禁用，可能影响键盘用户',
        level: 'warning',
      });
    }

    return {
      compliant: issues.filter(issue => issue.level === 'error').length === 0,
      issues,
    };
  }

  // 导出无障碍配置
  exportAccessibilityConfig(): string {
    return JSON.stringify(this.accessibilityConfig, null, 2);
  }

  // 导入无障碍配置
  importAccessibilityConfig(configString: string): boolean {
    try {
      const config = JSON.parse(configString);
      this.accessibilityConfig = {
        ...this.accessibilityConfig,
        ...config,
        lastUpdated: Date.now(),
      };
      this.saveAccessibilityConfig();
      this.applyAccessibilitySettings();
      return true;
    } catch (error) {
      console.error('Failed to import accessibility config:', error);
      return false;
    }
  }
}

export const accessibilityService = new AccessibilityService();

// 自定义Hook，用于在组件中使用无障碍功能
export function useAccessibility() {
  const getConfig = () => accessibilityService.getAccessibilityConfig();
  const updateConfig = (config: Partial<AccessibilityConfig>) => 
    accessibilityService.updateAccessibilityConfig(config);
  const resetConfig = () => accessibilityService.resetAccessibilityConfig();
  const toggleHighContrast = () => accessibilityService.toggleHighContrast();
  const toggleReduceMotion = () => accessibilityService.toggleReduceMotion();
  const setTextSize = (size: 'small' | 'medium' | 'large' | 'x-large') => 
    accessibilityService.setTextSize(size);
  const checkCompliance = () => accessibilityService.checkWCAGCompliance();

  return {
    getConfig,
    updateConfig,
    resetConfig,
    toggleHighContrast,
    toggleReduceMotion,
    setTextSize,
    checkCompliance,
  };
}

// 无障碍工具函数
export function createAccessibleButton(
  element: HTMLElement,
  options?: {
    label?: string;
    description?: string;
    expanded?: boolean;
    controls?: string;
  }
) {
  if (options?.label) {
    element.setAttribute('aria-label', options.label);
  }

  if (options?.description) {
    element.setAttribute('aria-describedby', options.description);
  }

  if (options?.expanded !== undefined) {
    element.setAttribute('aria-expanded', options.expanded.toString());
  }

  if (options?.controls) {
    element.setAttribute('aria-controls', options.controls);
  }

  // 确保按钮可以通过键盘访问
  element.setAttribute('tabindex', '0');
  element.setAttribute('role', 'button');

  // 添加键盘事件处理
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      element.click();
    }
  });
}

export function createAccessibleDialog(
  element: HTMLElement,
  options?: {
    label?: string;
    describedBy?: string;
    modal?: boolean;
  }
) {
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-modal', (options?.modal ?? true).toString());

  if (options?.label) {
    element.setAttribute('aria-labelledby', options.label);
  }

  if (options?.describedBy) {
    element.setAttribute('aria-describedby', options.describedBy);
  }
}

export function createAccessibleNavigation(
  element: HTMLElement,
  options?: {
    label?: string;
    current?: string;
  }
) {
  element.setAttribute('role', 'navigation');

  if (options?.label) {
    element.setAttribute('aria-label', options.label);
  }

  if (options?.current) {
    const currentLink = element.querySelector(`[href="${options.current}"]`);
    if (currentLink) {
      currentLink.setAttribute('aria-current', 'page');
    }
  }
}

export function checkColorContrast(
  foreground: string,
  background: string
): {
  ratio: number;
  aa: boolean;
  aaa: boolean;
} {
  // 简化的颜色对比度检查
  // 实际应用中应该使用更精确的算法
  const ratio = 4.5; // 默认值，实际应该计算
  return {
    ratio,
    aa: ratio >= 4.5,
    aaa: ratio >= 7.0,
  };
}
