# Mirror AI 详细技术设计方案

## 一、心理分析 AI 完整提示词实现

### 1.1 L1 基础层 - 情绪识别提示词

```typescript
// src/prompts/emotionAnalysis.ts

export const EMOTION_ANALYSIS_PROMPT = `
你是一位富有同理心的心理咨询师助手。请分析用户的日记内容，识别其中的情绪状态。

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

## ⚠️ 重要提醒
- 你的分析仅供参考，不替代专业心理咨询
- 如发现用户表达严重负面情绪（自杀倾向、严重抑郁等），请在warnings字段中提醒
- 保持温暖、支持的语气
`;

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
        }
      }
    },
    overallMood: { type: 'string' },
    positiveFindings: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    suggestion: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } }
  }
};
```

### 1.2 L2 进阶层 - 行为模式识别提示词

```typescript
// src/prompts/patternAnalysis.ts

export const PATTERN_ANALYSIS_PROMPT = `
你是一位资深的个人成长教练。请分析用户过去一段时间的日记，识别行为模式。

## 分析周期
{period} 天（{startDate} 至 {endDate}）

## 日记内容
{journalEntries}

## 分析要求

### 1. 行为模式识别
识别反复出现的行为模式：
- 工作习惯（时间管理、任务处理）
- 社交模式（人际交往频率、质量）
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
- "可以保持"：积极的模式
- "需要改进"：需要调整的模式

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
    "洞察1：用户在工作日更有规律",
    "洞察2：社交活动集中在周末"
  ],
  "recommendations": [
    "建议1：保持晨间写作习惯",
    "建议2：注意周五的时间安排"
  ]
}

## ⚠️ 重要提醒
- 你的分析基于用户主动提供的内容，可能不完整
- 结论仅供参考，不替代专业心理咨询
- 建议要具体、可执行
`;

export const PATTERN_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    period: {
      type: 'object',
      properties: {
        days: { type: 'number' },
        entryCount: { type: 'number' },
        averagePerDay: { type: 'number' }
      }
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
        }
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
        }
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
        }
      }
    },
    insights: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } }
  }
};
```

### 1.3 L3 深度层 - 心理创伤识别提示词

```typescript
// src/prompts/traumaAnalysis.ts

export const TRAUMA_ANALYSIS_PROMPT = `
你是一位专业的心理创伤治疗师。请分析用户的日记，识别潜在的心理创伤模式。

⚠️ 重要前提：
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
    "建议1：继续记录，这是很好的自我觉察方式",
    "建议2：可以尝试正念冥想"
  ],
  "professionalHelpNeeded": false,
  "professionalMessage": "如果感到困扰，可以考虑咨询专业心理医生"
}

## ⚠️ 绝对禁止
- 不可进行正式诊断
- 不可确认用户有"创伤后应激障碍"等诊断
- 不可深入挖掘用户可能不愿面对的记忆
- 不可强制用户面对痛苦的经历
`;

export const TRAUMA_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    safetyCheck: {
      type: 'object',
      properties: {
        continue: { type: 'boolean' },
        reasons: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } }
      }
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
        }
      }
    },
    attachmentPattern: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        evidence: { type: 'array', items: { type: 'string' } },
        suggestion: { type: 'string' }
      }
    },
    coreBeliefs: {
      type: 'object',
      properties: {
        self: { type: 'array', items: { type: 'string' } },
        others: { type: 'array', items: { type: 'string' } },
        world: { type: 'array', items: { type: 'string' } }
      }
    },
    strengths: { type: 'array', items: { type: 'string' } },
    selfCareSuggestions: { type: 'array', items: { type: 'string' } },
    professionalHelpNeeded: { type: 'boolean' },
    professionalMessage: { type: 'string' }
  }
};
```

### 1.4 AI 服务封装

