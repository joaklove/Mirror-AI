# Mirror-AI 首页与记录页融合 - 实现计划

## [x] Task 1: 分析现有代码结构
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析 Index.tsx 和 Record.tsx 的代码结构
  - 识别重复功能和差异功能
  - 确定融合后的组件结构
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
- **Test Requirements**: 
  - `human-judgment` TR-1.1: 确认所有功能点都已识别
  - `human-judgment` TR-1.2: 确认组件结构合理
- **Notes**: 重点关注功能模块的可移植性

## [x] Task 2: 创建融合后的主页面组件结构
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 基于 Index.tsx 创建新的主页面结构
  - 集成 Record.tsx 的功能模块
  - 保持现有的响应式设计
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**: 
  - `human-judgment` TR-2.1: 页面结构清晰
  - `human-judgment` TR-2.2: 功能模块布局合理
- **Notes**: 采用模块化设计，便于后续维护

## [x] Task 3: 集成维度选择功能
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 将 Record.tsx 中的维度选择组件集成到主页面
  - 确保维度选择与日记创建逻辑正确关联
  - 保持现有的维度配置和样式
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**: 
  - `programmatic` TR-3.1: 维度选择功能正常工作
  - `human-judgment` TR-3.2: 维度选择界面美观
- **Notes**: 复用现有的 DIMENSIONS 配置

## [x] Task 4: 集成图片上传功能
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 将 Record.tsx 中的图片上传功能集成到主页面
  - 确保图片压缩功能正常工作
  - 保持现有的上传状态管理
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**: 
  - `programmatic` TR-4.1: 图片上传功能正常工作
  - `programmatic` TR-4.2: 图片压缩功能正常工作
- **Notes**: 复用现有的 uploadImage 方法

## [x] Task 5: 集成标签管理功能
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 将 Record.tsx 中的标签管理功能集成到主页面
  - 确保 AI 标签建议功能正常工作
  - 保持现有的标签选择逻辑
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**: 
  - `programmatic` TR-5.1: 标签选择功能正常工作
  - `programmatic` TR-5.2: AI 标签建议功能正常工作
- **Notes**: 复用现有的 handleTagToggle 方法

## [x] Task 6: 集成语音输入功能
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 将 Record.tsx 中的语音输入功能集成到主页面
  - 确保语音识别和实时转写功能正常工作
  - 保持现有的语音输入状态管理
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**: 
  - `programmatic` TR-6.1: 语音输入功能正常工作
  - `human-judgment` TR-6.2: 语音输入界面反馈清晰
- **Notes**: 复用现有的 handleVoiceRecord 方法

## [x] Task 7: 保留近期记录列表功能
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 保留 Index.tsx 中的近期记录列表功能
  - 确保与新集成的功能兼容
  - 保持现有的记录卡片样式和交互
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**: 
  - `programmatic` TR-7.1: 近期记录列表正常显示
  - `programmatic` TR-7.2: 记录卡片交互正常
- **Notes**: 复用现有的 JournalEntryCard 组件

## [x] Task 8: 保留生成今日晨报功能
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 保留 Index.tsx 中的生成今日晨报功能
  - 确保与新集成的功能兼容
  - 保持现有的晨报生成逻辑和样式
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**: 
  - `programmatic` TR-8.1: 生成今日晨报功能正常工作
  - `human-judgment` TR-8.2: 晨报界面美观
- **Notes**: 复用现有的 handleGenerateReport 方法

## [x] Task 9: 保留日记删除功能
- **Priority**: P0
- **Depends On**: Task 7
- **Description**: 
  - 保留 Index.tsx 中的日记删除功能
  - 确保与新集成的功能兼容
  - 保持现有的删除确认逻辑
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**: 
  - `programmatic` TR-9.1: 日记删除功能正常工作
  - `programmatic` TR-9.2: 删除确认对话框正常显示
- **Notes**: 复用现有的 handleDeleteEntry 和 confirmDelete 方法

## [x] Task 10: 优化页面布局和用户体验
- **Priority**: P1
- **Depends On**: Tasks 3, 4, 5, 6, 7, 8, 9
- **Description**: 
  - 调整页面布局以适应更多功能
  - 优化移动端用户体验
  - 确保页面加载性能
- **Acceptance Criteria Addressed**: NFR-1, NFR-2, NFR-3, NFR-4
- **Test Requirements**: 
  - `human-judgment` TR-10.1: 页面布局美观合理
  - `programmatic` TR-10.2: 页面加载性能良好
- **Notes**: 关注用户体验细节

## [x] Task 11: 测试和修复问题
- **Priority**: P0
- **Depends On**: Task 10
- **Description**: 
  - 测试所有集成的功能
  - 修复发现的问题和 bug
  - 确保所有功能正常工作
- **Acceptance Criteria Addressed**: All
- **Test Requirements**: 
  - `programmatic` TR-11.1: 所有功能测试通过
  - `human-judgment` TR-11.2: 用户体验流畅
- **Notes**: 重点测试边缘情况

## [x] Task 12: 更新路由配置
- **Priority**: P0
- **Depends On**: Task 11
- **Description**: 
  - 更新 router.tsx 配置
  - 确保融合后的主页面作为默认路由
  - 保持其他路由不变
- **Acceptance Criteria Addressed**: All
- **Test Requirements**: 
  - `programmatic` TR-12.1: 路由配置正确
  - `programmatic` TR-12.2: 页面导航正常
- **Notes**: 确保向后兼容性