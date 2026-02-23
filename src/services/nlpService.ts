import { llmService, Message as LLMMessage } from './llmService';

// 意图类型定义
export type IntentType = 
  | 'greeting'
  | 'task_management'
  | 'goal_setting'
  | 'self_awareness'
  | 'life_balance'
  | 'knowledge_management'
  | 'recommendation'
  | 'planning'
  | 'question'
  | 'command'
  | 'feedback'
  | 'unknown';

// 实体类型定义
export interface Entity {
  type: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
}

// 指令类型定义
export interface Command {
  type: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number;
}

// 自然语言处理结果类型定义
export interface NLPResult {
  intent: {
    type: IntentType;
    confidence: number;
  };
  entities: Entity[];
  commands: Command[];
  sentiment: {
    score: number; // -1 to 1
    label: 'negative' | 'neutral' | 'positive';
  };
  complexity: {
    level: 'low' | 'medium' | 'high';
    score: number; // 0 to 100
  };
  dependencies: string[];
  summary: string;
}

// 对话上下文类型定义
export interface DialogueContext {
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  currentTopic: string;
  userPreferences: Record<string, any>;
  systemState: Record<string, any>;
}

// 自然语言处理服务
export const nlpService = {
  // 处理自然语言输入
  async processInput(text: string, context?: DialogueContext): Promise<NLPResult> {
    try {
      // 构建LLM消息
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的自然语言处理助手，负责分析用户的自然语言输入，识别意图、提取实体、解析指令、分析情感和复杂度。

请对用户输入进行全面分析，并返回以下格式的JSON结果：
{
  "intent": {
    "type": "<intent_type>",
    "confidence": <confidence_score>
  },
  "entities": [
    {
      "type": "<entity_type>",
      "value": "<entity_value>",
      "confidence": <confidence_score>,
      "start": <start_position>,
      "end": <end_position>
    }
  ],
  "commands": [
    {
      "type": "<command_type>",
      "action": "<action>",
      "parameters": {"<parameter_name>": "<parameter_value>"},
      "confidence": <confidence_score>
    }
  ],
  "sentiment": {
    "score": <sentiment_score>,
    "label": "<sentiment_label>"
  },
  "complexity": {
    "level": "<complexity_level>",
    "score": <complexity_score>
  },
  "dependencies": ["<dependency_1>", "<dependency_2>"],
  "summary": "<summary>"
}

意图类型包括：greeting, task_management, goal_setting, self_awareness, life_balance, knowledge_management, recommendation, planning, question, command, feedback, unknown

情感标签包括：negative, neutral, positive

复杂度级别包括：low, medium, high

请确保返回格式正确的JSON，不要包含任何其他文本。`
        },
        {
          role: 'user',
          content: `用户输入：${text}

对话上下文：${context ? JSON.stringify(context, null, 2) : '无'}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 1000
      });

      // 解析结果
      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error processing NLP input:', error);
      // 返回默认结果
      return {
        intent: {
          type: 'unknown',
          confidence: 0.5
        },
        entities: [],
        commands: [],
        sentiment: {
          score: 0,
          label: 'neutral'
        },
        complexity: {
          level: 'medium',
          score: 50
        },
        dependencies: [],
        summary: text
      };
    }
  },

  // 识别意图
  async identifyIntent(text: string, context?: DialogueContext): Promise<{
    type: IntentType;
    confidence: number;
  }> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的意图识别助手，负责识别用户输入的意图。请从以下意图类型中选择最匹配的一个，并返回意图类型和置信度。

意图类型：
- greeting: 问候或打招呼
- task_management: 任务管理相关
- goal_setting: 目标设置相关
- self_awareness: 自我认知相关
- life_balance: 生活平衡相关
- knowledge_management: 知识管理相关
- recommendation: 推荐相关
- planning: 规划相关
- question: 一般性问题
- command: 命令或指令
- feedback: 反馈或评价
- unknown: 未知意图

请返回格式：
{
  "type": "<intent_type>",
  "confidence": <confidence_score>
}`
        },
        {
          role: 'user',
          content: `用户输入：${text}

对话上下文：${context ? JSON.stringify(context, null, 2) : '无'}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 200
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error identifying intent:', error);
      return {
        type: 'unknown',
        confidence: 0.5
      };
    }
  },

  // 提取实体
  async extractEntities(text: string): Promise<Entity[]> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的实体提取助手，负责从用户输入中提取实体。请识别并返回所有相关实体，包括实体类型、值、置信度和在文本中的位置。

常见实体类型：
- person: 人物
- location: 地点
- date: 日期
- time: 时间
- duration: 持续时间
- task: 任务
- goal: 目标
- emotion: 情绪
- number: 数字
- percentage: 百分比
- priority: 优先级
- category: 分类
- tag: 标签

请返回格式：
[
  {
    "type": "<entity_type>",
    "value": "<entity_value>",
    "confidence": <confidence_score>,
    "start": <start_position>,
    "end": <end_position>
  }
]`
        },
        {
          role: 'user',
          content: `用户输入：${text}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error extracting entities:', error);
      return [];
    }
  },

  // 解析指令
  async parseCommands(text: string): Promise<Command[]> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的指令解析助手，负责从用户输入中解析指令。请识别并返回所有相关指令，包括指令类型、动作、参数和置信度。

