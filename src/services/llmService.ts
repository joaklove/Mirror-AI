import { settingsService } from './journalService';

// 模型类型定义
export type ModelType = 'gpt-4' | 'gpt-4o' | 'claude-3-opus' | 'claude-3-sonnet' | 'gemini-pro' | 'deepseek-chat';

// 消息类型定义
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_calls?: {
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }[];
  tool_call_id?: string;
}

// 模型配置接口
export interface ModelConfig {
  model: ModelType;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

// LLM服务
export const llmService = {
  // 默认模型配置
  defaultConfig: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
  } as Partial<ModelConfig>,

  // 模型提供商映射
  modelProviders: {
    'gpt-4': 'openai',
    'gpt-4o': 'openai',
    'claude-3-opus': 'anthropic',
    'claude-3-sonnet': 'anthropic',
    'gemini-pro': 'google',
    'deepseek-chat': 'deepseek',
  } as Record<ModelType, string>,

  // 获取模型API端点
  getModelEndpoint(model: ModelType): string {
    const provider = this.modelProviders[model];
    
    // 根据提供商返回相应的API端点
    switch (provider) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages';
      case 'google':
        return 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
      case 'deepseek':
      default:
        return 'https://openrouter.ai/api/v1/chat/completions';
    }
  },

  // 获取模型API密钥
  async getModelApiKey(model: ModelType): Promise<string> {
    const settings = await settingsService.getSettings();
    const provider = this.modelProviders[model];
    
    // 根据提供商返回相应的API密钥
    switch (provider) {
      case 'openai':
        return settings?.openaiApiKey || settings?.apiKey || '';
      case 'anthropic':
        return settings?.anthropicApiKey || settings?.apiKey || '';
      case 'google':
        return settings?.googleApiKey || settings?.apiKey || '';
      default:
        return settings?.apiKey || '';
    }
  },

  // 调用大语言模型
  async callModel(
    messages: Message[],
    model: ModelType = 'gpt-4o',
    config: Partial<ModelConfig> = {}
  ): Promise<string> {
    try {
      const mergedConfig = {
        ...this.defaultConfig,
        ...config,
        model,
      };

      const endpoint = this.getModelEndpoint(model);
      const apiKey = await this.getModelApiKey(model);
      
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      // 根据模型提供商构建请求
      let response;
      if (model.startsWith('claude-')) {
        // Claude API格式
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: model,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            max_tokens: mergedConfig.max_tokens,
            temperature: mergedConfig.temperature,
          }),
        });

        const data = await response.json();
        return data.content?.[0]?.text || '';
      } else if (model === 'gemini-pro') {
        // Gemini API格式
        response = await fetch(`${endpoint}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }],
            })),
            generationConfig: {
              temperature: mergedConfig.temperature,
              maxOutputTokens: mergedConfig.max_tokens,
            },
          }),
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // OpenAI兼容格式
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: mergedConfig.model,
            messages: messages,
            temperature: mergedConfig.temperature,
            max_tokens: mergedConfig.max_tokens,
            top_p: mergedConfig.top_p,
            frequency_penalty: mergedConfig.frequency_penalty,
            presence_penalty: mergedConfig.presence_penalty,
          }),
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Error calling LLM:', error);
      throw error;
    }
  },

  // 流式调用大语言模型
  async *streamModel(
    messages: Message[],
    model: ModelType = 'gpt-4o',
    config: Partial<ModelConfig> = {}
  ): AsyncGenerator<string> {
    try {
      const mergedConfig = {
        ...this.defaultConfig,
        ...config,
        model,
      };

      const endpoint = this.getModelEndpoint(model);
      const apiKey = await this.getModelApiKey(model);
      
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      // 只支持OpenAI兼容格式的流式调用
      if (!model.startsWith('gpt-') && !model.includes('deepseek')) {
        throw new Error('Streaming not supported for this model');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: mergedConfig.model,
          messages: messages,
          temperature: mergedConfig.temperature,
          max_tokens: mergedConfig.max_tokens,
          top_p: mergedConfig.top_p,
          frequency_penalty: mergedConfig.frequency_penalty,
          presence_penalty: mergedConfig.presence_penalty,
          stream: true,
        }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming LLM:', error);
      throw error;
    }
  },

  // 批量调用模型
  async batchCall(
    requests: Array<{
      messages: Message[];
      model?: ModelType;
      config?: Partial<ModelConfig>;
    }>
  ): Promise<string[]> {
    const results = await Promise.all(
      requests.map(req => 
        this.callModel(req.messages, req.model, req.config)
          .catch(err => {
            console.error('Batch call error:', err);
            return '';
          })
      )
    );
    return results;
  },

  // 模型能力评估
  async evaluateModel(model: ModelType): Promise<{
    responseTime: number;
    qualityScore: number;
    tokenUsage: number;
  }> {
    const startTime = Date.now();
    
    try {
      const testMessage: Message[] = [
        { role: 'user', content: 'What is the capital of France?' }
      ];
      
      const response = await this.callModel(testMessage, model);
      const responseTime = Date.now() - startTime;
      
      // 简单的质量评估
      const qualityScore = response.includes('Paris') ? 100 : 50;
      
      // 估算token使用量
      const tokenUsage = Math.ceil((testMessage[0].content.length + response.length) / 4);
      
      return {
        responseTime,
        qualityScore,
        tokenUsage,
      };
    } catch (error) {
      console.error('Model evaluation error:', error);
      return {
        responseTime: Date.now() - startTime,
        qualityScore: 0,
        tokenUsage: 0,
      };
    }
  },
};
