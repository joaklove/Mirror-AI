# PostHog 使用指南

## 📚 三种使用方式

PostHog 提供了多种方式来追踪事件，根据不同场景选择最合适的方法。

---

## 1️⃣ 使用 usePostHog Hook（推荐用于 React 组件）

### 基本用法

```typescript
import { usePostHog } from 'posthog-js/react';

function MyComponent() {
  const posthog = usePostHog();

  function handleClick() {
    posthog.capture('button_clicked', {
      button_name: 'signup',
      page: 'landing',
    });
  }

  return <button onClick={handleClick}>Sign up</button>;
}
```

### 完整示例

```typescript
import { usePostHog } from 'posthog-js/react';
import { Button } from '@/components/ui/button';

export function CreateJournalButton() {
  const posthog = usePostHog();

  const handleClick = async () => {
    const startTime = Date.now();

    try {
      // 业务逻辑
      await createJournal();

      // 追踪成功
      posthog.capture('journal_created', {
        duration_ms: Date.now() - startTime,
        success: true,
      });
    } catch (error) {
      // 追踪失败
      posthog.capture('journal_create_failed', {
        error: error.message,
      });
    }
  };

  return <Button onClick={handleClick}>创建日记</Button>;
}
```

### 优点
- ✅ React 官方推荐方式
- ✅ 自动处理组件卸载
- ✅ TypeScript 支持良好
- ✅ 符合 React Hooks 规范

### 适用场景
- ✅ React 函数组件内部
- ✅ 按钮点击事件
- ✅ 表单提交
- ✅ 用户交互

---

## 2️⃣ 使用 getPostHog() 工具函数（通用方式）

### 基本用法

```typescript
import { getPostHog } from '@/utils/posthog';

const posthog = getPostHog();
posthog.capture('my_custom_event', {
  property: 'value',
});
```

### 完整示例

```typescript
import { getPostHog } from '@/utils/posthog';

// 在任何地方使用
export const trackFeature = (featureName: string) => {
  const posthog = getPostHog();
  
  posthog.capture('feature_used', {
    feature_name: featureName,
    timestamp: Date.now(),
  });
};

// 在工具函数中使用
export const handleExport = async () => {
  const posthog = getPostHog();
  
  try {
    await exportData();
    posthog.capture('data_exported', { success: true });
  } catch (error) {
    posthog.capture('export_failed', { error: error.message });
  }
};

// 在类方法中使用
class AnalyticsService {
  track(event: string, properties: any) {
    const posthog = getPostHog();
    posthog.capture(event, properties);
  }
}
```

### 优点
- ✅ 可在任何地方使用
- ✅ 不受 React 限制
- ✅ 适合工具函数
- ✅ 适合类方法

### 适用场景
- ✅ 工具函数
- ✅ 服务层代码
- ✅ API 调用
- ✅ 非 React 代码
- ✅ 类组件
- ✅ 全局事件处理器

---

## 3️⃣ 直接使用 posthog.capture（最灵活）

### 基本用法

```typescript
import posthog from 'posthog-js';

posthog.capture('my_custom_event', {
  property: 'value',
});
```

### 完整示例

```typescript
import posthog from 'posthog-js';

// 简单事件
posthog.capture('button_clicked');

// 带属性的事件
posthog.capture('purchase_completed', {
  product_id: '123',
  amount: 99.99,
  currency: 'USD',
});

// 用户识别
posthog.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe',
});

// 设置用户属性
posthog.people.set({
  subscription_plan: 'premium',
  last_login: new Date().toISOString(),
});

// 重置用户（登出时）
posthog.reset();
```

### 优点
- ✅ 最直接的方式
- ✅ 完全控制
- ✅ 官方原生 API
- ✅ 功能最完整

### 适用场景
- ✅ 需要完整 PostHog 功能时
- ✅ 用户识别
- ✅ 功能标志
- ✅ 高级配置

---

## 📊 三种方式对比

| 方式 | 使用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **usePostHog Hook** | React 组件 | React 官方推荐、自动管理 | 仅限组件内 |
| **getPostHog()** | 任何地方 | 通用性强、灵活 | 需要额外导入 |
| **posthog.capture** | 需要完整 API | 功能最全、最直接 | 直接依赖全局对象 |

---

## 🎯 实际使用建议

### 在 React 组件中
```typescript
// ✅ 推荐：使用 usePostHog
import { usePostHog } from 'posthog-js/react';

function MyComponent() {
  const posthog = usePostHog();
  // 使用 posthog.capture()
}
```

### 在工具函数中
```typescript
// ✅ 推荐：使用 getPostHog
import { getPostHog } from '@/utils/posthog';

export const trackEvent = () => {
  const posthog = getPostHog();
  posthog.capture('event_name');
};
```

### 在 API 服务中
```typescript
// ✅ 推荐：使用 getPostHog 或直接 import
import { getPostHog } from '@/utils/posthog';
// 或
import posthog from 'posthog-js';

class ApiService {
  async fetchData() {
    const posthog = getPostHog();
    posthog.capture('api_called');
  }
}
```

---

## 🚀 常用事件追踪模式

### 1. 按钮点击

```typescript
import { usePostHog } from 'posthog-js/react';

function SignupButton() {
  const posthog = usePostHog();

  return (
    <button onClick={() => posthog.capture('button_clicked', { button_name: 'signup' })}>
      Sign up
    </button>
  );
}
```