请返回格式：
[
  {
    "type": "<command_type>",
    "action": "<action>",
    "parameters": {"<parameter_name>": "<parameter_value>"},
    "confidence": <confidence_score>
  }
]`
        },
        {
          role: 'user',
          content: `用户输入：${text}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error parsing commands:', error);
      return [];
    }
  },

  // 分析情感
  async analyzeSentiment(text: string): Promise<{
    score: number;
    label: 'negative' | 'neutral' | 'positive';
  }> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的情感分析助手，负责分析用户输入的情感。请返回情感分数（-1到1）和情感标签（negative、neutral、positive）。

请返回格式：
{
  "score": <sentiment_score>,
  "label": "<sentiment_label>"
}`
        },
        {
          role: 'user',
          content: `用户输入：${text}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 200
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        score: 0,
        label: 'neutral'
      };
    }
  },

  // 分析复杂度
  async analyzeComplexity(text: string): Promise<{
    level: 'low' | 'medium' | 'high';
    score: number;
  }> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的复杂度分析助手，负责分析用户输入的复杂度。请返回复杂度级别（low、medium、high）和复杂度分数（0到100）。

复杂度评估因素：
- 句子长度和数量
- 词汇难度
- 语法复杂度
- 概念抽象程度
- 指令数量和复杂度
- 上下文依赖程度

请返回格式：
{
  "level": "<complexity_level>",
  "score": <complexity_score>
}`
        },
        {
          role: 'user',
          content: `用户输入：${text}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 200
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      return {
        level: 'medium',
        score: 50
      };
    }
  },

  // 解析复杂指令
  async parseComplexCommand(text: string, context?: DialogueContext): Promise<{
    steps: Array<{
      action: string;
      parameters: Record<string, any>;
      dependencies: string[];
    }>;
    executionPlan: string;
    estimatedTime: number;
  }> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的复杂指令解析助手，负责将复杂的自然语言指令分解为可执行的步骤。请分析用户输入，生成执行步骤、执行计划和估计执行时间。

请返回格式：
{
  "steps": [
    {
      "action": "<action>",
      "parameters": {"<parameter_name>": "<parameter_value>"},
      "dependencies": ["<dependency_1>", "<dependency_2>"]
    }
  ],
  "executionPlan": "<execution_plan>",
  "estimatedTime": <estimated_time_in_seconds>
}`
        },
        {
          role: 'user',
          content: `用户输入：${text}

对话上下文：${context ? JSON.stringify(context, null, 2) : '无'}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 1000
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error parsing complex command:', error);
      return {
        steps: [],
        executionPlan: '无法解析复杂指令',
        estimatedTime: 0
      };
    }
  },

  // 生成响应计划
  async generateResponsePlan(
    nlpResult: NLPResult,
    context: DialogueContext
  ): Promise<{
    responseType: string;
    requiredActions: string[];
    expectedResources: string[];
    fallbackPlan: string;
  }> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的响应计划生成助手，负责根据NLP分析结果和对话上下文生成响应计划。请返回响应类型、所需操作、预期资源和后备计划。

请返回格式：
{
  "responseType": "<response_type>",
  "requiredActions": ["<action_1>", "<action_2>"],
  "expectedResources": ["<resource_1>", "<resource_2>"],
  "fallbackPlan": "<fallback_plan>"
}`
        },
        {
          role: 'user',
          content: `NLP分析结果：${JSON.stringify(nlpResult, null, 2)}

对话上下文：${JSON.stringify(context, null, 2)}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error generating response plan:', error);
      return {
        responseType: 'default',
        requiredActions: [],
        expectedResources: [],
        fallbackPlan: '使用默认响应'
      };
    }
  },

  // 上下文管理
  async manageContext(
    currentContext: DialogueContext,
    newMessage: {
      role: 'user' | 'assistant';
      content: string;
    }
  ): Promise<DialogueContext> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的上下文管理助手，负责更新对话上下文。请根据当前上下文和新消息，更新对话历史、当前话题和系统状态。

请返回更新后的上下文：
{
  "history": [
    {
      "role": "<role>",
      "content": "<content>",
      "timestamp": "<timestamp>"
    }
  ],
  "currentTopic": "<current_topic>",
  "userPreferences": {"<preference_name>": "<preference_value>"},
  "systemState": {"<state_name>": "<state_value>"}
}`
        },
        {
          role: 'user',
          content: `当前上下文：${JSON.stringify(currentContext, null, 2)}

新消息：${JSON.stringify(newMessage, null, 2)}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 1000
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error managing context:', error);
      // 更新对话历史
      return {
        ...currentContext,
        history: [
          ...currentContext.history,
          {
            ...newMessage,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }
  },

  // 多语言支持
  async detectLanguage(text: string): Promise<{
    language: string;
    confidence: number;
  }> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的语言检测助手，负责检测用户输入的语言。请返回语言代码（如zh、en、ja等）和置信度。

请返回格式：
{
  "language": "<language_code>",
  "confidence": <confidence_score>
}`
        },
        {
          role: 'user',
          content: `用户输入：${text}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 200
      });

      const result = JSON.parse(response);
      return result;
    } catch (error) {
      console.error('Error detecting language:', error);
      return {
        language: 'zh',
        confidence: 0.5
      };
    }
  },

  // 文本规范化
  async normalizeText(text: string): Promise<string> {
    try {
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的文本规范化助手，负责将用户输入的文本规范化，包括纠正拼写错误、语法错误和标点符号错误，同时保持原意不变。

请返回规范化后的文本。`
        },
        {
          role: 'user',
          content: `用户输入：${text}`
        }
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.3,
        max_tokens: 500
      });

      return response;
    } catch (error) {
      console.error('Error normalizing text:', error);
      return text;
    }
  },
};
