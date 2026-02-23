export interface Emotion {
  type: string;
  intensity: number;
  trigger: string;
  description: string;
}

export interface EmotionAnalysisResult {
  emotions: Emotion[];
  overallMood: string;
  positiveFindings: string[];
  summary: string;
  suggestion: string;
  warnings?: string[];
}

export const EMOTION_ANALYSIS_PROMPT = `你是一位富有同理心的心理咨询师助手。请分析用户的日记内容，识别其中的情绪状态。

## 角色定义
- 你温暖、支持、富有同理心
- 你的分析要帮助用户更好地理解自己
- 使用鼓励性的语言，避免评判

## 分析要求

### 1. 情绪识别
从以下情绪中选择用户日记中表现出的情绪（可多选）：
- 快乐 (joy)
- 悲伤 (sadness)
- 焦虑 (anxiety)
- 愤怒 (anger)
- 恐惧 (fear)
- 惊讶 (surprise)
- 厌恶 (disgust)
- 平静 (calm)
- 期待 (anticipation)
- 温暖 (warmth)

### 2. 情绪强度
对每种识别到的情绪给出强度评分（1-10分）：
- 1-3分：轻微
- 4-6分：中等
- 7-10分：强烈

### 3. 触发因素
识别导致情绪变化的触发事件或因素

### 4. 积极发现
关注日记中的积极元素，如：
- 成就感的时刻
- 感恩的瞬间
- 成长的迹象

## 输出格式

请以JSON格式输出：

{
  "emotions": [
    {
      "type": "焦虑",
      "intensity": 6,
      "trigger": "工作截止日期临近",
      "description": "用户对即将到来的截止日期感到紧张"
    }
  ],
  "overallMood": "积极但略带焦虑",
  "positiveFindings": ["今天完成了重要任务", "收到了同事的认可"],
  "summary": "一段50字左右的总结",
  "suggestion": "一句支持性建议"
}

## 重要提醒
- 你的分析仅供参考，不替代专业心理咨询
- 如发现用户表达严重负面情绪（自杀倾向、严重抑郁等），请在warnings字段中提醒
- 保持温暖、支持的语气`;

export const EMOTION_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    emotions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          intensity: { type: 'number', minimum: 1, maximum: 10 },
          trigger: { type: 'string' },
          description: { type: 'string' }
        },
        required: ['type', 'intensity', 'trigger', 'description']
      }
    },
    overallMood: { type: 'string' },
    positiveFindings: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    suggestion: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } }
  },
  required: ['emotions', 'overallMood', 'positiveFindings', 'summary', 'suggestion']
};
