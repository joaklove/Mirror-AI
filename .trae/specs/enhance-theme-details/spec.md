# 增强主题系统 Spec

## Why
当前自定义主题变化不够明显，各主题之间的视觉差异较小，用户难以感知主题切换的效果。需要增强每个主题的细节呈现。

## What Changes
- 增强每个主题的渐变背景效果
- 为每个主题添加独特的纹理或图案
- 优化主题切换时的动画过渡效果
- 为主题预览卡片添加动态效果

## Impact
- Affected specs: 主题系统、UI 配色
- Affected code: useTheme.ts, index.css, Settings.tsx

## ADDED Requirements

### Requirement: 增强主题视觉效果
系统 SHALL 提供更明显的主题差异

#### Scenario: 主题背景变化
- **WHEN** 用户切换到不同主题
- **THEN** 背景渐变、装饰元素、阴影颜色都应跟随主题变化

#### Scenario: 主题预览
- **WHEN** 用户在设置页面看到主题预览
- **THEN** 每个主题应有独特的视觉特征，如渐变色球、纹理图案

### Requirement: 主题动画过渡
系统 SHALL 提供平滑的主题切换动画

#### Scenario: 主题切换
- **WHEN** 用户点击主题切换
- **THEN** 颜色变化应有 300ms 的平滑过渡效果

### Requirement: 主题装饰元素
系统 SHALL 根据主题显示不同的装饰元素

#### Scenario: 背景装饰
- **WHEN** 不同主题显示背景
- **THEN** 可添加主题专属的装饰图案或渐变