### 2. 表单提交

```typescript
import { usePostHog } from 'posthog-js/react';

function LoginForm() {
  const posthog = usePostHog();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login();
      posthog.capture('login_success');
    } catch (error) {
      posthog.capture('login_failed', { error: error.message });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. 页面浏览

```typescript
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

function PageComponent() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('$pageview', {
      page_name: 'Dashboard',
    });
  }, []);

  return <div>Dashboard</div>;
}
```

### 4. 功能使用

```typescript
import { getPostHog } from '@/utils/posthog';

export const trackFeatureUsage = (featureName: string) => {
  const posthog = getPostHog();
  
  posthog.capture('feature_used', {
    feature_name: featureName,
    timestamp: Date.now(),
  });
};

// 使用
trackFeatureUsage('export_data');
```

### 5. 错误追踪

```typescript
import { getPostHog } from '@/utils/posthog';

export const trackError = (error: Error, context?: any) => {
  const posthog = getPostHog();
  
  posthog.capture('error_occurred', {
    error_message: error.message,
    error_stack: error.stack,
    context: JSON.stringify(context),
  });
};

// 使用
try {
  await riskyOperation();
} catch (error) {
  trackError(error, { operation: 'data_sync' });
}
```

### 6. 性能监控

```typescript
import { getPostHog } from '@/utils/posthog';

export const trackPerformance = async (operation: string, fn: () => Promise<void>) => {
  const posthog = getPostHog();
  const startTime = Date.now();

  try {
    await fn();
    posthog.capture('performance_metric', {
      operation: operation,
      duration_ms: Date.now() - startTime,
      success: true,
    });
  } catch (error) {
    posthog.capture('performance_metric', {
      operation: operation,
      duration_ms: Date.now() - startTime,
      success: false,
      error: error.message,
    });
  }
};

// 使用
await trackPerformance('load_data', async () => {
  await loadData();
});
```

---

## 🎓 高级功能

### 1. 功能标志（Feature Flags）

```typescript
import { usePostHog } from 'posthog-js/react';

function MyComponent() {
  const posthog = usePostHog();

  if (posthog.isFeatureEnabled('new-ui-design')) {
    return <NewUI />;
  }

  return <OldUI />;
}
```

### 2. 用户识别

```typescript
import { usePostHog } from 'posthog-js/react';

function LoginComponent() {
  const posthog = usePostHog();

  const handleLogin = (user) => {
    // 识别用户
    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    // 追踪登录事件
    posthog.capture('user_logged_in');
  };
}
```

### 3. 用户分组（Groups）

```typescript
import { usePostHog } from 'posthog-js/react';

function OrganizationComponent() {
  const posthog = usePostHog();

  posthog.group('company', 'company_123', {
    name: 'Acme Corp',
    plan: 'enterprise',
  });
}
```

### 4. 会话属性

```typescript
import { usePostHog } from 'posthog-js/react';

function AppComponent() {
  const posthog = usePostHog();

  // 设置会话级别属性
  posthog.register({
    app_version: '1.2.3',
    environment: 'production',
  });
}
```

---

## 📝 最佳实践

### ✅ Do（推荐）

```typescript
// ✅ 在组件中使用 Hook
const posthog = usePostHog();

// ✅ 提供有意义的事件名称
posthog.capture('journal_created');

// ✅ 包含有用的属性
posthog.capture('button_clicked', { button_name: 'signup', page: 'landing' });

// ✅ 错误处理
try {
  await operation();
  posthog.capture('operation_success');
} catch (error) {
  posthog.capture('operation_failed', { error: error.message });
}
```

### ❌ Don't（避免）

```typescript
// ❌ 事件名称太泛化
posthog.capture('click');

// ❌ 缺少上下文
posthog.capture('error');

// ❌ 在组件外部使用 Hook
const posthog = usePostHog(); // ❌ 错误：不在组件内

// ❌ 过度追踪
posthog.capture('mouse_moved'); // ❌ 太频繁
```

---

## 🔍 调试技巧

### 查看事件是否发送

```typescript
import { getPostHog } from '@/utils/posthog';

const posthog = getPostHog();

// 开启调试模式
posthog.debug();

// 发送事件
posthog.capture('test_event');

// 查看控制台，应该看到详细日志
```

### 验证 PostHog 是否初始化

```typescript
import { getPostHog } from '@/utils/posthog';

const posthog = getPostHog();

console.log('PostHog initialized:', !!posthog);
console.log('PostHog config:', posthog.config);
```

---

## 📚 相关文档

- 📖 [PostHog 官方文档](https://posthog.com/docs)
- 📖 [React Integration](https://posthog.com/docs/libraries/react)
- 📖 [JavaScript SDK](https://posthog.com/docs/libraries/js)
- 📄 `POSTHOG_SETUP.md` - 完整配置指南
- 📄 `src/examples/PostHogUsageExample.tsx` - 代码示例

---

**最后更新**: 2026-01-23  
**PostHog 实例**: EU Cloud (https://eu.i.posthog.com)  
**项目 Key**: phc_q9ZcLd7BFuHd58czP2daIfpY9y9sl3Z5MsjlNFYhH5W
