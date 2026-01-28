/**
 * Google Analytics 事件追踪工具
 * 统一管理所有 GA 事件
 */

// 声明 gtag 全局类型
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetId: string | Date,
      config?: Record<string, string | number | boolean>
    ) => void;
  }
}

/**
 * 发送 GA 事件
 */
export const trackEvent = (
  eventName: string,
  category: string,
  label?: string,
  value?: number,
  additionalParams?: Record<string, string | number | boolean>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: category,
      event_label: label,
      value: value,
      ...additionalParams,
    });
    console.log(`[GA] Event tracked: ${eventName}`, { category, label, value });
  }
};

/**
 * 追踪日记相关事件
 */
export const JournalEvents = {
  // 创建日记
  create: (wordCount: number, tags: string[]) => {
    trackEvent('journal_create', 'Journal', 'Create Entry', 1, {
      word_count: wordCount,
      tags: tags.join(','),
      is_key_event: true, // 标记为关键事件
    });
    // 同时触发统一的关键动作事件
    ConversionEvents.keyAction('journal_created', { word_count: wordCount });
  },

  // 删除日记
  delete: () => {
    trackEvent('journal_delete', 'Journal', 'Delete Entry', 1);
  },

  // 导出数据
  export: (entryCount: number) => {
    trackEvent('data_export', 'Data_Management', 'Export JSON', entryCount);
  },

  // 清空数据
  clearAll: (entryCount: number) => {
    trackEvent('data_clear_all', 'Data_Management', 'Clear All Data', entryCount);
  },

  // 数据迁移
  migrate: (entryCount: number) => {
    trackEvent('data_migrate', 'Data_Management', 'Migrate to Cloud', entryCount);
  },
};

/**
 * 追踪 AI 功能事件
 */
export const AIEvents = {
  // 生成晨报
  generateReport: (entryCount: number, model: string) => {
    trackEvent('generate_report', 'AI_Features', 'Morning Report', 1, {
      entry_count: entryCount,
      ai_model: model,
    });
  },

  // 生成成功
  reportSuccess: (responseTime: number, model: string) => {
    trackEvent('report_generated', 'AI_Features', 'Report Success', responseTime, {
      ai_model: model,
      is_key_event: true, // 标记为关键事件
    });
    // 同时触发统一的关键动作事件
    ConversionEvents.keyAction('report_generated', { ai_model: model, response_time: responseTime });
  },

  // 生成失败
  reportError: (errorMessage: string, model: string) => {
    trackEvent('report_error', 'AI_Features', 'Report Failed', 0, {
      error: errorMessage,
      ai_model: model,
    });
  },

  // 保存 AI 配置
  saveConfig: (model: string) => {
    trackEvent('ai_config_save', 'Settings', 'Save AI Config', 1, {
      ai_model: model,
    });
  },
};

/**
 * 追踪用户认证事件
 */
export const AuthEvents = {
  // 注册
  signUp: (method: string = 'email') => {
    trackEvent('sign_up', 'Authentication', 'User Signup', 1, {
      method: method,
    });
  },

  // 登录
  signIn: (method: string = 'email') => {
    trackEvent('sign_in', 'Authentication', 'User Login', 1, {
      method: method,
    });
  },

  // 登出
  signOut: () => {
    trackEvent('sign_out', 'Authentication', 'User Logout', 1);
  },
};

/**
 * 追踪设置相关事件
 */
export const SettingsEvents = {
  // 打开设置
  open: () => {
    trackEvent('settings_open', 'Settings', 'Open Settings Panel', 1);
  },

  // 关闭设置
  close: () => {
    trackEvent('settings_close', 'Settings', 'Close Settings Panel', 1);
  },
};

/**
 * 追踪用户交互事件
 */
export const InteractionEvents = {
  // 查看晨报
  viewReport: () => {
    trackEvent('view_report', 'User_Interaction', 'View Morning Report', 1);
  },

  // 关闭晨报
  closeReport: () => {
    trackEvent('close_report', 'User_Interaction', 'Close Morning Report', 1);
  },

  // 使用快捷键
  useShortcut: (shortcut: string) => {
    trackEvent('keyboard_shortcut', 'User_Interaction', shortcut, 1);
  },
};

/**
 * 追踪用户留存与活跃度
 */
export const EngagementEvents = {
  // 每日访问
  dailyVisit: () => {
    trackEvent('daily_visit', 'Engagement', 'User Active', 1);
  },

  // 连续打卡天数
  streakDays: (days: number) => {
    trackEvent('streak_days', 'Engagement', 'Consecutive Days', days);
  },

  // 每周活跃用户
  weeklyActive: () => {
    trackEvent('weekly_active', 'Engagement', 'Weekly User', 1);
  },

  // 会话时长
  sessionDuration: (seconds: number) => {
    trackEvent('session_duration', 'Engagement', 'Session Time', seconds);
  },
};

/**
 * 追踪内容质量
 */