```typescript
// src/services/aiAnalysis.ts

import { EMOTION_ANALYSIS_PROMPT, EMOTION_ANALYSIS_SCHEMA } from '../prompts/emotionAnalysis';
import { PATTERN_ANALYSIS_PROMPT, PATTERN_ANALYSIS_SCHEMA } from '../prompts/patternAnalysis';
import { TRAUMA_ANALYSIS_PROMPT, TRAUMA_ANALYSIS_SCHEMA } from '../prompts/traumaAnalysis';

export type AnalysisLevel = 'L1' | 'L2' | 'L3';

interface AnalysisOptions {
  level: AnalysisLevel;
  journalEntries: JournalEntry[];
  period?: number;
}

export class AIAnalysisService {
  private model: string;

  constructor(model: string = 'openai/gpt-4o') {
    this.model = model;
  }

  async analyze(options: AnalysisOptions): Promise<any> {
    const { level, journalEntries, period = 7 } = options;

    let prompt: string;
    let schema: object;

    switch (level) {
      case 'L1':
        prompt = this.buildL1Prompt(journalEntries);
        schema = EMOTION_ANALYSIS_SCHEMA;
        break;
      case 'L2':
        prompt = this.buildL2Prompt(journalEntries, period);
        schema = PATTERN_ANALYSIS_SCHEMA;
        break;
      case 'L3':
        prompt = this.buildL3Prompt(journalEntries, period);
        schema = TRAUMA_ANALYSIS_SCHEMA;
        break;
      default:
        throw new Error('Invalid analysis level');
    }

    return this.callAI(prompt, schema);
  }

  private buildL1Prompt(entries: JournalEntry[]): string {
    const content = entries
      .map((e, i) => `【记录 ${i + 1}】\n时间：${new Date(e.timestamp).toLocaleString()}\n内容：${e.content}`)
      .join('\n\n');

    return EMOTION_ANALYSIS_PROMPT.replace('{journalEntries}', content);
  }

  private buildL2Prompt(entries: JournalEntry[], period: number): string {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const content = entries
      .map((e, i) => `【记录 ${i + 1}】\n时间：${new Date(e.timestamp).toLocaleString()}\n内容：${e.content}`)
      .join('\n\n');

    return PATTERN_ANALYSIS_PROMPT
      .replace('{period}', period.toString())
      .replace('{startDate}', startDate.toLocaleDateString())
      .replace('{endDate}', new Date().toLocaleDateString())
      .replace('{journalEntries}', content);
  }

  private buildL3Prompt(entries: JournalEntry[], period: number): string {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const content = entries
      .map((e, i) => `【记录 ${i + 1}】\n时间：${new Date(e.timestamp).toLocaleString()}\n内容：${e.content}`)
      .join('\n\n');

    return TRAUMA_ANALYSIS_PROMPT
      .replace('{period}', period.toString())
      .replace('{startDate}', startDate.toLocaleDateString())
      .replace('{endDate}', new Date().toLocaleDateString())
      .replace('{journalEntries}', content);
  }

  private async callAI(prompt: string, schema: object): Promise<any> {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: prompt }
        ],
        response_format: {
          type: 'json_object',
          schema
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI分析失败: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}

export const aiAnalysisService = new AIAnalysisService();
```

---

## 二、隐私设计详细方案

### 2.1 数据分级存储

