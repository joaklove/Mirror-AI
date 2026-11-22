import { settingsService } from './journalService';
import type { JournalEntry } from './journalService';
import {
  buildMorningReportPrompt,
  MORNING_REPORT_SCHEMA,
  type MorningReportData,
} from '@/prompts/morningReport';
import { getSolarTerm, getShichen, getJournalStreak } from '@/lib/daoDaily';

const DIMENSION_LABELS: Record<string, string> = {
  psychology: '心理',
  cognitive: '认知',
  efficiency: '效率',
  social: '社交',
  health: '健康',
  finance: '财务',
};

/** 判断是否为本地时区意义上的「今天」 */
function isToday(timestamp: string, now: Date): boolean {
  const d = new Date(timestamp);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatEntries(entries: JournalEntry[]): string {
  return entries
    .map((e) => {
      const time = new Date(e.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const dim = e.dimension ? DIMENSION_LABELS[e.dimension] || e.dimension : '记录';
      const tags = e.tags?.length ? ` [${e.tags.join('、')}]` : '';
      return `· ${time} ${dim}${tags}: ${e.content}`;
    })
    .join('\n');
}

/** 解析模型返回，兼容 JSON 代码块 / 纯文本两种形态 */
function parseReport(raw: string): MorningReportData {
  let text = raw.trim();
  // 去掉可能的 ```json ... ``` 包裹
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  try {
    const obj = JSON.parse(text);
    return {
      greeting: String(obj.greeting || ''),
      mood: String(obj.mood || ''),
      highlights: Array.isArray(obj.highlights)
        ? obj.highlights.map((h: unknown) => String(h))
        : [],
      insight: String(obj.insight || ''),
      suggestion: String(obj.suggestion || ''),
      closing: String(obj.closing || ''),
    };
  } catch {
    // 模型没按 JSON 输出时，退化为纯文本放进 mood，保证界面不空白
    return {
      greeting: '',
      mood: text,
      highlights: [],
      insight: '',
      suggestion: '',
      closing: '',
    };
  }
}

/** 无记录 / API 未配置时的禅意降级文案（保证按钮永远有反馈） */
function fallbackReport(reason: 'empty' | 'no-key' | 'error', nickname: string): MorningReportData {
  if (reason === 'no-key') {
    return {
      greeting: `${nickname},镜在此刻映照着你。`,
      mood: '还没有连接 AI,今日晨报暂时无法生成。',
      highlights: [],
      insight: '你可以到设置里填入模型配置,之后每天都能收到专属的晨报。',
      suggestion: '现在先写下今天的第一个念头吧。',
      closing: '镜,因你的记录而清晰。',
    };
  }
  if (reason === 'error') {
    return {
      greeting: `${nickname},此刻 Signal 有些远。`,
      mood: '晨报暂时没能生成,但这不影响你书写今天。',
      highlights: [],
      insight: '连接会回来的,就像清晨的雾总会散。',
      suggestion: '稍后再试一次,或先记下此刻的心情。',
      closing: '静待云开。',
    };
  }
  return {
    greeting: `${nickname},今天还没有留下记录。`,
    mood: '空白的一天,也是一种真实的样子。',
    highlights: [],
    insight: '不必为了晨报刻意去写,只记下此刻真正想说的。',
    suggestion: '写一句此刻最朴素的心情就好。',
    closing: '一字一句,皆是镜中风景。',
  };
}

export const morningReportService = {
  async generate(
    entries: JournalEntry[],
    nickname: string
  ): Promise<MorningReportData> {
    const now = new Date();
    const todayEntries = entries
      .filter((e) => isToday(e.timestamp, now))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const settings = await settingsService.getSettings();
    if (!settings?.apiKey) {
      return fallbackReport('no-key', nickname);
    }

    const solarTerm = getSolarTerm(now);
    const shichen = getShichen(now);
    const streak = getJournalStreak(entries.map((e) => e.timestamp), now);

    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`;

    const prompt = buildMorningReportPrompt({
      date: dateStr,
      nickname,
      shichen: `${shichen.name} · ${shichen.phrase}`,
      solarTerm: `${solarTerm.name} · ${solarTerm.phrase}`,
      streak,
      entries: formatEntries(todayEntries),
    });

    try {
      const response = await fetch(
        `${settings.baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Mirror AI',
          },
          body: JSON.stringify({
            model: settings.model || 'deepseek/deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.75,
            max_tokens: 700,
          }),
        }
      );

      if (!response.ok) {
        console.error('Morning report failed:', response.status);
        return fallbackReport('error', nickname);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      if (!content) return fallbackReport('error', nickname);

      return parseReport(content);
    } catch (error) {
      console.error('Error in morning report:', error);
      return fallbackReport('error', nickname);
    }
  },
};

export type { MorningReportData } from '@/prompts/morningReport';
export { MORNING_REPORT_SCHEMA };
