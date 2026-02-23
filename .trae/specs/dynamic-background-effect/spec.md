# 动态背景特效 Spec

## Why
当前页面背景比较单调，缺少视觉层次感和动态效果。用户希望有更丰富的视觉体验，同时背景要能适配主题系统。

## What Changes
- 为页面添加动态渐变背景
- 实现适配主题的粒子/光点动画效果
- 支持深色/浅色模式的背景适配
- 添加性能优化，确保动画流畅

## Impact
- Affected specs: 主题系统、UI 视觉效果
- Affected code: InkBackground.tsx, index.css, useTheme.ts

## ADDED Requirements

### Requirement: 动态渐变背景
系统 SHALL 提供流动的渐变背景效果

#### Scenario: 背景渐变动画
- **WHEN** 页面加载
- **THEN** 显示平滑流动的渐变背景动画

#### Scenario: 主题适配
- **WHEN** 用户切换主题
- **THEN** 背景渐变色跟随主题变化

### Requirement: 粒子/光点效果
系统 SHALL 显示漂浮的粒子或光点装饰

#### Scenario: 粒子动画
- **WHEN** 页面渲染
- **THEN** 显示缓慢飘动的粒子效果

#### Scenario: 深色模式适配
- **WHEN** 深色模式开启
- **THEN** 粒子颜色和透明度自动调整

### Requirement: 性能优化
系统 SHALL 确保动画流畅不卡顿

#### Scenario: 性能监控
- **WHEN** 动画运行
- **THEN** 保持 60fps 流畅度