```typescript
// src/types/privacy.ts

export enum DataLevel {
  PUBLIC = 0,     // 公开：分析洞察、趋势数据
  SENSITIVE = 1,  // 敏感：日记内容、情绪记录
  CONFIDENTIAL = 2, // 机密：心理分析、创伤记录
  SECRET = 3     // 绝密：未成年人数据
}

export interface PrivacySettings {
  // 数据存储
  storage: {
    cloudSync: boolean;
    localOnly: boolean;
    encryption: boolean;
    encryptionKey?: string; // 本地生成，不上传
  };

  // AI 分析
  aiAnalysis: {
    enabled: boolean;
    basic: boolean;      // L1 基础分析
    advanced: boolean;    // L2 进阶分析
    deep: boolean;       // L3 深度分析（需额外授权）
    consent: boolean;
    consentDate?: string;
  };

  // 数据共享
  sharing: {
    anonymousInsights: boolean;
    researchParticipation: boolean;
  };

  // 数据权利
  rights: {
    exportEnabled: boolean;
    deleteEnabled: boolean;
    retentionDays: number;
  };
}

// src/services/privacyService.ts

export class PrivacyService {
  private encryptionKey: CryptoKey | null = null;

  async initialize(): Promise<void> {
    // 从本地存储获取或生成加密密钥
    const storedKey = localStorage.getItem('encryptionKey');
    if (storedKey) {
      this.encryptionKey = await this.importKey(storedKey);
    } else {
      this.encryptionKey = await this.generateKey();
      const exported = await this.exportKey(this.encryptionKey);
      localStorage.setItem('encryptionKey', exported);
    }
  }

  private async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) await this.initialize();

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      encoder.encode(data)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) await this.initialize();

    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      data
    );

    return new TextDecoder().decode(decrypted);
  }

  async exportData(userId: string): Promise<Blob> {
    const entries = await journalService.getEntries(userId);
    const settings = await settingsService.getSettings(userId);

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      entries,
      settings
    };

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
  }
}

export const privacyService = new PrivacyService();
```

### 2.2 隐私设置 UI

```tsx
// src/components/PrivacySettings.tsx

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings>({
    storage: { cloudSync: true, localOnly: false, encryption: true },
    aiAnalysis: { enabled: true, basic: true, advanced: false, deep: false },
    sharing: { anonymousInsights: false, researchParticipation: false },
    rights: { exportEnabled: true, deleteEnabled: true, retentionDays: 365 }
  });

  const handleSave = async () => {
    await settingsService.savePrivacySettings(settings);
    toast({ title: '设置已保存' });
  };

  const handleExport = async () => {
    const blob = await privacyService.exportData(userId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirror-ai-export-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">🔒 隐私设置</h1>

      {/* 数据存储 */}
      <Card>
        <CardHeader>
          <CardTitle>💾 数据存储</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">云同步</p>
              <p className="text-sm text-gray-500">将数据同步到云端</p>
            </div>
            <Switch
              checked={settings.storage.cloudSync}
              onCheckedChange={(v) => setSettings({
                ...settings,
                storage: { ...settings.storage, cloudSync: v }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">端到端加密</p>
              <p className="text-sm text-gray-500">数据加密后再同步</p>
            </div>
            <Switch
              checked={settings.storage.encryption}
              onCheckedChange={(v) => setSettings({
                ...settings,
                storage: { ...settings.storage, encryption: v }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI 分析 */}
      <Card>
        <CardHeader>
          <CardTitle>🤖 AI 分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">启用 AI 分析</p>
              <p className="text-sm text-gray-500">允许 AI 分析您的记录</p>
            </div>
            <Switch
              checked={settings.aiAnalysis.enabled}
              onCheckedChange={(v) => setSettings({
                ...settings,
                aiAnalysis: { ...settings.aiAnalysis, enabled: v }
              })}
            />
          </div>

          {settings.aiAnalysis.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">基础分析 (L1)</p>
                  <p className="text-sm text-gray-500">情绪识别、情感分析</p>
                </div>
                <Switch
                  checked={settings.aiAnalysis.basic}
                  onCheckedChange={(v) => setSettings({
                    ...settings,
                    aiAnalysis: { ...settings.aiAnalysis, basic: v }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">进阶分析 (L2)</p>
                  <p className="text-sm text-gray-500">行为模式识别</p>
                </div>
                <Switch
                  checked={settings.aiAnalysis.advanced}
                  onCheckedChange={(v) => setSettings({
                    ...settings,
                    aiAnalysis: { ...settings.aiAnalysis, advanced: v }
                  })}
                />
              </div>

              <Alert>
                <AlertDescription>
                  深度心理分析需要额外授权，每次分析前都会要求确认
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* 数据权利 */}
      <Card>
        <CardHeader>
          <CardTitle>📤 数据权利</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExport} variant="outline">
            导出我的数据
          </Button>

          <Alert variant="destructive">
            <AlertDescription>
              删除数据后将无法恢复，请谨慎操作
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        保存设置
      </Button>
    </div>
  );
}
```

