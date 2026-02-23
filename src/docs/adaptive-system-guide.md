# 自适应界面系统指南

本文档详细介绍了 Mirror AI 的自适应界面系统，包括其工作原理、使用方法和扩展指南。

## 1. 系统架构

Mirror AI 的自适应界面系统由以下几个核心模块组成：

- **主题系统**：提供10种不同风格的主题，支持浅色/深色模式
- **用户使用习惯跟踪系统**：记录用户交互模式，分析使用偏好
- **智能布局调整系统**：基于用户习惯自动调整界面布局
- **无障碍界面功能**：符合WCAG 2.1标准的无障碍支持
- **响应式设计测试工具**：确保在不同设备上的良好表现

## 2. 主题系统

### 2.1 主题类型

系统提供以下10种主题：

1. **默认 (default)**：标准主题，平衡美观和可读性
2. **自然 (nature)**：绿色调主题，营造自然舒适的氛围
3. **海洋 (ocean)**：蓝色调主题，清新宁静
4. **森林 (forest)**：深绿色调主题，沉稳内敛
5. **日落 (sunset)**：暖色调主题，温馨舒适
6. **夜晚 (night)**：深蓝色调主题，适合夜间使用
7. **薰衣草 (lavender)**：紫色调主题，优雅浪漫
8. **沙漠 (desert)**：暖棕色调主题，自然粗犷
9. **天空 (sky)**：浅蓝色调主题，明亮开阔
10. **翡翠 (emerald)**：翠绿色调主题，充满活力

### 2.2 使用方法

在设置页面中，您可以：

1. 切换系统主题（浅色/深色/跟随系统）
2. 选择自定义主题
3. 预览主题效果

### 2.3 主题配置

主题配置存储在 `localStorage` 中，键名为 `mirror-ai-theme` 和 `mirror-ai-custom-theme`。

## 3. 用户使用习惯跟踪系统

### 3.1 跟踪内容

系统会记录以下用户交互：

- 点击操作
- 悬停操作
- 导航行为
- 交互持续时间
- 设备类型
- 时间模式

### 3.2 数据分析

系统会分析用户的使用模式，生成以下洞察：

- 最常用功能
- 设备使用偏好
- 导航模式
- 时间使用模式

### 3.3 数据存储

用户使用数据存储在 `localStorage` 中，键名为 `mirror-ai-usage-data` 和 `mirror-ai-layout-preferences`。

### 3.4 隐私保护

- 所有数据仅存储在本地，不会上传到服务器
- 用户可以随时清除使用数据
- 数据收集是匿名的，不包含个人身份信息

## 4. 智能布局调整系统

### 4.1 调整内容

系统会自动调整以下布局元素：

- 侧边栏状态（展开/折叠）
- 仪表板布局（网格/列表/紧凑）
- 字体大小（小/中/大）
- 间距（紧凑/舒适/宽敞）
- 快速操作栏显示
- 通知显示

### 4.2 调整策略

系统基于以下因素自动调整布局：

- **用户习惯**：根据用户的历史交互模式
- **设备类型**：根据当前使用的设备
- **时间**：根据一天中的时间
- **使用场景**：根据当前的使用场景

### 4.3 布局偏好学习

系统会学习用户在不同设备和时间下的布局偏好，为每种场景保存最佳配置。

## 5. 无障碍界面功能

### 5.1 支持功能

系统提供以下无障碍功能：

- **高对比度模式**：提高文本和背景的对比度
- **减少动画**：减少可能引起不适的动画效果
- **文本大小调整**：支持多种文本大小选项
- **键盘导航**：优化键盘操作体验
- **屏幕阅读器支持**：兼容主流屏幕阅读器
- **焦点指示器**：清晰的键盘焦点指示
- **简化UI**：减少视觉干扰，简化界面

### 5.2 WCAG 2.1 合规性

系统符合以下WCAG 2.1标准：

- **感知性**：信息和用户界面组件必须以可感知的方式呈现给用户
- **可操作性**：用户界面组件和导航必须是可操作的
- **可理解性**：信息和用户界面操作必须是可理解的
- **健壮性**：内容必须足够健壮，能够被各种用户代理可靠地解释

### 5.3 无障碍配置

无障碍设置存储在 `localStorage` 中，键名为 `mirror-ai-accessibility-config`。

## 6. 响应式设计测试工具

### 6.1 测试功能

响应式设计测试工具允许您：

- 模拟不同设备尺寸和方向
- 测试自定义屏幕尺寸
- 全屏测试模式
- 实时预览界面效果

### 6.2 预设设备

工具提供以下预设设备配置：

