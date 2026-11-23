/**
 * AI 服务商预设清单 —— 唯一真源
 *
 * 所有预设都是 OpenAI Chat Completions 兼容接口。
 * 代码里会拿 baseUrl 直接拼 `/chat/completions`，所以 baseUrl 一律不带尾部路径。
 * 模型名会随厂商发版变化，这里只给「建议默认值」，用户可在设置页自行修改。
 */

export interface AIProviderPreset {
  id: string;
  name: string;
  /** 一句话说明，展示在选项里 */
  note: string;
  /** OpenAI 兼容接口根地址，拼 /chat/completions 使用 */
  baseUrl: string;
  /** 建议默认模型，可被用户覆盖 */
  defaultModel: string;
  /** 申请 API Key 的页面地址 */
  keyUrl: string;
  /** 是否推荐（新用户默认选它） */
  recommended?: boolean;
}

export const AI_PROVIDER_PRESETS: AIProviderPreset[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    note: '一个 Key 通吃 500+ 模型，需充值（支付宝可用）',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'deepseek/deepseek-chat',
    keyUrl: 'https://openrouter.ai/keys',
    recommended: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek 官方',
    note: '深度求索官方，deepseek-chat 性价比高',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    note: '有免费模型 glm-4-flash，适合先试用',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  {
    id: 'qwen',
    name: '通义千问（阿里百炼）',
    note: '阿里云兼容模式，模型多、国内速度快',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    keyUrl: 'https://bailian.console.aliyun.com/#/model-market',
  },
  {
    id: 'moonshot',
    name: 'Moonshot（Kimi）',
    note: '月之暗面，长文本见长',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow',
    note: '模型聚合平台，有免费模型，国内直连',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  {
    id: 'custom',
    name: '自定义（OpenAI 兼容）',
    note: '自建服务 / 中转网关 / 其它兼容接口',
    baseUrl: '',
    defaultModel: '',
    keyUrl: '',
  },
];

/** 按接口地址反查当前选中的预设，用于回显；匹配不到则视为自定义 */
export function matchPresetByBaseUrl(baseUrl?: string | null): AIProviderPreset {
  if (!baseUrl) return AI_PROVIDER_PRESETS[AI_PROVIDER_PRESETS.length - 1];
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  const found = AI_PROVIDER_PRESETS.find((p) => {
    if (!p.baseUrl) return false;
    return p.baseUrl.replace(/\/+$/, '') === normalized;
  });
  return found ?? AI_PROVIDER_PRESETS[AI_PROVIDER_PRESETS.length - 1];
}