---

## 三、免责声明详细设计

### 3.1 免责声明内容

```typescript
// src/constants/disclaimer.ts

export const DISCLAIMER_CONTENT = {
  // 基础免责声明
  basic: {
    title: '免责声明',
    content: '此分析仅供参考，不替代专业心理咨询。',
    severity: 'low'
  },

  // 周期报告免责声明
  report: {
    title: '⚠️ 重要提示',
    content: `本报告由 AI 自动生成，仅供参考。
- 不替代专业心理咨询或医学诊断
- 结论基于您提供的内容，可能不完整
- 如有心理困扰，建议咨询专业心理医生`,
    severity: 'medium',
    buttons: [
      { label: '我已知悉，继续查看', primary: true },
      { label: '了解更多', primary: false }
    ]
  },

  // 心理分析免责声明
  psychological: {
    title: '🧠 深度心理分析',
    content: `您即将查看深度心理分析报告

⚠️ 重要提醒：
• 本分析基于 AI 算法，仅供参考
• 不替代专业心理治疗或诊断
• 如有严重心理困扰，请寻求专业帮助
• 您的记录将被用于生成此分析

本分析可能涉及：
• 潜在心理模式识别
• 行为诱因分析
• 可能的成长建议

如感到不适，请立即停止查看并寻求专业支持。`,
    severity: 'high',
    requiresCheck: true,
    professionalHelp: {
      hotline: '400-161-9995',
      label: '全国心理援助热线'
    }
  }
};

export const PROFESSIONAL_HELP_RESOURCES = [
  { name: '全国心理援助热线', phone: '400-161-9995', available: '24小时' },
  { name: '生命热线', phone: '400-821-1215', available: '24小时' },
  { name: '北京心理危机研究与干预中心', phone: '010-82951332', available: '24小时' }
];
```

### 3.2 免责声明组件

```tsx
// src/components/DisclaimerModal.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DISCLAIMER_CONTENT, PROFESSIONAL_HELP_RESOURCES } from '@/constants/disclaimer';

interface DisclaimerModalProps {
  type: 'basic' | 'report' | 'psychological';
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DisclaimerModal({ type, open, onConfirm, onCancel }: DisclaimerModalProps) {
  const [checked, setChecked] = useState(false);
  const content = DISCLAIMER_CONTENT[type];

  const handleConfirm = () => {
    if (content.requiresCheck && !checked) return;
    onConfirm();
    setChecked(false);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="whitespace-pre-line text-gray-700">
            {content.content}
          </div>

          {content.requiresCheck && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={checked}
                onCheckedChange={(v) => setChecked(v as boolean)}
              />
              <label htmlFor="consent" className="text-sm">
                我已阅读并理解上述提示
              </label>
            </div>
          )}

          {content.professionalHelp && (
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">如有需要，请联系：</p>
                {PROFESSIONAL_HELP_RESOURCES.map((resource) => (
                  <p key={resource.phone}>
                    {resource.name}: {resource.phone} ({resource.available})
                  </p>
                ))}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={content.requiresCheck && !checked}
            variant={content.requiresCheck ? 'default' : 'default'}
          >
            {content.requiresCheck ? '确认查看' : '继续'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 使用示例
function AnalysisReport() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleViewReport = async () => {
    // 检查是否需要显示免责声明
    const needDisclaimer = localStorage.getItem('psychological_disclaimer_shown');

    if (!needDisclaimer) {
      setShowDisclaimer(true);
    } else {
      // 显示轻量提示
      showToast({ message: '此分析仅供参考', type: 'info' });
      // 显示报告
    }
  };

  const handleDisclaimerConfirm = () => {
    localStorage.setItem('psychological_disclaimer_shown', Date.now().toString());
    setShowDisclaimer(false);
    // 显示报告
  };

  return (
    <>
      <Button onClick={handleViewReport}>查看分析报告</Button>

      <DisclaimerModal
        type="psychological"
        open={showDisclaimer}
        onConfirm={handleDisclaimerConfirm}
        onCancel={() => setShowDisclaimer(false)}
      />
    </>
  );
}
```

