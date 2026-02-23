# UI Premium Enhancement Spec

## Why
当前界面 UI 缺乏高级感，用户反馈颜色、字体、样式不够精致，需要全面升级视觉体验。

## What Changes
- 升级配色系统：更深邃的暗色系 + 更精致的渐变
- 升级字体系统：更优雅的衬线字体 + 更现代的无衬线字体
- 升级组件样式：更细腻的阴影、边框、毛玻璃效果
- 升级动画效果：更流畅的过渡、更精致的微交互
- 升级图标系统：更大气的一致性图标风格

## Impact
- Affected specs: DESIGN_SYSTEM_V2.md
- Affected code: index.css, tailwind.config.ts, Sidebar.tsx, AppLayout.tsx, 全局组件样式

## ADDED Requirements

### Requirement: Premium Color System
系统 SHALL 提供更具高级感的配色方案

#### Scenario: 深邃暗色主题
- **WHEN** 用户打开应用
- **THEN** 看到深邃典雅的暗色背景，配合精致的金色/古铜色点缀

#### Scenario: 精致渐变
- **WHEN** 界面元素需要层次感
- **THEN** 使用细腻的多色渐变，而非单调的单色

### Requirement: Premium Typography
系统 SHALL 提供更具设计感的字体组合

#### Scenario: 标题字体
- **WHEN** 展示页面标题
- **THEN** 使用优雅的衬线字体（如 Noto Serif SC）

#### Scenario: 正文字体
- **WHEN** 展示正文内容
- **THEN** 使用清晰现代的无衬线字体（如 Noto Sans SC）

### Requirement: Premium Component Effects
系统 SHALL 提供精致的视觉效果

#### Scenario: 卡片阴影
- **WHEN** 展示卡片组件
- **THEN** 使用柔和的多层阴影，营造悬浮感

#### Scenario: 毛玻璃效果
- **WHEN** 展示弹窗、侧边栏
- **THEN** 使用 backdrop-blur 毛玻璃效果

#### Scenario: 边框装饰
- **WHEN** 需要分隔或装饰
- **THEN** 使用精致的1px边框，配合淡金色或淡银色

### Requirement: Premium Animations
系统 SHALL 提供流畅优雅的动画

#### Scenario: 页面过渡
- **WHEN** 用户切换页面
- **THEN** 使用淡入淡出 + 轻微上浮的过渡效果

#### Scenario: 悬停反馈
- **WHEN** 用户悬停在可交互元素
- **THEN** 使用 200ms 的平滑过渡，配合轻微放大或阴影变化

## MODIFIED Requirements

### Requirement: Sidebar Style
侧边栏 SHALL 采用更深邃的暗色 + 金色点缀

### Requirement: Button Style
按钮 SHALL 采用渐变背景 + 精致阴影 + 悬停动画

### Requirement: Card Style
卡片 SHALL 采用柔和阴影 + 细微边框 + 悬停抬升效果

## REMOVED Requirements
### Requirement: 原有简单调色板
**Reason**: 原有颜色过于平淡，缺乏高级感
**Migration**: 全面升级为深色系 + 金色点缀的轻奢风格
