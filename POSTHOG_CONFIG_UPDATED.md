# ✅ PostHog 配置已更新

## 🔄 更新内容

### 1. 环境变量更新
```bash
# 旧配置（US Cloud）
VITE_PUBLIC_POSTHOG_KEY=phc_W850t1PnPtkl6PvUmsgYYifFayLhBmo6gigt6K6b9xU
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# 新配置（EU Cloud）✅
VITE_PUBLIC_POSTHOG_KEY=phc_q9ZcLd7BFuHd58czP2daIfpY9y9sl3Z5MsjlNFYhH5W
VITE_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

### 2. 新增功能

#### ✅ getPostHog() 工具函数
```typescript
import { getPostHog } from '@/utils/posthog';

const posthog = getPostHog();
posthog.capture('my_custom_event', { property: 'value' });
```

#### ✅ usePostHog Hook 支持
```typescript
import { usePostHog } from 'posthog-js/react';

function MyComponent() {
  const posthog = usePostHog();
  
  function handleClick() {
    posthog.capture('button_clicked', { button_name: 'signup' });
  }
  
  return <button onClick={handleClick}>Sign up</button>;
}
```

### 3. 新增文档

#### ✅ PostHog 使用指南
- 📄 `POSTHOG_USAGE_GUIDE.md` - 详细使用教程
- 📄 `src/examples/PostHogUsageExample.tsx` - 完整代码示例

---

## 🎯 三种使用方式

### 方式 1: usePostHog Hook（推荐用于 React 组件）
```typescript
import { usePostHog } from 'posthog-js/react';

function MyComponent() {
  const posthog = usePostHog();
  posthog.capture('event_name', { key: 'value' });
}
```

**优点**: React 官方推荐、自动管理生命周期  
**适用**: React 函数组件内部

---

### 方式 2: getPostHog() 工具函数（通用方式）
```typescript
import { getPostHog } from '@/utils/posthog';

const posthog = getPostHog();
posthog.capture('event_name', { key: 'value' });
```

**优点**: 可在任何地方使用、不受 React 限制  
**适用**: 工具函数、服务层、类方法、全局处理器

---

### 方式 3: 直接使用 posthog.capture（最灵活）
```typescript
import posthog from 'posthog-js';

posthog.capture('my_custom_event', { property: 'value' });
```

**优点**: 最直接、完整 API 访问  
**适用**: 需要完整 PostHog 功能时

---

## 📚 完整示例

### 示例 1: 按钮点击追踪
```typescript
import { usePostHog } from 'posthog-js/react';
import { Button } from '@/components/ui/button';

function SignupButton() {
  const posthog = usePostHog();

  const handleClick = () => {
    posthog.capture('button_clicked', {
      button_name: 'signup',
      page: 'landing',
    });
  };

  return <Button onClick={handleClick}>Sign up</Button>;
}
```

### 示例 2: 工具函数中使用
```typescript
import { getPostHog } from '@/utils/posthog';

export const trackFeature = (featureName: string) => {
  const posthog = getPostHog();
  
  posthog.capture('feature_used', {
    feature_name: featureName,
    timestamp: Date.now(),
  });
};

// 使用
trackFeature('export_data');
```

### 示例 3: 错误追踪
```typescript
import { getPostHog } from '@/utils/posthog';

export const trackError = (error: Error) => {
  const posthog = getPostHog();
  
  posthog.capture('error_occurred', {
    error_message: error.message,
    error_stack: error.stack,
  });
};

// 使用
try {
  await riskyOperation();
} catch (error) {
  trackError(error);
}
```

### 示例 4: 用户识别
```typescript
import { usePostHog } from 'posthog-js/react';

function LoginComponent() {
  const posthog = usePostHog();

  const handleLogin = (user) => {
    // 识别用户
    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
    });

    // 追踪登录
    posthog.capture('user_logged_in');
  };
}
```

---

## 🔍 验证更新

### 1. 重启开发服务器
```bash
# 停止当前服务
Ctrl + C

# 重新启动（加载新的环境变量）
npm run dev
```

### 2. 检查浏览器控制台
打开应用，应该看到：
```
[PostHog] Event captured: ...
```

### 3. 访问 PostHog 仪表盘
https://eu.i.posthog.com/  
应该能看到实时事件

---

## ✅ 更新清单

- [x] 环境变量已更新（EU Cloud）
- [x] `.env` 文件已更新
- [x] `.env.example` 已更新
- [x] `src/main.tsx` 默认值已更新
- [x] `src/utils/posthog.ts` 已更新
- [x] 添加 `getPostHog()` 工具函数
- [x] 创建使用示例文件
- [x] 创建详细使用指南
- [x] 更新所有相关文档
- [x] Lint 检查通过

---

## 📊 当前配置

| 项目 | 值 |
|------|-----|
| **PostHog 实例** | EU Cloud |
| **URL** | https://eu.i.posthog.com |
| **项目 Key** | phc_q9ZcLd7BFuHd58czP2daIfpY9y9sl3Z5MsjlNFYhH5W |
| **区域** | 欧盟（更符合 GDPR 要求） |
| **版本** | posthog-js@1.334.1 |
| **状态** | ✅ 完全配置并运行 |

---

## 📚 相关文档

快速查阅：
- 📄 `POSTHOG_USAGE_GUIDE.md` - **新增** 详细使用教程
- 📄 `src/examples/PostHogUsageExample.tsx` - **新增** 代码示例
- 📄 `POSTHOG_SETUP.md` - 完整配置指南
- 📄 `ANALYTICS_COMPARISON.md` - GA vs PostHog 对比
- 📄 `ANALYTICS_QUICK_START.md` - 快速上手

---

## 🚀 下一步

1. **重启开发服务器**
   ```bash
   npm run dev
   ```

2. **测试 PostHog**
   - 打开应用
   - 创建日记
   - 查看控制台日志
   - 访问 EU PostHog 仪表盘

3. **学习使用方式**
   - 阅读 `POSTHOG_USAGE_GUIDE.md`
   - 查看 `PostHogUsageExample.tsx` 示例
   - 根据场景选择合适的方式

---

**更新时间**: 2026-01-23  
**状态**: ✅ 配置已更新并完全就绪  
**区域**: EU Cloud (GDPR 合规)