### 3.3 分析结果标注

```tsx
// src/components/AnalysisResult.tsx

interface AnalysisResultProps {
  title: string;
  content: any;
  type: 'emotion' | 'pattern' | 'psychological';
  generatedAt: string;
  version: string;
}

export function AnalysisResult({ title, content, type, generatedAt, version }: AnalysisResultProps) {
  return (
    <div className="analysis-result">
      {/* 标题 */}
      <h2>{title}</h2>

      {/* 分析内容 */}
      <div className="content">
        {JSON.stringify(content, null, 2)}
      </div>

      {/* 底部免责声明 */}
      <div className="disclaimer">
        <div className="disclaimer-header">
          <span className="icon">⚠️</span>
          <span className="title">免责声明</span>
        </div>

        <ul className="disclaimer-list">
          <li>本分析由 AI 自动生成，仅供参考</li>
          <li>不替代专业心理咨询或医学诊断</li>
          <li>结论基于您提供的内容，可能不完整</li>
          <li>如有心理困扰，建议咨询专业心理医生</li>
        </ul>

        <div className="professional-help">
          <strong>如有紧急情况，请联系：</strong>
          <p>全国心理援助热线：400-161-9995</p>
        </div>

        <div className="meta">
          <span>生成时间：{generatedAt}</span>
          <span>版本：{version}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 四、提醒机制详细实现

### 4.1 提醒服务架构

```typescript
// src/types/reminder.ts

export interface ReminderSettings {
  enabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  scheduled: {
    enabled: boolean;
    reminders: ScheduledReminder[];
  };
  intelligent: {
    enabled: boolean;
    maxPerDay: number;
    sensitivity: 'low' | 'medium' | 'high';
  };
  caring: {
    enabled: boolean;
    thresholdDays: number;
    message: string;
  };
}

export interface ScheduledReminder {
  id: string;
  time: string;      // "09:00"
  days: number[];   // [1,2,3,4,5] 工作日
  message?: string;
  enabled: boolean;
}

export interface ReminderLog {
  id: string;
  type: 'scheduled' | 'intelligent' | 'caring';
  sentAt: string;
  message: string;
  clicked: boolean;
}
```

### 4.2 推送通知实现（Web Push）

```typescript
// src/services/notificationService.ts

export class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    this.registration = await navigator.serviceWorker.register('/sw.js');
    return true;
  }

  async sendNotification(options: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: NotificationAction[];
  }): Promise<void> {
    if (this.permission !== 'granted') {
      await this.initialize();
    }

    if (this.permission !== 'granted').warn('Cannot send notification: permission denied {
      console');
      return;
    }

    const { title, body, icon, badge, tag, data, actions } = options;

    if (this.registration) {
      // 使用 Service Worker 发送通知（更可靠）
      await this.registration.showNotification(title, {
        body,
        icon: icon || '/icons/notification-icon.png',
        badge: badge || '/icons/badge-icon.png',
        tag,
        data,
        actions,
        vibrate: [200, 100, 200],
        requireInteraction: true
      });
    } else {
      // 后备：直接使用 Notification API
      new Notification(title, {
        body,
        icon,
        badge,
        tag,
        data
      });
    }
  }

  // 定时提醒
  async sendScheduledReminder(time: string, message: string): Promise<void> {
    await this.sendNotification({
      title: '📝 Mirror AI 提醒您',
      body: message,
      tag: 'scheduled-reminder'
    });
  }

  // 智能提醒
  async sendIntelligentReminder(suggestion: string): Promise<void> {
    await this.sendNotification({
      title: '💡 灵感时刻',
      body: suggestion,
      tag: 'intelligent-reminder'
    });
  }

  // 温情提醒
  async sendCaringReminder(days: number): Promise<void> {
    await this.sendNotification({
      title: '💚 我们在想您',
      body: `已经 ${days} 天没有看到您的记录了～`,
      tag: 'caring-reminder'
    });
  }

  // 关闭所有通知
  async closeAll(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(n => n.close());
    }
  }
}