- iPhone SE
- iPhone 12
- iPad Mini
- iPad Pro
- Desktop Small
- Desktop Medium
- Desktop Large
- iPhone SE (横屏)
- iPad Mini (横屏)
- 4K Monitor

### 6.3 使用方法

在开发模式下，您可以通过 `/dev/responsive-tester` 路径访问测试工具。

## 7. 集成指南

### 7.1 在组件中使用主题系统

```typescript
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, customTheme, setTheme, setCustomThemePreference } = useTheme();
  
  // 使用主题
  return (
    <div>
      <p>当前主题: {theme}</p>
      <p>当前自定义主题: {customTheme}</p>
      <button onClick={() => setTheme('dark')}>切换到深色模式</button>
    </div>
  );
}
```

### 7.2 跟踪用户交互

```typescript
import { useUsageTracking } from '@/services/usageTrackingService';

function MyComponent() {
  const { trackClick, trackHover } = useUsageTracking('MyComponent');
  
  return (
    <button 
      onClick={() => trackClick('button', { action: 'submit' })}
      onMouseEnter={() => trackHover('button')}
    >
      点击我
    </button>
  );
}
```

### 7.3 使用智能布局

```typescript
import { useSmartLayout } from '@/services/smartLayoutService';

function MyComponent() {
  const { getLayout, updateLayout } = useSmartLayout();
  const layoutConfig = getLayout();
  
  return (
    <div>
      <p>侧边栏状态: {layoutConfig.sidebarCollapsed ? '折叠' : '展开'}</p>
      <p>仪表板布局: {layoutConfig.dashboardLayout}</p>
      <button onClick={() => updateLayout({ sidebarCollapsed: !layoutConfig.sidebarCollapsed })}>
        切换侧边栏
      </button>
    </div>
  );
}
```

### 7.4 实现无障碍功能

```typescript
import { useAccessibility } from '@/services/accessibilityService';

function MyComponent() {
  const { getConfig, toggleHighContrast } = useAccessibility();
  const config = getConfig();
  
  return (
    <div>
      <p>高对比度模式: {config.highContrast ? '开启' : '关闭'}</p>
      <button onClick={toggleHighContrast}>
        切换高对比度模式
      </button>
    </div>
  );
}
```

## 8. 扩展指南

### 8.1 添加新主题

要添加新主题，请修改 `src/hooks/useTheme.ts` 文件：

1. 在 `CustomTheme` 类型中添加新主题名称
2. 在 `themeConfigs` 对象中添加新主题的颜色配置

### 8.2 扩展布局选项

要添加新的布局选项，请修改 `src/services/smartLayoutService.ts` 文件：

1. 在 `LayoutConfig` 接口中添加新的配置项
2. 更新默认配置值
3. 修改布局调整逻辑

### 8.3 添加新的无障碍功能

要添加新的无障碍功能，请修改 `src/services/accessibilityService.ts` 文件：

1. 在 `AccessibilityConfig` 接口中添加新的配置项
2. 更新 `applyAccessibilitySettings` 方法
3. 添加相应的切换方法

## 9. 故障排除

### 9.1 主题不生效

- 检查浏览器是否支持 `localStorage`
- 清除浏览器缓存
- 检查主题配置是否正确存储

### 9.2 布局调整不生效

- 检查用户使用数据是否正确收集
- 尝试重置布局设置
- 检查设备类型检测是否准确

### 9.3 无障碍功能不生效

- 检查浏览器是否支持相应的无障碍特性
- 清除无障碍配置，重新设置
- 测试不同的浏览器和设备

## 10. 性能优化

### 10.1 数据存储优化

- 使用 `localStorage` 存储配置，避免频繁的服务器请求
- 限制存储的数据量，只保留最近的使用记录
- 定期清理过期数据

### 10.2 渲染优化

- 使用 React.memo 缓存组件
- 避免不必要的重渲染
- 优化主题切换的动画效果

### 10.3 分析优化

- 异步处理使用数据的分析
- 限制分析频率，避免影响用户体验
- 使用防抖和节流技术优化事件处理

## 11. 未来计划

### 11.1 功能增强

- 支持更多自定义主题选项
- 实现更智能的布局调整算法
- 添加更多无障碍功能
- 支持多语言界面

### 11.2 性能优化

- 进一步优化数据存储和检索
- 减少首次加载时间
- 优化大型应用的性能

### 11.3 集成扩展

- 支持第三方主题
- 提供布局模板市场
- 集成更多无障碍工具

---

通过本文档，您应该对 Mirror AI 的自适应界面系统有了全面的了解。如果您有任何问题或建议，请随时联系我们的开发团队。
