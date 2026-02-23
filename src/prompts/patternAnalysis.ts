export interface Pattern {
  pattern: string;
  category: string;
  frequency: string;
  type: 'positive' | 'negative' | 'neutral';
  possibleCause: string;
  suggestion: string;
}

export interface Habit {
  habit: string;
  status: string;
  consistency: number;
  suggestion: string;
}

export interface Trigger {
  trigger: string;
  behavior: string;
  suggestion: string;
}

export interface PatternAnalysisResult {
  period: {
    days: number;
    entryCount: number;
    averagePerDay: number;
  };
  patterns: Pattern[];
  habits: Habit[];
  triggers: Trigger[];
  insights: string[];
  recommendations: string[];
}

export const PATTERN_ANALYSIS_PROMPT = `你是一位资深的个人成长教练。请分析用户过去一段时间的日记，识别行为模式。

## 分析周期
{period} 天（{startDate} 至 {endDate}）

## 日记内容
{journalEntries}

## 分析要求

### 1. 行为模式识别
识别反复出现的行为模式：
- 工作习惯（时间管理、任务处理）
- 社交模式（人际交往频率，质量）
- 学习习惯（学习时间、专注度）
- 健康习惯（运动、睡眠、饮食）
- 情绪波动模式

### 2. 习惯追踪
对于以下习惯，评估养成状态：
- 已养成（持续2周以上）
- 正在培养（持续1-2周）
- 尝试中（刚起步）
- 已放弃（曾经有但中断）

### 3. 诱因分析
识别触发特定行为的诱因：
- 时间诱因（周末、工作日、特定时段）
- 环境诱因（地点、天气、噪音）
- 社交诱因（特定人物、社交场合）
- 情绪诱因（特定情绪触发特定行为）

### 4. 改进建议
区分：
- "positive"（可以保持）：积极的模式
- "negative"（需要改进）：需要调整的模式
- "neutral"（中性）：无明显好坏

## 输出格式

请以JSON格式输出：

{
  "period": {
    "days": 30,
    "entryCount": 25,
    "averagePerDay": 0.83
  },
  "patterns": [
    {
      "pattern": "每到周五工作效率明显下降",
      "category": "work",
      "frequency": "每周出现",
      "type": "negative",
      "possibleCause": "周末前的心理放松",
      "suggestion": "可以在周五安排不需要高强度的任务"
    }
  ],
  "habits": [
    {
      "habit": "晨间写作",
      "status": "已养成",
      "consistency": 85,
      "suggestion": "保持得很好"
    }
  ],
  "triggers": [
    {
      "trigger": "周末",
      "behavior": "作息时间混乱",
      "suggestion": "建议周末也保持基本作息"
    }
  ],
  "insights": [
    "用户在工作日更有规律",
    "社交活动集中在周末"
  ],
  "recommendations": [
    "保持晨间写作习惯",
    "注意周五的时间安排"
  ]
}

## 重要提醒
- 你的分析基于用户主动提供的内容，可能不完整
- 结论仅供参考，不替代专业心理咨询
- 建议要具体、可执行`;

export const PATTERN_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    period: {
      type: 'object',
      properties: {
        days: { type: 'number' },
        entryCount: { type: 'number' },
        averagePerDay: { type: 'number' }
      },
      required: ['days', 'entryCount', 'averagePerDay']
    },
    patterns: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pattern: { type: 'string' },
          category: { type: 'string' },
          frequency: { type: 'string' },
          type: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
          possibleCause: { type: 'string' },
          suggestion: { type: 'string' }
        },
        required: ['pattern', 'category', 'frequency', 'type', 'possibleCause', 'suggestion']
      }
    },
    habits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          habit: { type: 'string' },
          status: { type: 'string' },
          consistency: { type: 'number' },
          suggestion: { type: 'string' }
        },
        required: ['habit', 'status', 'consistency', 'suggestion']
      }
    },
    triggers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          trigger: { type: 'string' },
          behavior: { type: 'string' },
          suggestion: { type: 'string' }
        },
        required: ['trigger', 'behavior', 'suggestion']
      }
    },
    insights: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } }
  },
  required: ['period', 'patterns', 'habits', 'triggers', 'insights', 'recommendations']
};