export const notificationService = new NotificationService();
```

### 4.3 Service Worker 实现

```javascript
// public/sw.js

const CACHE_NAME = 'mirror-ai-v1';
const NOTIFICATION_CLICK_HANDLER = 'notification-click';

// 监听安装
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 监听激活
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 监听推送通知
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: data.tag || 'mirror-ai-notification',
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: '打开' },
      { action: 'dismiss', title: '关闭' }
    ],
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 监听通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'open' || !action) {
    // 打开应用
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // 如果已有窗口，则聚焦
        for (const client of clientList) {
          if (client.url.includes('mirror-ai') && 'focus' in client) {
            return client.focus();
          }
        }
        // 否则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (action === 'dismiss') {
    // 关闭通知，不做其他操作
  } else if (action === 'record') {
    // 打开应用并跳转到记录页面
    event.waitUntil(
      clients.openWindow('/?action=record')
    );
  } else if (action === 'snooze') {
    // 稍后提醒 - 15分钟后
    setTimeout(() => {
      self.registration.showNotification(data.title, {
        body: '稍后提醒：' + data.body,
        tag: data.tag
      });
    }, 15 * 60 * 1000);
  }
});
```

### 4.4 提醒调度器

```typescript
// src/services/reminderScheduler.ts

export class ReminderScheduler {
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async initialize(settings: ReminderSettings): Promise<void> {
    await this.notificationService.initialize();
    this.scheduleAll(settings);
  }

  scheduleAll(settings: ReminderSettings): void {
    // 清除所有现有计划
    this.clearAll();

    if (!settings.enabled) return;

    // 定时提醒
    if (settings.scheduled.enabled) {
      settings.scheduled.reminders.forEach(reminder => {
        if (reminder.enabled) {
          this.scheduleReminder(reminder);
        }
      });
    }

    // 智能提醒 - 每小时检查一次
    if (settings.intelligent.enabled) {
      this.scheduleIntelligentCheck(settings.intelligent);
    }

    // 温情提醒 - 每天检查一次
    if (settings.caring.enabled) {
      this.scheduleCaringCheck(settings.caring);
    }
  }

  private scheduleReminder(reminder: ScheduledReminder): void {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const now = new Date();
    let scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // 如果已过今天的时间，则安排明天
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    const jobId = `reminder-${reminder.id}`;
    const timeout = setTimeout(() => {
      // 检查是否是提醒日
      const today = scheduledTime.getDay();
      if (reminder.days.includes(today)) {
        // 检查是否在勿扰时间
        if (!this.isInQuietHours()) {
          this.notificationService.sendScheduledReminder(
            reminder.time,
            reminder.message || '是时候记录今天的想法了～'
          );
        }
      }

      // 重新安排明天
      this.scheduleReminder(reminder);
    }, delay);

    this.scheduledJobs.set(jobId, timeout);
  }

  private scheduleIntelligentCheck(config: { maxPerDay: number; sensitivity: string }): void {
    // 每小时检查一次
    const jobId = 'intelligent-check';
    const timeout = setTimeout(async () => {
      const sentToday = await this.getSentTodayCount();
      if (sentToday >= config.maxPerDay) return;

      // 基于用户习惯判断是否发送
      const shouldRemind = await this.shouldSendIntelligentReminder(config.sensitivity);
      if (shouldRemind) {
        this.notificationService.sendIntelligentReminder(
          '根据您的习惯，现在是记录的好时机～'
        );
      }
    }, 60 * 60 * 1000); // 1小时

    this.scheduledJobs.set(jobId, timeout);
  }

