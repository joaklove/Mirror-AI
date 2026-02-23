import { supabase } from '@/integrations/supabase/client';
import { llmService, Message as LLMMessage } from './llmService';
import { nlpService, DialogueContext, NLPResult } from './nlpService';

// 对话状态类型定义
export type DialogueState = 
  | 'initiated'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived';

// 对话主题类型定义
export interface DialogueTopic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  confidence: number;
}

// 对话实体类型定义
export interface Dialogue {
  id: string;
  user_id: string;
  title: string;
  state: DialogueState;
  current_topic: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
  metadata: Record<string, any>;
}

// 对话消息类型定义
export interface DialogueMessage {
  id: string;
  dialogue_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  nlp_result?: NLPResult;
  metadata: Record<string, any>;
}

// 对话服务
export const dialogueService = {
  // 创建对话
  async createDialogue(title: string): Promise<Dialogue> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('dialogues')
      .insert({
        user_id: user.id,
        title: title,
        state: 'initiated',
        current_topic: '未指定',
        last_message_at: new Date().toISOString(),
        message_count: 0,
        metadata: {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取对话列表
  async getDialogues(page: number = 1, limit: number = 20): Promise<{ dialogues: Dialogue[]; total: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error, count } = await supabase
      .from('dialogues')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return { dialogues: data || [], total: count || 0 };
  },

  // 获取对话详情
  async getDialogue(id: string): Promise<Dialogue> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('dialogues')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // 获取对话消息
  async getDialogueMessages(dialogueId: string, limit: number = 50): Promise<DialogueMessage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('dialogue_messages')
      .select('*')
      .eq('dialogue_id', dialogueId)
      .eq('user_id', user.id)
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // 发送消息
  async sendMessage(dialogueId: string, content: string): Promise<{
    userMessage: DialogueMessage;
    assistantMessage: DialogueMessage;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取对话历史
    const messages = await this.getDialogueMessages(dialogueId);
    
    // 构建对话上下文
    const context: DialogueContext = {
      history: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      currentTopic: '未指定',
      userPreferences: {},
      systemState: {},
    };

    // 处理用户消息
    const nlpResult = await nlpService.processInput(content, context);

    // 保存用户消息
    const userMessage = await this.saveMessage(dialogueId, 'user', content, nlpResult);

    // 生成助手回复
    const assistantResponse = await this.generateAssistantResponse(dialogueId, content, context, nlpResult);

    // 保存助手消息
    const assistantMessage = await this.saveMessage(dialogueId, 'assistant', assistantResponse);

    // 更新对话状态
    await this.updateDialogueState(dialogueId, 'active', nlpResult.summary);

    return {
      userMessage,
      assistantMessage,
    };
  },

  // 保存消息
  private async saveMessage(
    dialogueId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    nlpResult?: NLPResult
  ): Promise<DialogueMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('dialogue_messages')
      .insert({
        dialogue_id: dialogueId,
        user_id: user.id,
        role: role,
        content: content,
        timestamp: new Date().toISOString(),
        nlp_result: nlpResult,
        metadata: {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 生成助手回复
  private async generateAssistantResponse(
    dialogueId: string,
    userMessage: string,
    context: DialogueContext,
    nlpResult: NLPResult
  ): Promise<string> {
    try {
      // 构建LLM消息
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的对话助手，负责与用户进行自然、流畅的多轮对话。请基于对话历史、当前上下文和用户的最新消息，生成一个相关、有帮助的回复。

对话上下文：
- 当前话题：${context.currentTopic}
- 用户意图：${nlpResult.intent.type} (置信度: ${nlpResult.intent.confidence})
- 情感分析：${nlpResult.sentiment.label} (分数: ${nlpResult.sentiment.score})
- 消息复杂度：${nlpResult.complexity.level} (分数: ${nlpResult.complexity.score})

请确保你的回复：
1. 与对话历史保持连贯
2. 针对用户的意图和情感
3. 自然、友好、专业
4. 避免重复之前的内容
5. 适当追问以获取更多信息（如果需要）
6. 提供具体、实用的建议`
        },
        ...context.history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response;
    } catch (error) {
      console.error('Error generating assistant response:', error);
      return '抱歉，我暂时无法生成回复。请稍后再试。';
    }
  },

  // 更新对话状态
  async updateDialogueState(dialogueId: string, state: DialogueState, currentTopic?: string): Promise<Dialogue> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updates: Partial<Dialogue> = {
      state: state,
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };

    if (currentTopic) {
      updates.current_topic = currentTopic;
    }

    // 更新消息计数
    const messages = await this.getDialogueMessages(dialogueId);
    updates.message_count = messages.length;

    const { data, error } = await supabase
      .from('dialogues')
      .update(updates)
      .eq('id', dialogueId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 分析对话
  async analyzeDialogue(dialogueId: string): Promise<{
    topics: DialogueTopic[];
    sentimentTrend: Array<{ timestamp: string; score: number }>;
    complexityTrend: Array<{ timestamp: string; score: number }>;
    messageStats: {
      total: number;
      user: number;
      assistant: number;
      averageResponseTime: number;
    };
    summary: string;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取对话消息
    const messages = await this.getDialogueMessages(dialogueId);

    try {
      // 构建LLM消息
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的对话分析助手，负责分析对话内容并生成详细的分析报告。请基于提供的对话消息，分析对话主题、情感趋势、复杂度趋势、消息统计和生成对话摘要。

请返回格式：
{
  "topics": [
    {
      "id": "<id>",
      "name": "<topic_name>",
      "description": "<topic_description>",
      "keywords": ["<keyword1>", "<keyword2>"],
      "confidence": <confidence_score>
    }
  ],
  "sentimentTrend": [
    {
      "timestamp": "<timestamp>",
      "score": <sentiment_score>
    }
  ],
  "complexityTrend": [
    {
      "timestamp": "<timestamp>",
      "score": <complexity_score>
    }
  ],
  "messageStats": {
    "total": <total_messages>,
    "user": <user_messages>,
    "assistant": <assistant_messages>,
    "averageResponseTime": <average_response_time_in_seconds>
  },
  "summary": "<dialogue_summary>"
}`
        },
        {
          role: 'user',
          content: `对话消息：
${messages.map(msg => `${msg.timestamp} [${msg.role}]: ${msg.content}`).join('\n')}`
        },
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.6,
        max_tokens: 2000,
      });

      const analysis = JSON.parse(response);
      return analysis;
    } catch (error) {
      console.error('Error analyzing dialogue:', error);
      // 返回默认分析
      return {
        topics: [],
        sentimentTrend: [],
        complexityTrend: [],
        messageStats: {
          total: messages.length,
          user: messages.filter(msg => msg.role === 'user').length,
          assistant: messages.filter(msg => msg.role === 'assistant').length,
          averageResponseTime: 0,
        },
        summary: '对话分析失败',
      };
    }
  },

  // 生成对话摘要
  async generateDialogueSummary(dialogueId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取对话消息
    const messages = await this.getDialogueMessages(dialogueId);

    try {
      // 构建LLM消息
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的对话摘要助手，负责生成对话的简洁摘要。请基于提供的对话消息，生成一个全面、准确的摘要，包括主要话题、关键信息和结论。

请确保摘要：
1. 简洁明了（不超过200字）
2. 涵盖对话的主要内容
3. 突出重要信息
4. 使用自然、流畅的语言`
        },
        {
          role: 'user',
          content: `对话消息：
${messages.map(msg => `${msg.timestamp} [${msg.role}]: ${msg.content}`).join('\n')}`
        },
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.6,
        max_tokens: 300,
      });

      return response;
    } catch (error) {
      console.error('Error generating dialogue summary:', error);
      return '无法生成对话摘要';
    }
  },

  // 检测对话话题
  async detectDialogueTopic(dialogueId: string): Promise<DialogueTopic> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 获取最近的对话消息
    const messages = await this.getDialogueMessages(dialogueId, 20);
    const recentMessages = messages.slice(-10);

    try {
      // 构建LLM消息
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: `你是Mirror-AI的话题检测助手，负责检测对话的当前话题。请基于最近的对话消息，识别当前的主要话题，包括话题名称、描述、关键词和置信度。

请返回格式：
{
  "id": "<id>",
  "name": "<topic_name>",
  "description": "<topic_description>",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
  "confidence": <confidence_score>
}`
        },
        {
          role: 'user',
          content: `最近的对话消息：
${recentMessages.map(msg => `${msg.timestamp} [${msg.role}]: ${msg.content}`).join('\n')}`
        },
      ];

      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.6,
        max_tokens: 500,
      });

      const topic = JSON.parse(response);
      return topic;
    } catch (error) {
      console.error('Error detecting dialogue topic:', error);
      // 返回默认话题
      return {
        id: 'default',
        name: '未指定',
        description: '无法检测话题',
        keywords: [],
        confidence: 0.5,
      };
    }
  },

  // 管理对话上下文
  async manageDialogueContext(
    dialogueId: string,
    newMessage: {
      role: 'user' | 'assistant';
      content: string;
    }
  ): Promise<DialogueContext> {
    // 获取对话历史
    const messages = await this.getDialogueMessages(dialogueId);

    // 构建当前上下文
    const currentContext: DialogueContext = {
      history: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      currentTopic: '未指定',
      userPreferences: {},
      systemState: {},
    };

    // 更新上下文
    const updatedContext = await nlpService.manageContext(currentContext, newMessage);

    // 检测并更新话题
    const topic = await this.detectDialogueTopic(dialogueId);
    updatedContext.currentTopic = topic.name;

    return updatedContext;
  },

  // 结束对话
  async endDialogue(dialogueId: string): Promise<Dialogue> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 生成对话摘要
    const summary = await this.generateDialogueSummary(dialogueId);

    // 更新对话状态
    const dialogue = await this.updateDialogueState(dialogueId, 'completed', summary);

    return dialogue;
  },

  // 归档对话
  async archiveDialogue(dialogueId: string): Promise<Dialogue> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 更新对话状态
    const dialogue = await this.updateDialogueState(dialogueId, 'archived');

    return dialogue;
  },

  // 恢复对话
  async resumeDialogue(dialogueId: string): Promise<Dialogue> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 更新对话状态
    const dialogue = await this.updateDialogueState(dialogueId, 'active');

    return dialogue;
  },

  // 删除对话
  async deleteDialogue(dialogueId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 删除对话消息
    await supabase
      .from('dialogue_messages')
      .delete()
      .eq('dialogue_id', dialogueId)
      .eq('user_id', user.id);

    // 删除对话
    const { error } = await supabase
      .from('dialogues')
      .delete()
      .eq('id', dialogueId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // 批量操作对话
  async batchUpdateDialogues(
    dialogueIds: string[],
    operation: 'archive' | 'delete' | 'resume'
  ): Promise<void> {
    for (const dialogueId of dialogueIds) {
      switch (operation) {
        case 'archive':
          await this.archiveDialogue(dialogueId);
          break;
        case 'delete':
          await this.deleteDialogue(dialogueId);
          break;
        case 'resume':
          await this.resumeDialogue(dialogueId);
          break;
      }
    }
  },
};
