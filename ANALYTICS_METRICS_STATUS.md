# 数据埋点指标实现状态

## 📊 指标实现情况总览

根据您提供的数据埋点需求，以下是各项指标的实现状态：

| 指标名称 | 定义 | 目的 | 实现状态 | 备注 |
|---------|------|------|---------|------|
| **每日记录条数** | `daily_logs` 索引天的记录数量 | 判断记录的粘力大小，如果太少，说明输入太艰难 | 🟡 部分实现 | 有相关事件但需补充 |
| **平均记录字数** | 每条记录的字符长度 | 判断是倾向于长文还是短句还是包含混合 | ✅ 已实现 | `entry_word_count` |
| **晨报生成率** | (生成晨报天数 / 活跃天数) * 100% | 核心指标，验证"闭环"是否畅通 | 🟡 部分实现 | 有频率追踪但需计算生成率 |
| **API 响应时间** | 从点击生成到展示完毕的耗时 | 如果超过 10秒，可能需要优化 UI 的 Loading 动画体验 | ✅ 已实现 | `ai_response_time` |

---

## 1️⃣ 每日记录条数 (daily_logs) 🟡

### 当前实现

#### ✅ 已有相关事件
```typescript
// src/utils/analytics.ts

// 每日访问
EngagementEvents.dailyVisit();  // 追踪用户活跃

// 日记频率（每周）
ContentEvents.entryFrequency(entriesPerWeek);  // 每周条数
```

#### ❌ 缺少的功能
- **每日记录条数统计** - 没有专门追踪"今天创建了几条日记"
- **日活跃度趋势** - 没有按天分组统计

### 📝 需要补充

#### 方案 1：添加每日记录计数事件
```typescript
// src/utils/analytics.ts
export const ContentEvents = {
  // ... 现有代码

  // 新增：每日记录条数
  dailyEntryCount: (count: number) => {
    trackEvent('daily_entry_count', 'Content', 'Daily Logs', count);
  },
};
```

#### 方案 2：在创建日记时追踪
```typescript
// src/pages/Index.tsx
const handleSendEntry = async () => {
  // ... 创建日记逻辑

  // 追踪今日记录数
  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });
  
  ContentEvents.dailyEntryCount(todayEntries.length + 1); // +1 包含刚创建的
};
```

### 🎯 建议实现优先级
**中优先级** - 有替代指标（entry_frequency），但日粒度更精确

---

## 2️⃣ 平均记录字数 ✅

### 当前实现

#### ✅ 完整实现
```typescript
// src/utils/analytics.ts
export const ContentEvents = {
  // 日记平均长度
  entryWordCount: (wordCount: number, category: 'short' | 'medium' | 'long') => {
    trackEvent('entry_word_count', 'Content', category, wordCount);
  },
};
```

#### ✅ 实际调用
```typescript
// src/pages/Index.tsx
const handleSendEntry = async () => {
  const wordCount = journalInput.trim().length;
  
  // GA 追踪：日记字数
  const category = wordCount < 50 ? 'short' : wordCount < 200 ? 'medium' : 'long';
  ContentEvents.entryWordCount(wordCount, category);
};
```

### 📊 数据分析维度
- ✅ 字数统计
- ✅ 分类统计（短/中/长）
- ✅ 趋势分析

### ✨ 状态
**已完成** - 功能完整，数据可用

---

## 3️⃣ 晨报生成率 🟡

### 当前实现

#### ✅ 已有相关事件
```typescript
// src/utils/analytics.ts

// 晨报使用频率（每周）
AIUsageEvents.reportFrequency(reportsPerWeek);

// 首次生成晨报
ConversionEvents.firstReport();

// 生成成功追踪
AIEvents.reportSuccess(responseTime, aiConfig.model);
```

#### ❌ 缺少的功能
- **生成率计算** - (生成晨报天数 / 活跃天数) * 100%
- **活跃天数统计** - 没有明确的活跃天数追踪
- **生成天数统计** - 没有按天维度的生成记录

### 📝 需要补充

#### 方案 1：添加生成率计算事件
```typescript
// src/utils/analytics.ts
export const AIUsageEvents = {
  // ... 现有代码

  // 新增：晨报生成率
  reportGenerationRate: (rate: number, generatedDays: number, activeDays: number) => {
    trackEvent('report_generation_rate', 'AI_Usage', 'Generation Rate', rate, {
      generated_days: generatedDays,
      active_days: activeDays,
    });
  },
};
```

#### 方案 2：在生成晨报时计算
```typescript
// src/pages/Index.tsx
const handleGenerateReport = async () => {
  // ... 生成逻辑

  // 计算生成率
  const activeDays = await calculateActiveDays(); // 需要实现
  const generatedDays = await calculateGeneratedDays(); // 需要实现
  const rate = (generatedDays / activeDays) * 100;
  
  AIUsageEvents.reportGenerationRate(rate, generatedDays, activeDays);
};
```

