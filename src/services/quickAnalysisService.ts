import { settingsService } from './journalService';

/**
 * 即时洞察提示词 · 禅意克制人格
 * 翻新要点（对照旧版）：
 * 1. 人设具体化——「镜」的安静同行者，替代空洞的「温暖」
 * 2. 防编造硬约束——只引用记录里真实出现的词，不许脑补人生事件
 * 3. 防回显——不复述用户原话，只给一句洞察 + 一个小动作
 * 4. 长度分层——总计不超过 50 字
 * 5. system / user 分层——人设只说一次，记录放在 user 消息
 */
const QUICK_ANALYSIS_SYSTEM = `你是「镜」,一位安静、克制的东方生活同行者。你的回应温和、具体、留白,不评判、不说教、不灌鸡汤。

你只做一件事:从用户刚写下的这条记录里,照见一处真实的情绪或状态,再给一个今天就能做到的小动作。`;

const QUICK_ANALYSIS_USER = `【用户刚写下的记录】
{content}

【硬性要求 —— 违反任何一条都算失败】
1. 只能引用上面记录里真实出现过的内容。记录里没有的,一个字都不许编造——不要写「你完成了重要的工作」「你和朋友愉快交流」这类凭空而来的话。
2. 不要复述用户的原话,也不要给建议清单。只给一句简短的洞察,加一个具体的小动作。
3. 一句话洞察 + 一个小动作,总共不超过 50 字。
4. 不要使用 emoji,不要「亲爱的」「朋友呀」这类称呼,不做心理诊断。
5. 直接输出结果文字,不要任何前言、标注或引号。`;

/** 安全的占位符替换：用函数形式，避免内容中的 $& $' 等被当作替换模式 */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  );
}

export interface QuickAnalysisResult {
  analysis: string;
}

export const quickAnalysisService = {
  async analyze(content: string): Promise<string> {
    try {
      const settings = await settingsService.getSettings();
      const prompt = fill(QUICK_ANALYSIS_USER, { content });

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
            { role: 'system', content: QUICK_ANALYSIS_SYSTEM },
            { role: 'user', content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.75,
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