  private scheduleCaringCheck(config: { thresholdDays: number }): void {
    const jobId = 'caring-check';
    const timeout = setTimeout(async () => {
      const daysSinceLastRecord = await this.getDaysSinceLastRecord();
      if (daysSinceLastRecord >= config.thresholdDays) {
        this.notificationService.sendCaringReminder(daysSinceLastRecord);
      }
    }, 6 * 60 * 60 * 1000); // 每6小时检查一次

    this.scheduledJobs.set(jobId, timeout);
  }

  private isInQuietHours(): boolean {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const quietStart = 22 * 60; // 22:00
    const quietEnd = 8 * 60;    // 08:00

    if (quietStart > quietEnd) {
      // 跨天
      return currentTime >= quietStart || currentTime < quietEnd;
    } else {
      return currentTime >= quietStart && currentTime < quietEnd;
    }
  }

  private async getSentTodayCount(): Promise<number> {
    // 从本地存储获取今天发送的提醒数量
    const today = new Date().toDateString();
    const data = localStorage.getItem('reminder_log');
    if (!data) return 0;

    const logs = JSON.parse(data) as ReminderLog[];
    return logs.filter(log =>
      new Date(log.sentAt).toDateString() === today
    ).length;
  }

  private async getDaysSinceLastRecord(): Promise<number> {
    // 从数据库获取最后一条记录的时间
    const lastEntry = await journalService.getLastEntry();
    if (!lastEntry) return 999;

    const diff = Date.now() - new Date(lastEntry.timestamp).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private async shouldSendIntelligentReminder(sensitivity: string): Promise<boolean> {
    // 基于用户习惯的智能判断
    // 可以接入更复杂的逻辑
    const random = Math.random();
    switch (sensitivity) {
      case 'low': return random < 0.2;
      case 'medium': return random < 0.4;
      case 'high': return random < 0.6;
      default: return false;
    }
  }

  clearAll(): void {
    this.scheduledJobs.forEach((timeout) => clearTimeout(timeout));
    this.scheduledJobs.clear();
  }
}

export const reminderScheduler = new ReminderScheduler();
```

### 4.5 提醒设置 UI

```tsx
// src/components/ReminderSettings.tsx

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function ReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    quietHours: { enabled: true, start: '22:00', end: '08:00' },
    scheduled: {
      enabled: true,
      reminders: [
        { id: 'morning', time: '09:00', days: [1, 2, 3, 4, 5], message: '早安！新的一天开始了～', enabled: true },
        { id: 'evening', time: '21:00', days: [1, 2, 3, 4, 5, 6, 0], message: '睡前复盘时间～', enabled: true }
      ]
    },
    intelligent: { enabled: true, maxPerDay: 2, sensitivity: 'medium' },
    caring: { enabled: true, thresholdDays: 3, message: '我们在想您～' }
  });

  const requestPermission = async () => {
    const granted = await notificationService.initialize();
    if (granted) {
      toast({ title: '已开启推送通知' });
    } else {
      toast({ title: '请在浏览器设置中开启通知权限', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">🔔 提醒设置</h1>

      {/* 推送通知权限 */}
      <Card>
        <CardHeader>
          <CardTitle>推送通知</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={requestPermission} variant="outline">
            开启推送通知
          </Button>
        </CardContent>
      </Card>

      {/* 基础设置 */}
      <Card>
        <CardHeader>
          <CardTitle>基础设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>启用提醒</Label>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(v) => setSettings({ ...settings, enabled: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>勿扰模式</Label>
            <Switch
              checked={settings.quietHours.enabled}
              onCheckedChange={(v) => setSettings({
                ...settings,
                quietHours: { ...settings.quietHours, enabled: v }
              })}
            />
          </div>

          {settings.quietHours.enabled && (
            <div className="flex items-center gap-4">
              <div>
                <Label>开始时间</Label>
                <Input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => setSettings({
                    ...settings,
                    quietHours: { ...settings.quietHours, start: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>结束时间</Label>
                <Input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => setSettings({
                    ...settings,
                    quietHours: { ...settings.quietHours, end: e.target.value }
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 定时提醒 */}
      <Card>
        <CardHeader>
          <CardTitle>定时提醒</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>启用定时提醒</Label>
            <Switch
              checked={settings.scheduled.enabled}
              onCheckedChange={(v) => setSettings({
                ...settings,
                scheduled: { ...settings.scheduled, enabled: v }
              })}
            />
          </div>

          {settings.scheduled.enabled && settings.scheduled.reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-4 p-4 border rounded">
              <Input
                type="time"
                value={reminder.time}
                onChange={(e) => {
                  const updated = settings.scheduled.reminders.map(r =>
                    r.id === reminder.id ? { ...r, time: e.target.value } : r
                  );
                  setSettings({
                    ...settings,
                    scheduled: { ...settings.scheduled, reminders: updated }
                  });
                }}
              />
              <Switch
                checked={reminder.enabled}
                onCheckedChange={(v) => {
                  const updated = settings.scheduled.reminders.map(r =>
                    r.id === reminder.id ? { ...r, enabled: v } : r
                  );
                  setSettings({
                    ...settings,
                    scheduled: { ...settings.scheduled, reminders: updated }
                  });
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 智能提醒 */}
      <Card>
        <CardHeader>
          <CardTitle>智能提醒</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>启用智能提醒</Label>
            <Switch
              checked={settings.intelligent.enabled}
              onCheckedChange={(v) => setSettings({
                ...settings,
                intelligent: { ...settings.intelligent, enabled: v }
              })}
            />
          </div>

          {settings.intelligent.enabled && (
            <>
              <div>
                <Label>每日最多提醒次数</Label>
                <Select
                  value={settings.intelligent.maxPerDay.toString()}
                  onValueChange={(v) => setSettings({
                    ...settings,
                    intelligent: { ...settings.intelligent, maxPerDay: parseInt(v) }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1次</SelectItem>
                    <SelectItem value="2">2次</SelectItem>
                    <SelectItem value="3">3次</SelectItem>
                    <SelectItem value="5">5次</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>提醒灵敏度</Label>
                <Select
                  value={settings.intelligent.sensitivity}
                  onValueChange={(v: 'low' | 'medium' | 'high') => setSettings({
                    ...settings,
                    intelligent: { ...settings.intelligent, sensitivity: v }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低（较少打扰）</SelectItem>
                    <SelectItem value="medium">中（平衡）</SelectItem>
                    <SelectItem value="high">高（更主动）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 温情提醒 */}
      <Card>
        <CardHeader>
          <CardTitle>温情提醒</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>启用温情提醒</Label>
            <Switch
              checked={settings.caring.enabled}
              onCheckedChange={(v) => setSettings({
                ...settings,
                caring: { ...settings.caring, enabled: v }
              })}
            />
          </div>

          {settings.caring.enabled && (
            <div>
              <Label>多少天未记录后提醒</Label>
              <Select
                value={settings.caring.thresholdDays.toString()}
                onValueChange={(v) => setSettings({
                  ...settings,
                  caring: { ...settings.caring, thresholdDays: parseInt(v) }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2天</SelectItem>
                  <SelectItem value="3">3天</SelectItem>
                  <SelectItem value="5">5天</SelectItem>
                  <SelectItem value="7">7天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        保存设置
      </Button>
    </div>
  );
}
```

---

## 五、技术栈总结

| 功能 | 技术实现 |
|------|----------|
| 心理分析 | 分层提示词 + OpenAI API |
| 隐私保护 | Web Crypto API (AES-GCM) |
| 免责声明 | React Dialog 组件 |
| 推送通知 | Service Worker + Web Push API |
| 定时任务 | setTimeout + localStorage |

---

*文档更新时间：2026-02-14*