export const ContentEvents = {
  // 日记平均长度
  entryWordCount: (wordCount: number, category: 'short' | 'medium' | 'long') => {
    trackEvent('entry_word_count', 'Content', category, wordCount);
  },

  // 标签使用
  tagUsage: (tagName: string) => {
    trackEvent('tag_usage', 'Content', tagName, 1);
  },

  // 情绪标签趋势
  emotionTrend: (emotionType: string) => {
    trackEvent('emotion_trend', 'Content', emotionType, 1);
  },

  // 日记频率
  entryFrequency: (entriesPerWeek: number) => {
    trackEvent('entry_frequency', 'Content', 'Entries Per Week', entriesPerWeek);
  },

  // 新增：每日记录条数
  dailyEntryCount: (count: number) => {
    trackEvent('daily_entry_count', 'Content', 'Daily Logs', count);
  },
};

/**
 * 追踪 AI 使用深度
 */
export const AIUsageEvents = {
  // 晨报查看时长
  reportViewDuration: (seconds: number, model: string) => {
    trackEvent('report_view_duration', 'AI_Usage', model, seconds, {
      is_key_event: true, // 标记为关键事件
      duration_seconds: seconds,
      ai_model: model,
    });
    
    // 如果阅读时长超过 5 秒，视为一次深度阅读转化 (暂时改为 5s 方便验证)
    if (seconds >= 5) {
      ConversionEvents.keyAction('report_deep_read', { 
        duration_seconds: seconds, 
        ai_model: model 
      });
    }
  },

  // AI 模型切换
  modelSwitch: (oldModel: string, newModel: string) => {
    trackEvent('model_switch', 'AI_Usage', `${oldModel} -> ${newModel}`, 1);
  },

  // API 调用成功率
  apiSuccessRate: (rate: number) => {
    trackEvent('api_success_rate', 'AI_Usage', 'Success Rate', rate);
  },

  // 晨报使用频率
  reportFrequency: (reportsPerWeek: number) => {
    trackEvent('report_frequency', 'AI_Usage', 'Reports Per Week', reportsPerWeek);
  },

  // 新增：晨报生成率
  reportGenerationRate: (rate: number, generatedDays: number, activeDays: number) => {
    trackEvent('report_generation_rate', 'AI_Usage', 'Generation Rate', Math.round(rate), {
      generated_days: generatedDays,
      active_days: activeDays,
      rate_percentage: Math.round(rate * 100) / 100,
      is_key_event: true, // 标记为关键事件
    });
    
    // 触发统一的关键动作
    ConversionEvents.keyAction('generation_rate_calculated', { 
      rate: Math.round(rate * 100) / 100 
    });
  },
};

/**
 * 追踪转化漏斗
 */
export const ConversionEvents = {
  // 新用户完成首篇日记
  firstEntry: () => {
    trackEvent('first_entry_created', 'Conversion', 'First Entry', 1);
  },

  // 新用户首次生成晨报
  firstReport: () => {
    trackEvent('first_report_generated', 'Conversion', 'First Report', 1);
  },

  // 新用户完成配置
  setupCompleted: () => {
    trackEvent('setup_completed', 'Conversion', 'Setup Done', 1);
  },

  // 达到里程碑
  milestone: (type: string, value: number) => {
    trackEvent('milestone_reached', 'Conversion', type, value);
  },

  // 关键动作追踪 (Key Actions)
  keyAction: (actionName: string, params?: Record<string, string | number | boolean>) => {
    trackEvent('key_action', 'Conversion', actionName, 1, {
      action_type: actionName, // 显式添加动作类型，方便在 GA4 中查看
      ...params,
      is_key_event: true,
    });
  },
};

/**
 * 追踪功能发现
 */
export const DiscoveryEvents = {
  // 发现功能
  featureDiscovered: (featureName: string) => {
    trackEvent('feature_discovered', 'Discovery', featureName, 1);
  },

  // 首次使用功能
  firstUse: (featureName: string) => {
    trackEvent('feature_first_use', 'Discovery', featureName, 1);
  },

  // 功能使用次数
  featureUsage: (featureName: string, count: number) => {
    trackEvent('feature_usage', 'Discovery', featureName, count);
  },
};

/**
 * 追踪错误
 */
export const ErrorEvents = {
  // 错误发生
  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent('error_occurred', 'Errors', errorType, 0, {
      error_message: errorMessage,
    });
  },

  // 数据加载失败
  dataLoadFailed: (reason: string) => {
    trackEvent('data_load_failed', 'Errors', reason, 1);
  },

  // 网络请求失败
  networkError: (endpoint: string) => {
    trackEvent('network_error', 'Errors', endpoint, 1);
  },

  // 配置验证失败
  configInvalid: (field: string) => {
    trackEvent('config_invalid', 'Errors', field, 1);
  },
};

/**
 * 追踪性能
 */
export const PerformanceEvents = {
  // 页面加载时间
  pageLoadTime: (milliseconds: number) => {
    trackEvent('page_load_time', 'Performance', 'Load Duration', milliseconds);
  },

  // AI 响应时间
  aiResponseTime: (milliseconds: number, model: string) => {
    trackEvent('ai_response_time', 'Performance', model, milliseconds);
  },

  // 数据同步时间
  syncTime: (milliseconds: number, operation: string) => {
    trackEvent('sync_time', 'Performance', operation, milliseconds);
  },

  // 数据库操作时间
  databaseOperation: (operation: string, milliseconds: number) => {
    trackEvent('database_operation', 'Performance', operation, milliseconds);
  },
};
