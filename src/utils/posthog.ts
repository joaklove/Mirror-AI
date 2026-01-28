/**
 * PostHog 事件追踪工具
 * 与 Google Analytics 并行运行，提供更深入的用户行为分析
 */

import posthog from 'posthog-js';

// PostHog 配置常量（硬编码默认值确保始终可用）
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || 'phc_q9ZcLd7BFuHd58czP2daIfpY9y9sl3Z5MsjlNFYhH5W';
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

/**
 * 初始化 PostHog
 */
export const initPostHog = () => {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        recordCrossOriginIframes: true,
      },
    });
  }
};

/**
 * 获取 PostHog 实例
 * 用于直接调用 PostHog 功能
 * 
 * @example
 * import { getPostHog } from '@/utils/posthog';
 * const posthog = getPostHog();
 * posthog.capture('custom_event', { property: 'value' });
 */
export const getPostHog = () => posthog;

/**
 * 识别用户
 */
export const identifyUser = (userId: string, properties?: Record<string, string | number | boolean>) => {
  try {
    if (posthog && posthog.__loaded) {
      posthog.identify(userId, properties);
    }
  } catch (error) {
    console.warn('[PostHog] Failed to identify user:', error);
  }
};

/**
 * 设置用户属性
 */
export const setUserProperties = (properties: Record<string, string | number | boolean>) => {
  try {
    if (posthog && posthog.__loaded && posthog.people) {
      posthog.people.set(properties);
    }
  } catch (error) {
    console.warn('[PostHog] Failed to set user properties:', error);
  }
};

/**
 * 追踪事件（通用方法）
 * 
 * @example
 * // 基本用法
 * trackPostHogEvent('button_clicked');
 * 
 * // 带属性
 * trackPostHogEvent('button_clicked', { button_name: 'signup' });
 * 
 * // 或直接使用 posthog.capture
 * posthog.capture('my_custom_event', { property: 'value' });
 */
export const trackPostHogEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean>
) => {
  try {
    if (posthog && posthog.__loaded) {
      posthog.capture(eventName, properties);
      console.log(`[PostHog] Event captured: ${eventName}`, properties);
    }
  } catch (error) {
    // 静默失败，不影响应用运行
    console.warn('[PostHog] Failed to capture event:', error);
  }
};

/**
 * 日记相关事件
 */
export const PostHogJournalEvents = {
  create: (wordCount: number, tags: string[]) => {
    trackPostHogEvent('journal_created', {
      word_count: wordCount,
      tags_count: tags.length,
      tags: tags.join(','),
    });
  },

  delete: () => {
    trackPostHogEvent('journal_deleted');
  },

  export: (entryCount: number) => {
    trackPostHogEvent('data_exported', {
      entry_count: entryCount,
    });
  },

  clearAll: (entryCount: number) => {
    trackPostHogEvent('data_cleared', {
      entries_deleted: entryCount,
    });
  },

  migrate: (entryCount: number) => {
    trackPostHogEvent('data_migrated', {
      entries_migrated: entryCount,
    });
  },

  // 🆕 新增：每日记录条数
  dailyCount: (count: number, date: string) => {
    trackPostHogEvent('daily_entry_count', {
      count: count,
      date: date,
    });
  },
};

/**
 * AI 功能事件
 */
export const PostHogAIEvents = {
  generateReport: (entryCount: number, model: string) => {
    trackPostHogEvent('ai_report_generate_started', {
      entry_count: entryCount,
      ai_model: model,
    });
  },

  reportSuccess: (responseTime: number, model: string) => {
    trackPostHogEvent('ai_report_generated', {
      response_time_ms: responseTime,
      ai_model: model,
    });
  },

  reportError: (errorMessage: string, model: string) => {
    trackPostHogEvent('ai_report_failed', {
      error_message: errorMessage,
      ai_model: model,
    });
  },

  saveConfig: (model: string) => {
    trackPostHogEvent('ai_config_saved', {
      ai_model: model,
    });
  },

  modelSwitch: (oldModel: string, newModel: string) => {
    trackPostHogEvent('ai_model_switched', {
      old_model: oldModel,
      new_model: newModel,
    });
  },

  reportViewDuration: (seconds: number, model: string) => {
    trackPostHogEvent('ai_report_view_duration', {
      duration_seconds: seconds,
      ai_model: model,
    });
  },

  // 🆕 新增：晨报生成率
  generationRate: (rate: number, generatedDays: number, activeDays: number) => {
    trackPostHogEvent('report_generation_rate', {
      rate_percentage: rate,
      generated_days: generatedDays,
      active_days: activeDays,
    });
  },
};

/**
 * 用户认证事件
 */
export const PostHogAuthEvents = {
  signUp: (method: string = 'email') => {
    trackPostHogEvent('user_signed_up', {
      method: method,
    });
  },

  signIn: (method: string = 'email') => {
    trackPostHogEvent('user_signed_in', {
      method: method,
    });
  },

  signOut: () => {
    trackPostHogEvent('user_signed_out');
    // 重置 PostHog 用户
    if (posthog) {
      posthog.reset();
    }
  },
};

/**
 * 转化漏斗事件
 */
export const PostHogConversionEvents = {
  firstEntry: () => {
    trackPostHogEvent('conversion_first_entry');
  },

  firstReport: () => {
    trackPostHogEvent('conversion_first_report');
  },

  setupCompleted: () => {
    trackPostHogEvent('conversion_setup_completed');
  },

  milestone: (type: string, value: number) => {
    trackPostHogEvent('milestone_reached', {
      milestone_type: type,
      milestone_value: value,
    });
  },
};

/**
 * 功能发现事件
 */
export const PostHogDiscoveryEvents = {
  featureDiscovered: (featureName: string) => {
    trackPostHogEvent('feature_discovered', {
      feature_name: featureName,
    });
  },
};

/**
 * 错误追踪
 */
export const PostHogErrorEvents = {
  errorOccurred: (errorType: string, errorMessage: string) => {
    trackPostHogEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
    });
  },
};

/**
 * 性能监控
 */
export const PostHogPerformanceEvents = {
  pageLoadTime: (milliseconds: number) => {
    trackPostHogEvent('page_load_time', {
      load_time_ms: milliseconds,
    });
  },

  aiResponseTime: (milliseconds: number, model: string) => {
    trackPostHogEvent('ai_response_time', {
      response_time_ms: milliseconds,
      ai_model: model,
    });
  },

  databaseOperation: (operation: string, milliseconds: number) => {
    trackPostHogEvent('database_operation', {
      operation_type: operation,
      duration_ms: milliseconds,
    });
  },
};

export default posthog;
