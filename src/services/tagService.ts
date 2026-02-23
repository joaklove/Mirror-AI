import { settingsService } from './journalService';

const TAG_SUGGESTION_PROMPT = `你是一个智能标签助手。根据用户的学习/工作/生活记录，从以下标签池中推荐最合适的1-3个标签：

心理/情绪类：平静、喜悦、焦虑、感恩、悲伤、期待、失落、愤怒、恐惧、孤独、满足、欣慰
认知/思维类：顿悟、困惑、决策、反思、学习、创意、思考、成长、突破、迷茫
效率/行动类：完成、计划、拖延、专注、习惯、突破、行动、坚持、懈怠
社交/关系类：沟通、陪伴、冲突、感谢、独处、连接、合作、支持、疏远
健康/身体类：运动、睡眠、饮食、休息、能量、舒适、疲惫、酸痛、恢复
财务/资源类：收入、支出、理财、消费、节约、投资、预算

用户记录内容：
{content}

用户选择的维度：{dimension}

请直接返回标签列表，用逗号分隔，不需要其他解释。`;

export interface TagSuggestionResult {
  tags: string[];
}

export const tagService = {
  async suggestTags(content: string, dimension: string): Promise<string[]> {
    try {
      const settings = await settingsService.getSettings();
      
      const prompt = TAG_SUGGESTION_PROMPT
        .replace('{content}', content)
        .replace('{dimension}', dimension);

      const response = await fetch(`${settings?.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings?.apiKey || ''}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mirror AI',
        },
        body: JSON.stringify({
          model: settings?.model || 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个智能标签助手，只返回标签列表，用逗号分隔。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 100,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        console.error('AI tag suggestion failed:', response.status);
        return [];
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      
      const tags = text
        .split(/[,，、]/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 3);
      
      return tags;
    } catch (error) {
      console.error('Error suggesting tags:', error);
      return [];
    }
  },
};
