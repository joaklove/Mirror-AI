# Mirror-AI 首页与记录页融合 - 产品需求文档

## Overview
- **Summary**: 将现有的首页（Index.tsx）和记录页（Record.tsx）融合为一个统一的主页面，集成所有记录功能，提供更流畅的用户体验。
- **Purpose**: 解决用户需要在多个页面之间切换才能完成完整记录流程的问题，提供一站式的记录体验。
- **Target Users**: 所有 Mirror-AI 应用用户，特别是需要快速记录和管理个人感悟的用户。

## Goals
- 融合首页的简洁性与记录页的功能丰富性
- 提供一站式的日记记录、维度选择、图片上传、标签管理功能
- 保持近期记录列表的可见性
- 保留生成今日晨报功能
- 优化用户体验，减少页面切换

## Non-Goals (Out of Scope)
- 不改变现有的数据结构和存储方式
- 不移除现有的任何功能
- 不影响其他页面（设置、分析、标签管理）的功能
- 不修改后端 API 接口

## Background & Context
- 当前系统有两个主要页面：首页（简单的文本输入）和记录页（完整的记录功能）
- 用户需要在不同页面之间切换才能使用完整功能
- 融合后将提供更连贯的用户体验
- 所有功能将保持不变，只是整合到一个页面中

## Functional Requirements
- **FR-1**: 集成维度选择功能到首页
- **FR-2**: 集成图片上传功能到首页
- **FR-3**: 集成 AI 标签建议和手动标签选择功能到首页
- **FR-4**: 集成语音输入功能到首页
- **FR-5**: 保留近期记录列表显示
- **FR-6**: 保留生成今日晨报功能
- **FR-7**: 保留日记删除功能

## Non-Functional Requirements
- **NFR-1**: 页面加载性能保持不变或有所提升
- **NFR-2**: 响应式设计，适配不同屏幕尺寸
- **NFR-3**: 保持现有的视觉设计风格和主题一致性
- **NFR-4**: 交互流畅，无明显卡顿

## Constraints
- **Technical**: 基于现有的 React、TypeScript、Tailwind CSS 技术栈
- **Dependencies**: 保持对现有服务（journalService、tagService 等）的依赖
- **Timeline**: 短期实现，不超过 2 个开发工作日

## Assumptions
- 用户更倾向于在一个页面完成所有记录相关操作
- 融合后的页面不会过于复杂影响用户体验
- 现有的功能模块化程度足够支持融合

## Acceptance Criteria

### AC-1: 维度选择功能集成
- **Given**: 用户打开融合后的主页面
- **When**: 用户开始记录新的日记
- **Then**: 用户可以看到并选择不同的记录维度（心理、认知、效率、社交、健康、财务）
- **Verification**: `human-judgment`

### AC-2: 图片上传功能集成
- **Given**: 用户在融合后的主页面
- **When**: 用户点击图片上传按钮
- **Then**: 用户可以选择本地图片并成功上传
- **Verification**: `programmatic`

### AC-3: 标签管理功能集成
- **Given**: 用户在融合后的主页面
- **When**: 用户输入日记内容后
- **Then**: 用户可以看到 AI 标签建议并手动选择标签
- **Verification**: `human-judgment`

### AC-4: 语音输入功能集成
- **Given**: 用户在融合后的主页面
- **When**: 用户点击语音输入按钮
- **Then**: 系统开始录音并将语音转换为文本
- **Verification**: `programmatic`

### AC-5: 近期记录列表保留
- **Given**: 用户在融合后的主页面
- **When**: 用户完成记录后
- **Then**: 用户可以看到更新后的近期记录列表
- **Verification**: `human-judgment`

### AC-6: 今日晨报功能保留
- **Given**: 用户在融合后的主页面
- **When**: 用户点击生成今日晨报按钮
- **Then**: 系统生成并显示个性化晨报
- **Verification**: `programmatic`

### AC-7: 日记删除功能保留
- **Given**: 用户在融合后的主页面
- **When**: 用户点击记录卡片上的删除按钮
- **Then**: 系统显示确认对话框并在用户确认后删除记录
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要调整页面布局以适应更多功能？
- [ ] 是否需要添加分页或无限滚动来处理大量记录？
- [ ] 是否需要优化移动端的用户体验？