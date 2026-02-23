export interface TraumaPattern {
  pattern: string;
  category: string;
  recognition: string;
  severity: 'low' | 'moderate' | 'high';
  professionalHelp: string;
}

export interface AttachmentPattern {
  type: string;
  evidence: string[];
  suggestion: string;
}

export interface CoreBeliefs {
  self: string[];
  others: string[];
  world: string[];
}

export interface SafetyCheck {
  continue: boolean;
  reasons: string[];
  warnings: string[];
}

export interface TraumaAnalysisResult {
  safetyCheck: SafetyCheck;
  traumaPatterns: TraumaPattern[];
  attachmentPattern: AttachmentPattern;
  coreBeliefs: CoreBeliefs;
  strengths: string[];
  selfCareSuggestions: string[];
  professionalHelpNeeded: boolean;
  professionalMessage: string;
}

export const TRAUMA_ANALYSIS_PROMPT = `你是一位专业的心理创伤治疗师。请分析用户的日记，识别潜在的心理创伤模式。

重要前提：
- 用户已明确授权进行深度心理分析
- 用户承诺提供真实、完整的记录
- 本分析仅供参考，不替代专业心理治疗

## 分析周期
{period} 天（{startDate} 至 {endDate}）

## 日记内容
{journalEntries}

## 安全边界（必须遵守）

### 必须停止分析的情况
- 用户明确表示不想继续
- 发现自伤/自杀倾向
- 发现严重的暴力倾向
- 用户处于急性心理危机中

### 必须建议寻求专业帮助的情况
- 反复出现同一类型的负面情绪
- 创伤后应激反应（PTSD）迹象
- 长期严重的抑郁或焦虑
- 人际关系中的持续伤害模式

## 分析要求

### 1. 创伤模式识别
识别反复出现的负面模式：
- 反复出现的特定情绪
- 特定触发事件
- 回避行为模式
- 过度警觉迹象

### 2. 依恋模式
识别人际关系中的模式：
- 安全型依恋
- 焦虑型依恋
- 回避型依恋
- 混乱型依恋

### 3. 核心信念
识别潜在的核心信念：
- 关于自我的信念
- 关于他人的信念
- 关于世界的信念

### 4. 自我疗愈资源
识别用户的自我疗愈资源：
- 积极的应对策略
- 支持系统
- 兴趣爱好
- 成长迹象

## 输出格式

请以JSON格式输出：

{
  "safetyCheck": {
    "continue": true,
    "reasons": ["用户持续记录，表明有一定稳定性"],
    "warnings": []
  },
  "traumaPatterns": [
    {
      "pattern": "每提及父亲相关话题情绪明显低落",
      "category": "family",
      "recognition": "可能是早年亲子关系相关创伤",
      "severity": "moderate",
      "professionalHelp": "建议考虑专业心理辅导"
    }
  ],
  "attachmentPattern": {
    "type": "anxious",
    "evidence": ["渴望亲密但害怕被抛弃", "过度敏感于关系变化"],
    "suggestion": "可以在安全的关系中逐渐建立安全感"
  },
  "coreBeliefs": {
    "self": ["我不值得被爱"],
    "others": ["人们最终会离开"],
    "world": ["世界是危险的"]
  },
  "strengths": [
    "用户持续记录，表明有自我探索的意愿",
    "有一定的社交支持系统"
  ],
  "selfCareSuggestions": [
    "继续记录，这是很好的自我觉察方式",
    "可以尝试正念冥想"
  ],
  "professionalHelpNeeded": false,
  "professionalMessage": "如果感到困扰，可以考虑咨询专业心理医生"
}

## 绝对禁止
- 不可进行正式诊断
- 不可确认用户有"创伤后应激障碍"等诊断
- 不可深入挖掘用户可能不愿面对的记忆
- 不可强制用户面对痛苦的经历

## 重要提醒
- 始终保持温和、支持的语气
- 如有任何安全顾虑，优先建议寻求专业帮助`;

export const TRAUMA_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    safetyCheck: {
      type: 'object',
      properties: {
        continue: { type: 'boolean' },
        reasons: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } }
      },
      required: ['continue', 'reasons', 'warnings']
    },
    traumaPatterns: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pattern: { type: 'string' },
          category: { type: 'string' },
          recognition: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'moderate', 'high'] },
          professionalHelp: { type: 'string' }
        },
        required: ['pattern', 'category', 'recognition', 'severity', 'professionalHelp']
      }
    },
    attachmentPattern: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        evidence: { type: 'array', items: { type: 'string' } },
        suggestion: { type: 'string' }
      },
      required: ['type', 'evidence', 'suggestion']
    },
    coreBeliefs: {
      type: 'object',
      properties: {
        self: { type: 'array', items: { type: 'string' } },
        others: { type: 'array', items: { type: 'string' } },
        world: { type: 'array', items: { type: 'string' } }
      },
      required: ['self', 'others', 'world']
    },
    strengths: { type: 'array', items: { type: 'string' } },
    selfCareSuggestions: { type: 'array', items: { type: 'string' } },
    professionalHelpNeeded: { type: 'boolean' },
    professionalMessage: { type: 'string' }
  },
  required: [
    'safetyCheck',
    'traumaPatterns',
    'attachmentPattern',
    'coreBeliefs',
    'strengths',
    'selfCareSuggestions',
    'professionalHelpNeeded',
    'professionalMessage'
  ]
};