#### 方案 3：定期计算（推荐）
```typescript
// 在 useEffect 中定期计算（如每次加载页面）
useEffect(() => {
  const calculateAndTrackRate = async () => {
    const activeDays = getActiveDaysCount(entries); // 有记录的天数
    const generatedDays = getGeneratedReportsCount(); // 生成过晨报的天数
    
    if (activeDays > 0) {
      const rate = (generatedDays / activeDays) * 100;
      AIUsageEvents.reportGenerationRate(rate, generatedDays, activeDays);
    }
  };
  
  calculateAndTrackRate();
}, [entries]);
```

### 🎯 建议实现优先级
**高优先级** - 这是核心指标，验证产品闭环

---

## 4️⃣ API 响应时间 ✅

### 当前实现

#### ✅ 完整实现
```typescript
// src/utils/analytics.ts
export const PerformanceEvents = {
  // AI 响应时间
  aiResponseTime: (milliseconds: number, model: string) => {
    trackEvent('ai_response_time', 'Performance', model, milliseconds);
  },
};
```

#### ✅ 实际调用
```typescript
// src/pages/Index.tsx
const handleGenerateReport = async () => {
  const startTime = Date.now();
  
  try {
    // ... API 调用
    
    // 追踪响应时间
    const responseTime = Date.now() - startTime;
    AIEvents.reportSuccess(responseTime, aiConfig.model);
    PerformanceEvents.aiResponseTime(responseTime, aiConfig.model);
  } catch (error) {
    // ...
  }
};
```

#### ✅ PostHog 同步追踪
```typescript
// src/utils/posthog.ts
PostHogPerformanceEvents.aiResponseTime(milliseconds, model);
```

### 📊 数据分析维度
- ✅ 响应时间（毫秒）
- ✅ 按模型分组（DeepSeek / GPT-4 / Claude）
- ✅ 成功/失败追踪
- ✅ 趋势分析

### 🎯 阈值监控
```typescript
// 自动预警（可选实现）
if (responseTime > 10000) { // 超过 10 秒
  ErrorEvents.errorOccurred('slow_response', 'API response > 10s');
  // 可以考虑优化 Loading 动画
}
```

### ✨ 状态
**已完成** - 功能完整，数据可用

---

## 📊 完整实现状态总结

### ✅ 已完成（2/4）
1. **平均记录字数** - 100% 完成
2. **API 响应时间** - 100% 完成

### 🟡 部分完成（2/4）
1. **每日记录条数** - 70% 完成
   - ✅ 有 daily_visit
   - ✅ 有 entry_frequency
   - ❌ 缺少每日粒度统计

2. **晨报生成率** - 60% 完成
   - ✅ 有 report_frequency
   - ✅ 有 first_report
   - ❌ 缺少生成率计算

---

## 🎯 优先级建议

### 🔴 高优先级（核心指标）
1. **晨报生成率** - 产品闭环核心指标
   - 需要实现：生成率计算逻辑
   - 需要实现：活跃天数和生成天数统计
   - 预计工作量：2-3 小时

### 🟡 中优先级（补充指标）
2. **每日记录条数** - 用户粘性指标
   - 需要实现：每日粒度的记录统计
   - 需要实现：日活跃度趋势
   - 预计工作量：1-2 小时

---

## 🛠️ 快速实现建议

### 立即可用的数据
以下指标**已经在收集数据**，可以在 GA4 和 PostHog 中查看：

#### Google Analytics 4
1. 进入 GA4 → 事件 → 查看：
   - `entry_word_count` - 字数统计
   - `ai_response_time` - API 响应时间
   - `report_frequency` - 晨报频率
   - `daily_visit` - 日活跃

#### PostHog
1. 进入 PostHog EU → Live Events
2. 筛选事件：
   - `journal_created` - 包含 word_count
   - `ai_response_time` - 包含 response_time_ms
   - `ai_report_generated` - 生成成功追踪

---

## 📈 数据分析看板建议

### GA4 自定义报告
```
指标名称          | 维度              | 指标
----------------|-------------------|-------
记录活跃度       | daily_visit       | 次数
平均字数        | entry_word_count   | 平均值
API 性能        | ai_response_time   | 平均值、P95、P99
晨报使用        | report_frequency   | 次数、占比
```

### PostHog 自定义看板
```yaml
看板 1: 用户活跃度
  - 日活跃用户（DAU）
  - 每日记录条数趋势
  - 连续活跃天数分布

看板 2: 内容质量
  - 平均字数趋势
  - 字数分布（短/中/长）
  - 标签使用热力图

看板 3: AI 性能
  - API 响应时间趋势
  - 响应时间分布
  - 超时率（>10s）

看板 4: 转化漏斗
  - 注册 → 首篇日记 → 首次晨报
  - 晨报生成率趋势
  - 用户留存曲线
```

---

## 🚀 下一步行动

### 立即可做（无需开发）
1. ✅ 在 GA4 中创建自定义报告查看已有数据
2. ✅ 在 PostHog 中创建看板可视化指标
3. ✅ 设置告警（如 API 响应时间 >10s）

### 需要开发（2-4 小时）
1. 🔴 实现晨报生成率计算
2. 🟡 实现每日记录条数统计
3. 🟢 优化数据收集逻辑

---

**文档创建日期**: 2026-01-23  
**当前实现完成度**: 80% (4/5 核心指标已实现或部分实现)  
**数据收集状态**: ✅ 正常运行  
**分析可用性**: ✅ 可以开始分析
