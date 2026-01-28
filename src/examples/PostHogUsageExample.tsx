/**
 * PostHog 使用示例
 * 展示如何在组件中使用 PostHog 追踪事件
 */

import { usePostHog } from 'posthog-js/react';
import { Button } from '@/components/ui/button';
import { getPostHog } from '@/utils/posthog';

/**
 * 方法 1: 使用 usePostHog Hook（推荐）
 * 适用于 React 组件内部
 */
export function SignupButton() {
  const posthog = usePostHog();

  function handleClick() {
    // 追踪按钮点击事件
    posthog.capture('button_clicked', {
      button_name: 'signup',
      page: 'landing',
    });
  }

  return <Button onClick={handleClick}>Sign up</Button>;
}

/**
 * 方法 2: 使用 getPostHog() 工具函数
 * 适用于任何地方（组件、工具函数、服务等）
 */
export function FeatureComponent() {
  const posthog = getPostHog();

  const handleFeatureUse = () => {
    // 直接使用 posthog.capture
    posthog.capture('feature_used', {
      feature_name: 'export_data',
      user_level: 'premium',
    });
  };

  return <Button onClick={handleFeatureUse}>Use Feature</Button>;
}

/**
 * 方法 3: 在非组件代码中使用
 * 例如：工具函数、API 调用、事件处理器等
 */
export const trackCustomEvent = (eventName: string, properties: Record<string, string | number | boolean>) => {
  const posthog = getPostHog();
  
  if (posthog) {
    posthog.capture(eventName, properties);
  }
};

// 使用示例
export const handlePurchase = (productId: string, amount: number) => {
  // 业务逻辑...
  
  // 追踪购买事件
  trackCustomEvent('purchase_completed', {
    product_id: productId,
    amount: amount,
    currency: 'USD',
  });
};

/**
 * 方法 4: 追踪用户属性
 */
export function ProfileComponent() {
  const posthog = usePostHog();

  const updateUserProfile = (userData: { name: string; email: string }) => {
    // 设置用户属性
    posthog.identify(userData.email, {
      name: userData.name,
      email: userData.email,
      signup_date: new Date().toISOString(),
    });

    // 追踪事件
    posthog.capture('profile_updated');
  };

  return <Button onClick={() => updateUserProfile({ name: 'John', email: 'john@example.com' })}>
    Update Profile
  </Button>;
}

/**
 * 方法 5: 条件追踪
 */
export function ConditionalTrackingComponent() {
  const posthog = usePostHog();

  const handleAction = (isPremium: boolean) => {
    if (isPremium) {
      posthog.capture('premium_feature_accessed', {
        timestamp: Date.now(),
      });
    } else {
      posthog.capture('free_feature_accessed', {
        timestamp: Date.now(),
      });
    }
  };

  return <div>Example component</div>;
}

/**
 * 方法 6: 追踪页面浏览（手动）
 */
export const trackPageView = (pageName: string) => {
  const posthog = getPostHog();
  
  posthog.capture('$pageview', {
    page_name: pageName,
    url: window.location.href,
  });
};

/**
 * 完整示例：创建日记
 */
export function CreateJournalExample() {
  const posthog = usePostHog();

  const handleCreateJournal = async (content: string) => {
    const startTime = Date.now();

    try {
      // 业务逻辑：保存日记
      // await saveJournal(content);

      // 追踪成功
      posthog.capture('journal_created', {
        word_count: content.split(/\s+/).length,
        duration_ms: Date.now() - startTime,
        success: true,
      });
    } catch (error) {
      // 追踪失败
      posthog.capture('journal_create_failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
      });
    }
  };

  return <div>Create Journal Example</div>;
}

// ============================================
// 常用事件追踪模式
// ============================================

/**
 * 1. 按钮点击追踪
 */
export const trackButtonClick = (buttonName: string, location: string) => {
  const posthog = getPostHog();
  posthog.capture('button_clicked', { button_name: buttonName, location });
};

/**
 * 2. 表单提交追踪
 */
export const trackFormSubmit = (formName: string, success: boolean) => {
  const posthog = getPostHog();
  posthog.capture('form_submitted', { form_name: formName, success });
};

/**
 * 3. 功能使用追踪
 */
export const trackFeatureUsage = (featureName: string, duration: number) => {
  const posthog = getPostHog();
  posthog.capture('feature_used', { feature_name: featureName, duration_seconds: duration });
};

/**
 * 4. 错误追踪
 */
export const trackError = (errorType: string, errorMessage: string, context?: Record<string, string | number | boolean>) => {
  const posthog = getPostHog();
  posthog.capture('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    context: context ? JSON.stringify(context) : undefined,
  });
};

/**
 * 5. 性能追踪
 */
export const trackPerformance = (operation: string, duration: number) => {
  const posthog = getPostHog();
  posthog.capture('performance_metric', {
    operation: operation,
    duration_ms: duration,
  });
};

export default {
  SignupButton,
  FeatureComponent,
  trackCustomEvent,
  trackButtonClick,
  trackFormSubmit,
  trackFeatureUsage,
  trackError,
  trackPerformance,
};
