import { supabase } from '@/integrations/supabase/client';
import { llmService, Message as LLMMessage } from './llmService';
import { planningService } from './planningService';
import { selfAwarenessService } from './selfAwarenessService';
import { lifeManagementService } from './lifeManagementService';

// 对话历史类型定义
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// 消息类型定义
export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  created_at: string;
}

// 语音命令类型定义
export interface VoiceCommand {
  id: string;
  user_id: string;
  command: string;
  intent: string;
  parameters: Record<string, any>;
  timestamp: string;
  created_at: string;
}

// 情境信息类型定义
export interface ContextInfo {
  time: string;
  date: string;
  location?: string;
  activity?: string;
  mood?: string;
  recent_interactions: string[];
  upcoming_tasks: string[];
}

// 智能助手服务
export const assistantService = {
  // 对话管理
  async createConversation(title: string): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: title,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 自然语言处理
  async processMessage(conversationId: string, content: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 保存用户消息
    const userMessage = await this.saveMessage(conversationId, 'user', content);

    // 获取对话历史
    const messages = await this.getMessages(conversationId);
    const conversationHistory = messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');

    // 获取情境信息
    const context = await this.getContextInfo();

    // 生成助手回复
    const assistantResponse = await this.generateAssistantResponse(content, conversationHistory, context);

    // 保存助手消息
    const assistantMessage = await this.saveMessage(conversationId, 'assistant', assistantResponse);

    // 更新对话时间
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return assistantMessage;
  },

  // 保存消息
  private async saveMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: role,
        content: content,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取情境信息
  private async getContextInfo(): Promise<ContextInfo> {
    const now = new Date();
    const context: ContextInfo = {
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      recent_interactions: [],
      upcoming_tasks: [],
    };

    try {
      // 获取近期任务
      const dailyTasks = await planningService.getDailyTasks();
      context.upcoming_tasks = dailyTasks.slice(0, 3).map(task => task.title);
    } catch (error) {
      console.error('Error getting upcoming tasks:', error);
    }

    return context;
  },

  // 生成助手回复
  private async generateAssistantResponse(message: string, history: string, context: ContextInfo): Promise<string> {
    // 构建LLM消息
    const llmMessages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是Mirror-AI的智能助手，一个温暖、专业的心理陪伴助手。你的职责是：
1. 提供友好、有同理心的回应
2. 帮助用户管理任务、目标和生活平衡
3. 支持用户的自我认知和个人成长
4. 基于用户的历史对话和情境信息提供个性化建议
5. 保持对话的连贯性和上下文理解

当前情境信息：
- 时间：${context.time}
- 日期：${context.date}
- 位置：${context.location || '未知'}
- 活动：${context.activity || '未知'}
- 心情：${context.mood || '未知'}
- 近期任务：${context.upcoming_tasks.join(', ') || '无'}
- 近期互动：${context.recent_interactions.join(', ') || '无'}
`
      },
      {
        role: 'user',
        content: `对话历史：
${history}

用户最新消息：
${message}`
      }
    ];

    try {
      // 使用LLM生成回复
      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.7,
        max_tokens: 1000
      });

      return response;
    } catch (error) {
      console.error('Error generating assistant response:', error);
      //  fallback to basic response
      return this.generateFallbackResponse(message, context);
    }
  },

  // 生成后备回复
  private generateFallbackResponse(message: string, context: ContextInfo): string {
    const time = new Date().getHours();
    let greeting = '';

    if (time < 12) {
      greeting = '早上好！';
    } else if (time < 18) {
      greeting = '下午好！';
    } else {
      greeting = '晚上好！';
    }

    return `${greeting} 我是Mirror-AI的智能助手。${context.upcoming_tasks.length > 0 ? '你今天有任务需要完成。' : ''} 有什么我可以帮助你的吗？`;
  },



  // 语音命令处理
  async processVoiceCommand(audioData: Blob): Promise<VoiceCommand> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 这里应该集成语音识别服务，例如Web Speech API或第三方服务
    // 为了演示，我们模拟一个语音识别结果
    const command = '查看我的今日任务';
    const intent = 'task_inquiry';
    const parameters = {};

    // 保存语音命令
    const { data, error } = await supabase
      .from('voice_commands')
      .insert({
        user_id: user.id,
        command: command,
        intent: intent,
        parameters: parameters,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // 执行语音命令
  async executeVoiceCommand(command: VoiceCommand): Promise<string> {
    // 构建LLM消息
    const llmMessages: LLMMessage[] = [
      {
        role: 'system',
        content: '你是Mirror-AI的智能助手，专门处理语音命令。请根据用户的语音命令提供简洁、准确的回应。'
      },
      {
        role: 'user',
        content: `语音命令：${command.command}\n意图：${command.intent}\n参数：${JSON.stringify(command.parameters)}`
      }
    ];

    try {
      // 使用LLM处理语音命令
      const response = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.6,
        max_tokens: 500
      });

      return response;
    } catch (error) {
      console.error('Error executing voice command:', error);
      return `我理解你的命令：${command.command}。我会帮你处理这个请求。`;
    }
  },

  // 生成个性化建议
  async generatePersonalizedSuggestions(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // 获取用户数据
      const lifeBalance = await lifeManagementService.getLifeBalanceOverview();
      const goals = await planningService.getGoals();
      const selfAwarenessReport = await selfAwarenessService.generateSelfAwarenessReport('month');

      // 构建LLM消息
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: '你是Mirror-AI的智能助手，专门为用户生成个性化建议。请基于用户的个人数据，生成具体、可执行的建议，帮助用户改善生活质量，实现目标。'
        },
        {
          role: 'user',
          content: `基于用户的以下数据，生成5条个性化建议：

生活平衡得分：
整体：${lifeBalance.overall}/100
健康：${lifeBalance.health}/100
财务：${lifeBalance.finance}/100
学习：${lifeBalance.learning}/100
工作：${lifeBalance.work}/100

当前目标：
${goals.map(g => `- ${g.title} (${g.status})`).join('\n')}

自我认知洞察：
${selfAwarenessReport.overall_insights}

请生成具体、可执行的建议，帮助用户改善生活质量，实现目标。
每条建议应该简洁明了，直接针对用户的具体情况。
请以列表形式返回，每条建议占一行。`
        }
      ];

      // 使用LLM生成建议
      const suggestions = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.7,
        max_tokens: 1000
      });

      return suggestions.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, ''));
    } catch (error) {
      console.error('Error generating personalized suggestions:', error);
      return [
        '保持规律的作息时间，确保充足的睡眠',
        '定期回顾和更新你的目标，确保它们与你的价值观一致',
        '尝试新的学习领域，拓展你的知识边界',
        '保持工作与生活的平衡，避免过度劳累',
        '定期反思你的行为模式，寻找改进的空间',
      ];
    }
  },

  // 获取情境感知建议
  async getContextualSuggestions(context: Partial<ContextInfo>): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // 构建LLM消息
      const llmMessages: LLMMessage[] = [
        {
          role: 'system',
          content: '你是Mirror-AI的智能助手，专门根据用户的当前情境提供相关建议。请基于给定的情境信息，生成具体、实用的建议，帮助用户更好地管理时间、情绪或任务。'
        },
        {
          role: 'user',
          content: `基于以下情境信息，生成3条相关的建议：

时间：${context.time || new Date().toLocaleTimeString()}
日期：${context.date || new Date().toLocaleDateString()}
位置：${context.location || '未知'}
活动：${context.activity || '未知'}
心情：${context.mood || '未知'}
近期互动：${context.recent_interactions?.join(', ') || '无'}
即将到来的任务：${context.upcoming_tasks?.join(', ') || '无'}

建议应该与当前情境相关，帮助用户更好地管理时间、情绪或任务。
请以列表形式返回，每条建议占一行。`
        }
      ];

      // 使用LLM生成建议
      const suggestions = await llmService.callModel(llmMessages, 'gpt-4o', {
        temperature: 0.7,
        max_tokens: 500
      });

      return suggestions.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, ''));
    } catch (error) {
      console.error('Error generating contextual suggestions:', error);
      return [
        '记得保持水分，多喝水',
        '定期休息，避免长时间连续工作',
        '保持积极的心态，享受当下',
      ];
    }
  },
};