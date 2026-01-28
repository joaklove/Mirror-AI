# 🚀 分析工具快速上手指南

## ✅ 当前状态

两个分析系统已完全配置并运行：

- ✅ **Google Analytics 4** (G-02BYH6YYBB)
- ✅ **PostHog** (phc_W850t1PnPtkl6PvUmsgYYifFayLhBmo6gigt6K6b9xU)

---

## 🔍 如何验证分析工具正常工作

### 1. 验证 Google Analytics

#### 方法一：实时报告
1. 访问 [Google Analytics](https://analytics.google.com/)
2. 选择属性 `G-02BYH6YYBB`
3. 点击 **报告** → **实时**
4. 打开你的应用
5. 应该看到 **1 个活跃用户**

#### 方法二：浏览器控制台
1. 打开应用
2. 按 `F12` 打开 DevTools
3. 切换到 **Console** 标签
4. 应该看到：
```
[GA] Event tracked: daily_visit { category: 'Engagement', ... }
```

#### 方法三：Network 请求
1. 打开 DevTools → **Network** 标签
2. 搜索 `google-analytics` 或 `collect`
3. 应该看到状态码 **200** 的请求

---

### 2. 验证 PostHog

#### 方法一：PostHog 仪表盘
1. 访问 [PostHog](https://eu.i.posthog.com/)
2. 登录你的账号
3. 点击 **Events** 或 **Live Events**
4. 打开你的应用
5. 应该看到事件实时出现

#### 方法二：浏览器控制台
1. 打开应用
2. 按 `F12` 打开 DevTools
3. 切换到 **Console** 标签
4. 应该看到：
```
[PostHog] Event captured: journal_created { word_count: 25, ... }
```

#### 方法三：Network 请求
1. 打开 DevTools → **Network** 标签
2. 搜索 `posthog` 或 `decide`
3. 应该看到请求成功

---

## 📊 查看数据的位置

### Google Analytics 4

#### 1. 实时数据
**路径**: 报告 → 实时  
**查看**: 当前活跃用户、页面浏览、事件

#### 2. 事件报告
**路径**: 报告 → 互动 → 事件  
**查看**: 所有事件统计、趋势图

#### 3. 转化漏斗
**路径**: 探索 → 路径探索  
**设置**: 自定义用户路径

#### 4. 用户属性
**路径**: 报告 → 用户 → 用户属性  
**查看**: 人口统计、设备、地理位置

---

### PostHog

#### 1. 实时事件
**路径**: Events → Live Events  
**查看**: 实时事件流

#### 2. 会话录制
**路径**: Session Recordings  
**功能**: 
- 观看用户操作录像
- 过滤特定用户/事件
- 回放会话

#### 3. 漏斗分析
**路径**: Insights → Funnels  
**功能**:
- 创建转化漏斗
- 查看每步转化率
- 分析流失原因

#### 4. 用户路径
**路径**: Insights → Paths  
**功能**:
- 可视化用户旅程
- 发现主要路径
- 找到优化机会

#### 5. 留存分析
**路径**: Insights → Retention  
**功能**:
- 次日/7日/30日留存
- 按功能分组
- 对比不同群组

---

## 🎯 常用查询

### Google Analytics 4

#### 查看每日活跃用户
1. 报告 → 实时
2. 选择时间范围
3. 查看活跃用户数

#### 查看转化率
1. 探索 → 空白
2. 维度: 事件名称
3. 指标: 事件计数
4. 添加漏斗步骤

---

### PostHog

#### 查看功能使用率
```
Insights → Trends
Event: journal_created
Time: Last 30 days
Group by: 无
```

#### 查看转化漏斗
```
Insights → Funnels
Steps:
1. user_signed_up
2. conversion_first_entry
3. conversion_first_report
Time window: 7 days
```

#### 查看用户录像
```
Session Recordings
Filter by:
- Email (if identified)
- Event: conversion_first_entry
- Date: Today
```

---

## 🔧 调试问题

### GA4 没有数据

#### 检查清单
1. ✅ 广告拦截器已禁用？
2. ✅ 浏览器控制台有 `[GA]` 日志？
3. ✅ Network 请求状态码 200？
4. ✅ 等待 24-48 小时（标准报告）

#### 常见问题
**问题**: Network 请求状态码 0  
**原因**: 广告拦截器  
**解决**: 禁用 AdBlock、uBlock Origin 等

**问题**: 控制台无日志  
**原因**: GA 代码未加载  
**解决**: 检查 index.html 中的 gtag 脚本

---

### PostHog 没有数据

#### 检查清单
1. ✅ `.env` 文件存在？
2. ✅ PostHog key 正确？
3. ✅ 浏览器控制台有 `[PostHog]` 日志？
4. ✅ Network 请求成功？

#### 常见问题
**问题**: PostHog 未初始化  
**原因**: 环境变量未加载  
**解决**: 重启开发服务器 `npm run dev`

**问题**: 事件未追踪  
**原因**: PostHog key 错误  
**解决**: 检查 `.env` 中的 `VITE_PUBLIC_POSTHOG_KEY`

---

## 📚 推荐的分析流程

### 每日检查（5 分钟）
1. **GA4 实时报告** - 查看当前活跃用户
2. **PostHog Live Events** - 检查事件是否正常
3. **PostHog 错误事件** - 查看是否有新错误

### 每周复盘（30 分钟）
1. **GA4 用户报告** - 查看 DAU/WAU 趋势
2. **PostHog 转化漏斗** - 分析各环节转化率
3. **PostHog 留存分析** - 查看 7 日留存率
4. **PostHog 录像回放** - 观看 5-10 个用户会话

### 每月分析（2 小时）
1. **GA4 流量来源** - 评估营销渠道效果
2. **PostHog 功能使用** - 分析功能价值
3. **PostHog 用户路径** - 优化用户旅程
4. **对比上月数据** - 评估改进效果

---

## 🎓 学习资源

### Google Analytics
- [GA4 官方文档](https://support.google.com/analytics/)
- [GA4 学院](https://analytics.google.com/analytics/academy/)
- [GA4 YouTube 频道](https://www.youtube.com/user/googleanalytics)

### PostHog
- [PostHog 文档](https://posthog.com/docs)
- [PostHog 教程](https://posthog.com/tutorials)
- [PostHog 博客](https://posthog.com/blog)

---

## 💡 常见使用场景

### 场景 1: 发现用户在哪里流失
1. **PostHog** → Funnels
2. 创建漏斗: 注册 → 首篇日记 → 首次晨报
3. 查看每步转化率
4. 点击流失最多的步骤
5. 观看该步骤的用户录像
6. 发现问题并优化

### 场景 2: 评估新功能效果
1. **PostHog** → Trends
2. 事件: 新功能相关事件
3. 时间: 发布前后 14 天
4. 对比使用量变化
5. **PostHog** → Recordings → 过滤新功能事件
6. 观看用户如何使用
7. 收集反馈并迭代

### 场景 3: 优化营销渠道
1. **GA4** → 报告 → 获客
2. 查看各渠道流量
3. 查看各渠道转化率
4. **PostHog** → Funnels → 按来源分组
5. 对比不同来源用户质量
6. 优化高转化渠道投放

---

## ✅ 快速检查清单

### 安装验证
- [ ] GA4 实时报告能看到活跃用户
- [ ] PostHog 能看到实时事件
- [ ] 浏览器控制台有分析日志
- [ ] Network 请求都成功

### 功能验证
- [ ] 创建日记 → 两个工具都追踪
- [ ] 生成晨报 → 两个工具都追踪
- [ ] 用户注册 → 两个工具都追踪
- [ ] 错误发生 → 两个工具都追踪

### 数据验证
- [ ] GA4 转化漏斗配置完成
- [ ] PostHog 转化漏斗配置完成
- [ ] PostHog 会话录制正常工作
- [ ] 用户识别功能正常

---

## 🚀 下一步

1. **配置告警** - 设置关键指标下降告警
2. **创建仪表盘** - 汇总核心指标
3. **定期复盘** - 每周查看数据并优化
4. **团队培训** - 让团队了解如何使用

---

**需要帮助？**  
查看详细文档:
- `GA_EVENTS_CHECKLIST.md` - GA 事件完整清单
- `POSTHOG_SETUP.md` - PostHog 详细配置
- `ANALYTICS_COMPARISON.md` - 两者对比分析

---

**状态**: ✅ 一切就绪，开始收集数据！  
**最后更新**: 2026-01-22
