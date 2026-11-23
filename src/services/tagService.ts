import { chat, fill } from './aiClient';

/**
 * 标签建议提示词 · 分类器（非人格化）
 * 翻新要点（对照旧版）：
 * 1. 明确「只能从标签池里选，不许自造」——防止模型造出池外标签
 * 2. 与用户所选维度对齐——优先从对应维度的标签里挑
 * 3. 防编造——标签必须在记录里有依据
 * 4. 安全模板注入 + system/user 分层
 * 5. 解析层加白名单过滤兜底（模型即使输出池外词也会被拦下）
 */

/** 标签池唯一真源：提示词与解析过滤共用，避免两处漂移 */
const TAG_POOL: Record<string, string[]> = {
  '心理': ['平静', '喜悦', '焦虑', '感恩', '悲伤', '期待', '失落', '愤怒', '恐惧', '孤独', '满足', '欣慰'],
  '认知': ['顿悟', '困惑', '决策', '反思', '学习', '创意', '思考', '成长', '突破', '迷茫'],
  '效率': ['完成', '计划', '拖延', '专注', '习惯', '行动', '坚持', '懈怠'],
  '社交': ['沟通', '陪伴', '冲突', '感谢', '独处', '连接', '合作', '支持', '疏远'],
  '健康': ['运动', '睡眠', '饮食', '休息', '能量', '舒适', '疲惫', '酸痛', '恢复'],
  '财务': ['收入', '支出', '理财', '消费', '节约', '投资', '预算'],
};

const ALL_TAGS = new Set(Object.values(TAG_POOL).flat());

function poolText(): string {
  return Object.entries(TAG_POOL)
    .map(([dim, tags]) => `${dim}类:${tags.join('、')}`)
    .join('\n');
}

const TAG_SUGGESTION_SYSTEM = `你是一个精确的标签分类器。你只从给定的标签池里挑选标签,绝不创造池外的新词。你只输出标签本身,不输出任何解释。`;

const TAG_SUGGESTION_USER = `【标签池 —— 只能从这里选】
{pool}

【用户记录内容】
{content}

【用户选择的维度】
{dimension}

【要求】
1. 从标签池里挑 1-3 个最贴合记录的标签,优先选与用户维度对应的那一类。
2. 每个标签都必须在记录内容里有依据,记录里没体现的不要选。
3. 只返回标签本身,用逗号分隔(例如:平静,感恩),不要编号、不要解释、不要引号。
4. 如果记录内容太短或与所有标签都不相符,就返回「日常」。`

export interface TagSuggestionResult {
  tags: string[];
}

export const tagService = {
  async suggestTags(content: string, dimension: string): Promise<string[]> {
    const prompt = fill(TAG_SUGGESTION_USER, {
      pool: poolText(),
      content,
      dimension,
    });

    const text = await chat({
      system: TAG_SUGGESTION_SYSTEM,
      user: prompt,
      maxTokens: 100,
      temperature: 0.3,
    });

    const tags = (text || '')
      .split(/[,，、\n]/)
      .map(t => t.trim().replace(/^["'「『]|["'」』]$/g, ''))
      .filter(t => t.length > 0 && (ALL_TAGS.has(t) || t === '日常'))
      .slice(0, 3);

    return tags;
  },
};
