import { settingsService } from './journalService';

const QUICK_ANALYSIS_PROMPT = `你是一个温暖的心理陪伴助手。请用简短的几句话，对用户的这条记录给予温暖的分析和建议：

记录内容：{content}

请直接给出简短的分析和建议，不超过50字。要温暖、有同理心，并给出积极的方向。`;

export interface QuickAnalysisResult {
  analysis: string;
}

export const quickAnalysisService = {
  async analyze(content: string): Promise<string> {
    try {
      const settings = await settingsService.getSettings();
      
      const prompt = QUICK_ANALYSIS_PROMPT.replace('{content}', content);

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
            { role: 'system', content: '你是一个温暖的心理陪伴助手，给出简短温暖的分析和建议。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error('Quick analysis failed:', response.status);
        return '';
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      
      return text.trim();
    } catch (error) {
      console.error('Error in quick analysis:', error);
      return '';
    }
  },
};
