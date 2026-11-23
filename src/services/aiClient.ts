import { settingsService } from './journalService';

/**
 * 统一 AI 调用客户端。
 * 阶段 0 地基：把晨报 / 即时洞察 / 标签建议里各自复制的 fetch 逻辑收敛到一处，
 * 回声等新功能也走这里，避免配置读取、鉴权头、报错处理四处漂移。
 */

export interface AiSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatOptions {
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  /** 调用方已读好的配置，传入后不再重复查询 settings。 */
  settings?: AiSettings | null;
}

/** 安全占位符替换：用函数形式，避免内容中的 $& $' 被当作替换模式 */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  );
}

/** 读取当前用户的 AI 配置；未配置时返回 null */
export async function getAiSettings(): Promise<AiSettings | null> {
  const settings = await settingsService.getSettings();
  if (!settings?.apiKey) return null;
  return {
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl || 'https://openrouter.ai/api/v1',
    model: settings.model || 'deepseek/deepseek-chat',
  };
}

/**
 * 统一的 chat/completions 调用。
 * 返回模型文本；失败（未配置 / 网络错 / HTTP 错）返回 null，由调用方决定降级。
 */
export async function chat(options: ChatOptions): Promise<string | null> {
  const settings = options.settings !== undefined ? options.settings : await getAiSettings();
  if (!settings) return null;

  const apiKey = settings.apiKey;
  const baseUrl = settings?.baseUrl || 'https://openrouter.ai/api/v1';
  const model = settings?.model || 'deepseek/deepseek-chat';

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (options.system) messages.push({ role: 'system', content: options.system });
  messages.push({ role: 'user', content: options.user });

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: options.maxTokens ?? 500,
    temperature: options.temperature ?? 0.75,
  };
  if (options.jsonMode) body.response_format = { type: 'json_object' };

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location?.origin || '',
        'X-Title': 'Mirror AI',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('[aiClient] HTTP error:', response.status);
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('[aiClient] request failed:', error);
    return null;
  }
}

/** 解析模型返回的 JSON，兼容 ```json ... ``` 代码块与纯文本两种形态 */
export function parseJson<T = Record<string, unknown>>(raw: string): T | null {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
